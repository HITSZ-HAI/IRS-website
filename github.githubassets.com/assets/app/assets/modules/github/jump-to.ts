// Disable camel-case rule to allow for easy batch updates via `updateCurrentEventPayload`.

import {
  activateSearchField,
  deactivateSearchField,
  hideDropdown,
  showDropdown,
  updateSearchEntries,
} from './jump-to/render'

import {getSuggestionsRequestData, parseSuggestionsResponse, updateSearchURL} from './jump-to/model'
import {isJumpToAvailable, populateDropdown} from './jump-to/controller'
import {activate as navigationActivate, focus as navigationFocus} from './navigation'
import {trackJumpToEvent, trackSelection, updateCurrentEventPayload} from './jump-to/tracking'
import type {Suggestion} from './jump-to/model'
import {debounce} from '@github/mini-throttle'

import findNextElementSibling from './find-next-element-sibling'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {onFocus} from './onfocus'
import {requestSubmit} from '@github-ui/form-utils'
import memoize from '@github/memoize'
import {reportTraceData} from '@github-ui/api-insights'

let asyncSuggestions: Promise<Suggestion[]> | null

// Preloads suggestion data and registers input listener on initial page load.
observe('.js-jump-to-field', {
  constructor: HTMLInputElement,
  add(field) {
    field.addEventListener(
      'input',
      debounce(async function () {
        updateSearchEntries(field)
        enableNavigation(field)
        populateDropdown(field, await asyncSuggestions!)
      }, 100),
    )

    // Show suggestions when the input was focused before the script loaded.
    if (document.activeElement && document.activeElement === field) {
      onJumpToFocus(field)
    }
  },
})

const MAX_PAGE_VIEWS_TO_SEND_TO_SERVER = 10

const suggestionsCache = new Map()
export function clearSuggestionsCache() {
  suggestionsCache.clear()
}

async function fetchSuggestions(url: string, token: string): Promise<Suggestion[]> {
  const data = getSuggestionsRequestData(MAX_PAGE_VIEWS_TO_SEND_TO_SERVER)
  data.set('_method', 'GET') // Allow this request to be treated as a GET and query DB replica

  let result: Suggestion[] = []

  const fetchUrl = new URL(url, window.location.origin)

  if (location.search.match(/_tracing=true/)) {
    fetchUrl.searchParams.set('graphql_query_trace', 'true')
  }

  const response = await fetch(fetchUrl.href, {
    method: 'POST',
    mode: 'same-origin',
    body: data,
    headers: {
      Accept: 'application/json',
      'Scoped-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  if (response.ok) {
    const jsonResponse = await response.json()
    reportTraceData(jsonResponse)
    result = parseSuggestionsResponse(jsonResponse)
  }

  // Hack to inject custom commands
  const hiddenSearchCommandsInput = document.querySelector('.js-search-commands')
  if (hiddenSearchCommandsInput instanceof HTMLInputElement) {
    const jsonString = hiddenSearchCommandsInput.value
    let parsedSearchCommands = []
    try {
      parsedSearchCommands = JSON.parse(jsonString).commands
    } catch (error) {
      // noop
    }
    result = result.concat(parsedSearchCommands)
  }

  return result
}

let fetchSuggestionsLastUsedAt = 0
const memoizedFetchSuggestions = memoize(fetchSuggestions, {cache: suggestionsCache})

// Fetch entire list of possible suggestions from the server.
export async function getSuggestions(field: HTMLElement): Promise<Suggestion[]> {
  const url = field.getAttribute('data-jump-to-suggestions-path')
  if (!url) throw new Error('could not get jump to suggestions path')
  const token = findNextElementSibling(field, 'js-data-jump-to-suggestions-path-csrf') as HTMLInputElement
  if (!token) return []

  // We don't want to fetch the same results more than once, but we also don't want to use stale results, so we forget the whole cache after 5 sec.
  // Expiring each entry separately would be overkill for this simple case
  if (Date.now() - fetchSuggestionsLastUsedAt > 5000) {
    clearSuggestionsCache()
  }
  fetchSuggestionsLastUsedAt = Date.now()
  return memoizedFetchSuggestions(url, token.value)
}

async function onJumpToFocus(el: HTMLElement) {
  const field = el as HTMLInputElement
  activateSearchField(field)
  showDropdown(field)

  if (!asyncSuggestions) {
    asyncSuggestions = getSuggestions(field)
  }

  updateSearchEntries(field)
  enableNavigation(field)
  populateDropdown(field, await asyncSuggestions)
}
onFocus('.js-jump-to-field', onJumpToFocus)

// Handles selection events (via the Enter key) or dismissal of the suggestions menu (via the Esc key).
on('navigation:keydown', '.js-site-search-form', function (event) {
  const selection = event.currentTarget.querySelector('.js-navigation-item.navigation-focus')
  switch (event.detail.hotkey) {
    case 'Enter':
      if (!selection) {
        // If there is no selection, submit the search form.
        const form = event.currentTarget as HTMLFormElement
        requestSubmit(form)
      } else {
        // Otherwise, track the selection event.
        trackSelection(selection.querySelector<HTMLElement>('.js-jump-to-suggestion-path')!)
      }
      break
    case 'Escape':
      // eslint-disable-next-line github/no-blur
      event.currentTarget.querySelector<HTMLInputElement>('.js-jump-to-field')!.blur()
      hideDropdown()
      break
  }
})

on('navigation:focus', '.js-site-search-form', function (event) {
  const field = document.querySelector<HTMLInputElement>('.js-jump-to-field')!
  const id = (event.target as Element).id
  const container = (event.target as Element).closest<HTMLElement>('.js-jump-to-suggestions-results-container')!
  for (const item of container.querySelectorAll('.js-navigation-item')) {
    item.setAttribute('aria-selected', (event.target === item).toString())
  }
  field.setAttribute('aria-activedescendant', id)
})

// ensures that the dropdown stays open if any child element of jump-to as a whole
// has focus, this allows screenreaders to navigate the list
let timeout: number | null = null
on('focusout', '.js-jump-to', function () {
  const field = document.querySelector<HTMLInputElement>('.js-jump-to-field')!
  timeout = window.setTimeout(() => {
    deactivateSearchField(field)
    hideDropdown()
  }, 200)
})

on('focusin', '.js-jump-to', function () {
  if (timeout) window.clearTimeout(timeout)
  const field = document.querySelector<HTMLInputElement>('.js-jump-to-field')!
  showDropdown(field)
})

// Handle selecting an item from the suggestion list
on('click', '.js-jump-to-suggestion-path', function (event) {
  const link = event.currentTarget as HTMLAnchorElement

  // Ensure we have an up-to-date search q param on the search suggestion link on click
  if (link.getAttribute('data-target-type') === 'Search') {
    const inputField = document.querySelector<HTMLInputElement>('.js-jump-to-field')!
    link.href = updateSearchURL(inputField.value.trim(), link.href)
  }

  // Track click events
  trackSelection(link)
})

on('submit', '.js-site-search-form', function (event) {
  if (!isJumpToAvailable()) {
    return
  }

  const form = event.target as Element
  if (form.getAttribute('data-scoped-search-url')) {
    updateCurrentEventPayload({})
  }
  trackJumpToEvent('search')
})

function enableNavigation(field: HTMLInputElement) {
  const queryText = field.value.trim()
  const resultsContainer = document.querySelector<HTMLElement>('.js-jump-to-suggestions-results-container')!

  if (queryText) {
    navigationFocus(resultsContainer)
  } else {
    navigationActivate(resultsContainer)
  }
}
