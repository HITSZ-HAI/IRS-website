// Toggle hidden attribute on elements inside <include-fragment> and
// <poll-include-fragment> elements that have the data-hide-on-error and
// data-show-on-error attributes on them when error events are fired.

import {compose, fromEvent} from '@github-ui/subscription'
import type IncludeFragmentElement from '@github/include-fragment-element'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

observe('include-fragment, poll-include-fragment', {
  subscribe: el => compose(fromEvent(el, 'error', onError), fromEvent(el, 'loadstart', onLoad)),
})

on('click', 'include-fragment button[data-retry-button]', ({currentTarget}) => {
  const includeFragment = currentTarget.closest<IncludeFragmentElement>('include-fragment')!

  // The refetch API was added in v6.1.1 of @github/include-fragment-element:
  // https://github.com/github/include-fragment-element/releases/tag/v6.1.1
  includeFragment.refetch()
})

function toggleElements(event: Event, showError: boolean) {
  const fragment = event.currentTarget
  if (!(fragment instanceof Element)) return

  for (const el of fragment.querySelectorAll('[data-show-on-error]')) {
    if (el instanceof HTMLElement) el.hidden = !showError
  }
  for (const el of fragment.querySelectorAll('[data-hide-on-error]')) {
    if (el instanceof HTMLElement) el.hidden = showError
  }
}

function onLoad(event: Event) {
  toggleElements(event, false)
}

function onError(event: Event) {
  toggleElements(event, true)
}

export function loadDeferredContentByEvent({currentTarget}: Event) {
  if (!(currentTarget instanceof Element)) return

  loadDeferredContent(currentTarget)
}

export function loadDeferredContent(element: Element) {
  const details = element.closest<HTMLElement>('details')
  if (details) {
    setIncludeFragmentSrc(details)
  }
}

function setIncludeFragmentSrc(detailsElement: HTMLElement) {
  const url = detailsElement.getAttribute('data-deferred-details-content-url')
  if (url) {
    detailsElement.removeAttribute('data-deferred-details-content-url')
    const includeFragmentElement = detailsElement.querySelector<IncludeFragmentElement>(
      'include-fragment, poll-include-fragment',
    )
    if (includeFragmentElement) {
      includeFragmentElement.src = url
    }
  }
}
