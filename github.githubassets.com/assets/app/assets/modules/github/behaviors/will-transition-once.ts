// Perform CSS transition once
//
// Examples
//
//   .foo.will-transition-once {
//     transition: color ...;
//   }
//
//   .foo.is-successful {
//     background: green;
//   }
//

import {fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('.will-transition-once', {
  constructor: HTMLElement,
  subscribe: el => fromEvent(el, 'transitionend', onTransitionEnd),
})

function onTransitionEnd(event: Event) {
  const target = event.target as Element
  target.classList.remove('will-transition-once')
}
