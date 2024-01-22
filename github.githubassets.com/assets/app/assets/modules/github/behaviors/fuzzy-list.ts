import FuzzyListElement from '../fuzzy-list-element'
import {announce} from '@github-ui/aria-live'
import {fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

function noticeHandler(event: Event) {
  if (!(event instanceof CustomEvent)) return
  announce(`${event.detail} results found.`)
}

observe('fuzzy-list', {
  constructor: FuzzyListElement,
  subscribe: fuzzyList => fromEvent(fuzzyList, 'fuzzy-list-sorted', noticeHandler),
})
