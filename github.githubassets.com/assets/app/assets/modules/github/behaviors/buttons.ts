// Behaviors complementing buttons or minibuttons
//
// See also
//   primer/buttons.scss
//

import {fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

function cancelEvent(event: Event) {
  event.preventDefault()
  event.stopPropagation()
}

// Prevent minibutton click if target is disabled
observe('a.btn.disabled', {
  subscribe: el => fromEvent(el, 'click', cancelEvent),
})
