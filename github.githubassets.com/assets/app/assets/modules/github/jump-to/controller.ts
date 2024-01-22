import {getPageViewsMap, scorer} from './page-views'
import {trackJumpToEvent, updateCurrentEventPayload} from './tracking'
import type {PageViews} from './page-views'
import type {Suggestion} from './model'
import {filterSuggestions} from './filtering'
import {updateDropdown} from './render'

// Reports whether or not the Jump To feature is available in the current context.
//
// At present Jump To is only available to logged-in users who are not on a mobile device. In those
// situations, the `.js-jump-to-field` class is inserted into the markup on the appropriate element.
//
// TODO Split the site search behavior and jump-to behavior into isolated components so site search
// module behavior isn't partially disabled based on this state.
export function isJumpToAvailable(): boolean {
  return !!document.querySelector('.js-jump-to-field')
}

export function populateDropdown(field: HTMLInputElement, suggestions: Suggestion[]): void {
  const query = field.value.trim()
  const matchingSuggestions = rank(filterSuggestions(suggestions, query, window.location.pathname), getPageViewsMap())
  const suggestionsToDisplay = matchingSuggestions.slice(0, 7)

  updateCurrentEventPayload({
    result_count: matchingSuggestions.length.toString(),
    display_count: suggestionsToDisplay.length.toString(),
    filter_count: (suggestions.length - matchingSuggestions.length).toString(),
    query,
    display_set: JSON.stringify(suggestionsToDisplay.map(s => [s.type, s.databaseId])),
  })

  updateDropdown(field, query, suggestionsToDisplay)
  trackJumpToEvent('menu-activation') || trackJumpToEvent('query')
}

function rank(suggestions: Suggestion[], pageViews: PageViews): Suggestion[] {
  const scorePage = scorer(pageViews)
  return suggestions.sort((a, b) => scorePage(b.pageKey) - scorePage(a.pageKey))
}
