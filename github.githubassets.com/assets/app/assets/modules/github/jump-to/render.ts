import type {Suggestion} from './model'
import {buildSearchURL} from './model'
import {fuzzyHighlightElement} from '../fuzzy-filter'
import {trackJumpToEvent} from './tracking'

export function activateSearchField(field: HTMLElement) {
  field.classList.add('js-navigation-enable')
  field.classList.add('jump-to-field-active')
  field.parentElement?.classList.add('search-wrapper-suggestions-active')
}

export function deactivateSearchField(field: HTMLElement) {
  field.classList.remove('js-navigation-enable')
  field.classList.remove('jump-to-field-active')
  field.parentElement?.classList.remove('search-wrapper-suggestions-active')
}

export function showDropdown(field: HTMLElement) {
  /* eslint-disable-next-line github/no-d-none */
  document.querySelector<HTMLElement>('.js-jump-to-suggestions-container')?.classList.remove('d-none')
  field.classList.add('jump-to-dropdown-visible')

  document.querySelector<HTMLElement>('.js-jump-to-field')?.setAttribute('aria-expanded', 'true')
}

export function hideDropdown() {
  /* eslint-disable-next-line github/no-d-none */
  document.querySelector<HTMLElement>('.js-jump-to-suggestions-container')?.classList.add('d-none')
  const inputField = document.querySelector<HTMLElement>('.js-jump-to-field')

  inputField?.classList.remove('jump-to-dropdown-visible')
  inputField?.setAttribute('aria-expanded', 'false')
  trackJumpToEvent('menu-deactivation')
}

export function updateSearchEntries(field: HTMLInputElement) {
  const form = field.form
  const resultsContainer = document.querySelector<HTMLElement>('.js-jump-to-suggestions-results-container')
  const queryText = field.value.trim()
  const isScoped = !!(field.form && field.form.getAttribute('data-scope-type'))
  const hasOwnerScope = (field.form && field.form.getAttribute('data-scope-type')) === 'Repository'
  const existingScopedSearch = resultsContainer?.querySelector<HTMLElement>('.js-jump-to-scoped-search')
  const existingOwnerScopedSearch = resultsContainer?.querySelector<HTMLElement>('.js-jump-to-owner-scoped-search')
  const existingGlobalSearch = resultsContainer?.querySelector<HTMLElement>('.js-jump-to-global-search')

  // hide scoped search if no query text or not a scoped page
  /* eslint-disable-next-line github/no-d-none */
  existingScopedSearch?.classList.toggle('d-none', !queryText || !isScoped)
  if (existingOwnerScopedSearch) {
    /* eslint-disable-next-line github/no-d-none */
    existingOwnerScopedSearch.classList.toggle('d-none', !queryText || !hasOwnerScope)
  }
  // hide global search if no query text
  /* eslint-disable-next-line github/no-d-none */
  existingGlobalSearch?.classList.toggle('d-none', !queryText)

  // update scoped search entry if we are showing it
  if (queryText && isScoped) {
    const searchPath = form?.getAttribute('action')
    const updatedScopedSearch = updateSearchEntry(
      existingScopedSearch ? existingScopedSearch : new HTMLElement(),
      queryText,
      buildSearchURL(searchPath ? searchPath : '', queryText),
      true,
      false,
    )
    resultsContainer?.replaceChild(updatedScopedSearch, existingScopedSearch ? existingScopedSearch : new HTMLElement())
  }

  if (existingOwnerScopedSearch) {
    if (queryText && isScoped) {
      const searchPath = form?.getAttribute('data-owner-scoped-search-url')
      const updatedOwnerScopedSearch = updateSearchEntry(
        existingOwnerScopedSearch,
        queryText,
        buildSearchURL(searchPath ? searchPath : '', queryText),
        true,
        true,
      )
      resultsContainer?.replaceChild(updatedOwnerScopedSearch, existingOwnerScopedSearch)
    }
  }

  // update global search
  if (queryText) {
    const unscopedSearchPath = form?.getAttribute('data-unscoped-search-url')
    const updatedGlobalSearch = updateSearchEntry(
      existingGlobalSearch ? existingGlobalSearch : new HTMLElement(),
      queryText,
      buildSearchURL(unscopedSearchPath ? unscopedSearchPath : '', queryText),
      false,
      false,
    )
    resultsContainer?.replaceChild(updatedGlobalSearch, existingGlobalSearch ? existingGlobalSearch : new HTMLElement())
  }
}

export function updateDropdown(field: HTMLInputElement, queryText: string, suggestionsToDisplay: Suggestion[]) {
  const form = field.form
  if (!form) return

  const template = getTemplateElement('.js-jump-to-suggestions-template-container')
  const results = document.createDocumentFragment()

  if (suggestionsToDisplay.length < 1 && !queryText) {
    displayNoResults()
  } else {
    for (const [i, suggestion] of suggestionsToDisplay.entries()) {
      results.appendChild(fillTemplate(template, suggestion, queryText, i))
    }

    replaceSuggestions(results)
  }
}

function isUserLoggedIn(): boolean {
  return Boolean(document.head?.querySelector<HTMLMetaElement>('meta[name="user-login"]')?.content)
}

