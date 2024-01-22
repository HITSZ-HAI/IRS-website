import {compose, fromEvent} from '@github-ui/subscription'
import IncludeFragmentElement from '@github/include-fragment-element'
import hashChange from './hash-change'
import {loadDeferredContentByEvent} from './include-fragment'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

let currentlyOpenedDetailsDropdown: HTMLElement | null = null

document.addEventListener('keydown', function (event: KeyboardEvent) {
  // TODO: Refactor to use data-hotkey
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (!event.defaultPrevented && event.key === 'Escape' && currentlyOpenedDetailsDropdown) {
    currentlyOpenedDetailsDropdown.removeAttribute('open')
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
})

// Dismiss open <details> when activating <details> with keyboard.
observe('.js-dropdown-details', {
  subscribe: el => {
    return compose(fromEvent(el, 'toggle', closeCurrentDetailsDropdown), fromEvent(el, 'toggle', autofocus))
  },
})

function autofocus({currentTarget}: Event) {
  const target = currentTarget as HTMLElement
  if (target.hasAttribute('open')) {
    const element = target.querySelector<HTMLElement>('[autofocus]')
    if (element) element.focus()
  } else {
    const summary = target.querySelector<HTMLElement>('summary')
    if (summary) summary.focus()
  }
}

function closeCurrentDetailsDropdown({currentTarget}: Event) {
  const target = currentTarget as HTMLElement
  if (target.hasAttribute('open')) {
    if (currentlyOpenedDetailsDropdown && currentlyOpenedDetailsDropdown !== target) {
      currentlyOpenedDetailsDropdown.removeAttribute('open')
    }

    currentlyOpenedDetailsDropdown = target
  } else if (target === currentlyOpenedDetailsDropdown) {
    currentlyOpenedDetailsDropdown = null
  }
}

observe('[data-deferred-details-content-url]:not([data-details-no-preload-on-hover])', {
  subscribe: el => {
    const summary = el.querySelector<HTMLElement>('summary')!
    return fromEvent(summary, 'mouseenter', loadDeferredContentByEvent)
  },
})

observe('[data-deferred-details-content-url]', {
  subscribe: el => {
    return fromEvent(el, 'toggle', loadDeferredContentByEvent)
  },
})

export function toggleDetails(details: HTMLElement) {
  if (details.hasAttribute('open')) {
    details.removeAttribute('open')
  } else {
    details.setAttribute('open', 'open')
  }
}

// Additonal button trigger for <details id>
on('click', '[data-toggle-for]', function (event) {
  const id = event.currentTarget.getAttribute('data-toggle-for') || ''
  const details = document.getElementById(id)
  if (!details) return
  toggleDetails(details)
})

// Expand collapsed outdated diff if anchor points to it
//   /github/github/pull/123#discussion-diff-456
//   /github/github/pull/123#discussion-r345
hashChange(function ({target}) {
  if (!target || target.closest('summary')) return

  let node = target.parentElement
  while (node) {
    node = node.closest('details')
    if (node) {
      if (!node.hasAttribute('open')) {
        node.setAttribute('open', '')
      }
      node = node.parentElement
    }
  }
})

// The details dialog allows users to dismiss the dialog by clicking on the
// grayed-out background. This additional functionality prohibits dismissing
// the dialog in this way.
on('details-dialog-close', '[data-disable-dialog-dismiss]', function (event) {
  event.preventDefault()
})
