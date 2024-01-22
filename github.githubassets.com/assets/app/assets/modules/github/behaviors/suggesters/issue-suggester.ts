import {compare, fuzzyScore} from '../../fuzzy-filter'
import {compose, fromEvent} from '@github-ui/subscription'
import {html, render, unsafeHTML} from '@github-ui/jtml-shimmed'

import type TextExpanderElement from '@github/text-expander-element'
import {filterSort} from '../../filter-sort'
import memoize from '@github/memoize'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {parseHTML} from '@github-ui/parse-html'
import {isFeatureEnabled} from '@github-ui/feature-flags'

// Structure of the JSON data returned by the suggester endpoint.
interface Data {
  suggestions: SuggestionData[]
  icons: Icons
}

// Limited subset of the JSON Data returned by the suggester that matches a user's current query prefix.
interface SearchResults {
  matches: SuggestionData[]
  icons: Icons
}

interface SuggestionData {
  id: number
  number: number
  title: string
  type: string
}

interface Icons {
  [key: string]: string
}

// Maximum number of results in the intial batch of results fetched by cachedJSON. If there are exactly this many
// results for the suggester, then the repository almost certainly has more that are not included. This should be
// kept in sync with:
// - `SUGGESTION_LIMIT` constant in packages/collaboration/app/models/suggester/repository_suggester.rb
// - `SUGGESTION_LIMIT` in packages/issues/app/models/issue.rb
// - `SUGGESTION_LIMIT` in packages/discussions/app/models/discussion.rb
const REFINED_QUERY_THRESHOLD = 1000

// The minimum number of characters required to trigger a follow-up "refined" query.
const REFINED_QUERY_PREFIX_SIZE = 3

// The number of previous "refined" query results to cache.
const REFINED_QUERY_CACHE_SIZE = 5

// The maximum number of suggester results to display at once.
const SEARCH_RESULTS_MAX = 5

function asText(item: SuggestionData): string {
  return `${item.number} ${item.title.trim().toLowerCase()}`
}

function search(items: SuggestionData[], query: string): SuggestionData[] {
  if (!query) return items
  const re = new RegExp(`\\b${escapeRegExp(query)}`)
  const hashedScore = /^\d+$/.test(query)
    ? (text: string) => issueNumberScore(text, re)
    : (text: string) => fuzzyScore(text, query)
  const key = (item: SuggestionData) => {
    const text = asText(item)
    const score = hashedScore(text)
    return score > 0 ? {score, text} : null
  }
  return filterSort(items, key, compare)
}