function displayNoResults() {
  if (!isUserLoggedIn()) {
    return
  }

  const template = getTemplateElement('.js-jump-to-no-results-template-container')

  const noResults = template.cloneNode(true)
  if (noResults instanceof HTMLElement) {
    /* eslint-disable-next-line github/no-d-none */
    noResults.classList.remove('d-none')
  }

  replaceSuggestions(noResults)
}

function replaceSuggestions(newSuggestions: Node) {
  const resultsContainer = document.querySelector<HTMLElement>('.js-jump-to-suggestions-results-container')

  if (resultsContainer) {
    for (const oldResult of resultsContainer.querySelectorAll('.js-jump-to-suggestion')) {
      oldResult.parentNode?.removeChild(oldResult)
    }

    resultsContainer.appendChild(newSuggestions)
  }
}

function showSuggestionOcticon(el: HTMLElement, octiconSelector: string) {
  const octiconContainer = el.querySelector<HTMLElement>('.js-jump-to-octicon')
  const octicon = octiconContainer?.querySelector<SVGElement>(octiconSelector)
  /* eslint-disable-next-line github/no-d-none */
  octiconContainer?.classList.remove('d-none')
  /* eslint-disable-next-line github/no-d-none */
  octicon?.classList.remove('d-none')
}

function updateSearchEntry(
  element: HTMLElement,
  queryText: string,
  href: string,
  isScoped: boolean,
  isOwnerScoped: boolean,
): HTMLElement {
  const el = element.cloneNode(true) as HTMLElement

  if (isScoped) {
    el.id = `jump-to-suggestion-search-${isOwnerScoped ? 'scoped-owner' : 'scoped'}`
  } else {
    el.id = `jump-to-suggestion-search-global`
  }

  const anchor = el.querySelector<HTMLAnchorElement>('.js-jump-to-suggestion-path')
  if (anchor) {
    anchor.href = href
    anchor.setAttribute('data-target-type', 'Search')
  }

  const nameElement = el.querySelector<HTMLElement>('.js-jump-to-suggestion-name')
  if (nameElement) {
    nameElement.textContent = queryText
    nameElement.setAttribute('aria-label', queryText)
  }

  showSuggestionOcticon(el, '.js-jump-to-octicon-search')

  const badgeEl = el.querySelector<HTMLElement>('.js-jump-to-badge-search')
  if (badgeEl) {
    /* eslint-disable-next-line github/no-d-none */
    badgeEl.classList.remove('d-none')
    if (isScoped) {
      /* eslint-disable-next-line github/no-d-none */
      badgeEl.querySelector<HTMLElement>('.js-jump-to-badge-search-text-default')?.classList.remove('d-none')
    } else {
      /* eslint-disable-next-line github/no-d-none */
      badgeEl.querySelector<HTMLElement>('.js-jump-to-badge-search-text-global')?.classList.remove('d-none')
    }
  }

  return el
}

function fillTemplate(
  template: HTMLElement,
  suggestion: Suggestion,
  queryText: string,
  clientRank: number,
): HTMLElement {
  const el = template.cloneNode(true) as HTMLElement
  el.id = `jump-to-suggestion-${suggestion.type.toLowerCase()}-${suggestion.databaseId}`

  const anchor = el.querySelector<HTMLAnchorElement>('.js-jump-to-suggestion-path')
  if (anchor) {
    anchor.href = suggestion.path
    anchor.setAttribute('data-target-type', suggestion.type)

    anchor.setAttribute('data-target-id', `${suggestion.databaseId}`)
    anchor.setAttribute('data-client-rank', `${clientRank}`)
    anchor.setAttribute('data-server-rank', `${suggestion.rank}`)
  }

  const nameElement = el.querySelector<HTMLElement>('.js-jump-to-suggestion-name')
  if (nameElement) {
    nameElement.textContent = suggestion.name
    // set this because the element fuzzyhighlighting confuses screenreaders
    nameElement.setAttribute('aria-label', suggestion.name)
  }

  fuzzyHighlightElement(nameElement ? nameElement : new Element(), queryText.replace(/\s/g, ''))

  switch (suggestion.type) {
    case 'Team': {
      const avatar = el.querySelector<HTMLImageElement>('.js-jump-to-suggestion-avatar')
      if (avatar) {
        avatar.alt = suggestion.name
        avatar.src = suggestion.avatarUrl ? suggestion.avatarUrl : ''
        /* eslint-disable-next-line github/no-d-none */
        avatar.classList.remove('d-none')
      }
      break
    }
    case 'Project':
      showSuggestionOcticon(el, '.js-jump-to-octicon-project')
      break
    case 'Repository':
      showSuggestionOcticon(el, '.js-jump-to-octicon-repo')
      break
  }

  const badgeEl = el.querySelector<HTMLElement>('.js-jump-to-badge-jump')
  /* eslint-disable-next-line github/no-d-none */
  badgeEl?.classList.remove('d-none')

  return el
}

function getTemplateElement(templateContainerSelector: string): HTMLElement {
  const suggestionsContainer = document.querySelector<HTMLElement>('.js-jump-to-suggestions-container')
  return suggestionsContainer?.querySelector<HTMLElement>(templateContainerSelector)?.firstElementChild as HTMLElement
}
