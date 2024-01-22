import {loaded} from '@github-ui/document-ready'

// Flash
//
// Fades out and removes flash element from the page on close.
//
// Markup
//
//     <div class="flash-messages">
//       <div class="flash">
//         <%= octicon('x', :class => 'flash-close js-flash-close') %>
//         Flash Message
//       </div>
//     </div>
//

// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

on('click', '.js-flash-close', function (event) {
  const container = event.currentTarget.closest('.flash-messages')

  const flash = event.currentTarget.closest('.flash')
  flash!.remove()

  if (container && !container.querySelector('.flash')) {
    container.remove()
  }
})

/**
 * Inserts an sr-only span with a non-breaking space into the flash content.
 * The sr-only ensures there are no visual changes.
/** */
export function insertNonBreakingSpace(flashAlertContent: HTMLElement) {
  const nonBreakingSpace = document.createTextNode('\u00A0')
  const span = document.createElement('span')
  span.classList.add('sr-only')
  span.appendChild(nonBreakingSpace)

  flashAlertContent.appendChild(span)
}

/**
 * Contains accessibility logic for server-rendered flash.
 * This JS ensures that the flash content with '.js-flash-alert[role="alert"]' is announced.
 * See: https://github.com/github/accessibility/issues/290
 * Please consult #accessibility if you have any questions.
 */
;(async function () {
  await loaded

  const flashAlertContent: HTMLElement | null = document.querySelector('.js-flash-alert[role="alert"]')
  if (flashAlertContent) {
    // Delay and non-breaking space to ensure that screen readers announce this alert.
    setTimeout(() => {
      insertNonBreakingSpace(flashAlertContent)
    }, 200)
  }
})()