function escapeRegExp(regex: string): string {
  return regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Returns a score that gets higher as the query that matches a number starting
// on a word boundary is found earlier in the string.
function issueNumberScore(text: string, query: RegExp): number {
  const score = text.search(query)
  if (score > -1) {
    return 1000 - score
  } else {
    return 0
  }
}

// Apply the search function to JSON data acquired from the suggester endpoint. Return a (possibly empty) subset of
// that data that matches the user's current suggester query, up to a maximum of SEARCH_RESULTS_MAX, ordered by
// match quality.
function searchWithin(data: Data, query: string): SearchResults {
  const matches = search(data.suggestions, query).slice(0, SEARCH_RESULTS_MAX)
  return {matches, icons: data.icons}
}

function renderResults(issues: SuggestionData[], container: HTMLElement, icons: Icons, query = ''): void {
  const itemsTemplate = (items: SuggestionData[]) => html`
    <ul
      role="listbox"
      class="suggester-container suggester suggestions list-style-none position-absolute"
      data-query="${query}"
    >
      ${items.map(itemTemplate)}
    </ul>
  `

  const itemTemplate = (item: SuggestionData) => {
    const icon = item.type in icons ? parseHTML(document, icons[item.type]!) : ''
    return html`
      <li class="markdown-title" role="option" id="suggester-issue-${item.id}" data-value="${item.number}">
        <span class="d-inline-block mr-1">${icon}</span>
        <small>#${item.number}</small> ${
          // eslint-disable-next-line no-restricted-syntax
          unsafeHTML(item.title)
        }
      </li>
    `
  }

  render(itemsTemplate(issues), container)
}

observe('text-expander[data-issue-url]', {
  subscribe: el => {
    const subscriptions = [
      fromEvent(el, 'text-expander-change', onchange),
      fromEvent(el, 'text-expander-value', onvalue),
      fromEvent(el, 'keydown', onkeydown),
      fromEvent(el, 'click', onclick),
    ]

    return compose(...subscriptions)
  },
})

function onvalue(event: Event) {
  const detail = (event as CustomEvent).detail
  if (detail.key !== '#') return
  const value = detail.item.getAttribute('data-value')!
  detail.value = `#${value}`
}

function onchange(event: Event) {
  const {key, provide, text} = (event as CustomEvent).detail
  if (key !== '#') return
  if (text === '#') {
    hideSuggestions(event.target)
    return
  }

  const menu = event.target as Element
  const url = menu.getAttribute('data-issue-url')!
  provide(issueMenu(url, text, menu))
}

function hideSuggestions(target: EventTarget | null) {
  if (!target) return

  const textExpander = (target as HTMLElement).closest('text-expander') as TextExpanderElement
  if (textExpander) {
    textExpander.dismiss()
  }
}

function onclick(event: Event) {
  hideSuggestions(event.target)
}

function onkeydown(event: Event) {
  const specialKeys = ['ArrowRight', 'ArrowLeft']
  const {key} = event as KeyboardEvent
  if (specialKeys.indexOf(key) < 0) return

  hideSuggestions(event.target)
}

async function issueMenu(
  url: string,
  query: string,
  menu: Element,
): Promise<{fragment: HTMLElement; matched: boolean}> {
  const searchResults = await queryResults(url, query, menu)

  const list = document.createElement('div')
  renderResults(searchResults.matches, list, searchResults.icons, query)
  const root = list.firstElementChild as HTMLElement
  return {fragment: root, matched: searchResults.matches.length > 0}
}

// Track which query prefixes have already triggered refined query requests, but have not returned results yet.
const queriesInProgress = new Set<string>()

// Cache the most recent REFINED_QUERY_CACHE_SIZE refined query results, keyed by query prefix.
const queryCache = new Map<string, Data>()

// Identify the most appropriate collection of suggester data given the current query and return promise that resolves
// to SearchResults containing the result of applying the query to that data.
//
// If the query is shorter than REFINED_QUERY_PREFIX_SIZE, use cached data of the most recently updated 1k issues,
// pull requests, and discussions for this repository.
//
// If the query is at least REFINED_QUERY_PREFIX_SIZE characters long and the query's prefix does not currently have
// cached data available, trigger a refined query request if one is not already running, then search within the cached
// data of the most recently updated 1k as an interim. When the refined query request's response arrives, the menu
// will be replaced if the active query still has this prefix.
//
// If the query is at least REFINED_QUERY_PREFIX_SIZE characters long and the query's prefix has cached data
// available, use those cached data to construct the search results.
async function queryResults(url: string, query: string, menu: Element | null): Promise<SearchResults> {
  const basicResults = await cachedJSON<Data>(url)
  const basicSearchResults = searchWithin(basicResults, query)

  if (query.length < REFINED_QUERY_PREFIX_SIZE || basicResults.suggestions.length < REFINED_QUERY_THRESHOLD) {
    return basicSearchResults
  }

  let prefix = query.slice(0, REFINED_QUERY_PREFIX_SIZE)

  // Elastic Search does not support partial match on an Integer field
  // as a workaround for number queries we will query for every size
  if (isFeatureEnabled('REPOSITORY_SUGGESTER_ELASTIC_SEARCH') && Number.isFinite(Number(query))) {
    prefix = query
  }

  const refinedResults = queryCache.get(prefix)
  if (refinedResults) {
    return searchWithin(refinedResults, query)
  }

  if (!queriesInProgress.has(prefix)) {
    queriesInProgress.add(prefix)
    const refinedPromise = refinedQuery(url, prefix, menu)
    if (basicSearchResults.matches.length === 0) {
      const deferredRefinedResults = await refinedPromise
      return searchWithin(deferredRefinedResults, query)
    }
  }

  return searchWithin(basicResults, query)
}

// Query dotcom for a list of suggestion results that match the given query prefix. This appends a `?q=` query
// parameter to the normal issue suggestions URL.
//
// When the response arrives, updates queryCache with the new results. If a non-null `menu` element is provided and
// the current suggestions menu within it is still showing results for a query with the same prefix, the menu's
// options will be updated live to show suggestions from the refined query results, instead. Any active selection
// within the menu will be preserved in the new menu contents.
async function refinedQuery(url: string, prefix: string, menu: Element | null): Promise<Data> {
  const refinedQueryUrl = new URL(url, window.location.origin)
  refinedQueryUrl.searchParams.set('q', prefix)

  const data: Data = await jsonRequest(refinedQueryUrl.toString())

  queryCache.set(prefix, data)
  queriesInProgress.delete(prefix)

  // Evict cached query results, oldest first, to bring us down to the cache limit.
  if (queryCache.size > REFINED_QUERY_CACHE_SIZE) {
    const overage = queryCache.size - REFINED_QUERY_CACHE_SIZE
    const oldestKeys = Array.from(queryCache.keys()).slice(0, overage)
    for (const key of oldestKeys) {
      queryCache.delete(key)
    }
  }

  // Replace live suggestions if still visible, preserving any active selection
  const liveSuggestions = menu?.querySelector<HTMLElement>('ul.suggestions')
  const liveQuery = liveSuggestions?.getAttribute('data-query')

  if (liveSuggestions && liveQuery?.startsWith(prefix)) {
    const selectedID = menu?.querySelector<Element>('[aria-activedescendant]')?.getAttribute('aria-activedescendant')

    const list = document.createElement('div')
    const results = searchWithin(data, liveQuery)
    renderResults(results.matches, list, results.icons)
    if (selectedID) {
      for (const selectedElement of list.querySelectorAll(`#${selectedID}`)) {
        selectedElement.setAttribute('aria-selected', 'true')
      }
    }

    const root = list.firstElementChild as HTMLElement
    liveSuggestions.replaceChildren(...root.children)
  }

  return data
}

async function jsonRequest<T>(url: RequestInfo): Promise<T> {
  const response = await self.fetch(url, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    const responseError = new Error()
    const statusText = response.statusText ? ` ${response.statusText}` : ''
    responseError.message = `HTTP ${response.status}${statusText}`
    throw responseError
  }
  return response.json()
}

const cachedJSON = memoize(jsonRequest)
