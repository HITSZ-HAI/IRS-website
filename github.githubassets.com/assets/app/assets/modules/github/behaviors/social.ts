// Social Buttons
//
// Behavior for the Watch, Fork, and Star buttons within repo nav.
//
// Expects the JSON response to a .js-social-form XHR request to be in this format:
//
// On success:
//
// { "count": "1,234" }
//
// Count is formatted with delimiters. The social count in any .js-social child of .js-social-container will be updated
// to the new value.
//
// If the form is annotated with the .js-deferred-toggler-target class, the .js-toggler container will have its state
// toggled after the successful response has arrived (and not optimistically as .js-toggler-target behaves).
//
// Any .js-social-updatable child of .js-social-container with a data-url will also be re-fetched and updated with new
// content.
//
// The container will look for the first visible child
// and place the focus on its submit button.
//
// Failure cases:
//
// 409 Conflict - indicates that the user needs to confirm the social action in a dialog.
//
// {
//   "confirmationDialog": {
//     "templateSelector": "[CSS selector to find DOM element containing <template> for dialog contents]",
//     "inputs": { "arbitraryTemplateParts": "..." }
//   }
// }
//
// Any other 4xx or 5xx error will result in a generic global error being shown.

import type {SimpleResponse} from '@github/remote-form'
import {TemplateInstance} from '@github/template-parts'
import {dialog} from '@github-ui/details-dialog'
// eslint-disable-next-line no-restricted-imports
import {fire} from 'delegated-events'
import {remoteForm} from '@github/remote-form'
import {showGlobalError} from './ajax-error'
import {updateContent} from '../updatable-content'

function handleSocialResponse(
  container: HTMLElement,
  newCount: string,
  isDeferredTogglerTarget: boolean,
): Promise<void[]> {
  updateSocialCounts(container, newCount)
  if (isDeferredTogglerTarget) container.classList.toggle('on')

  const updatePromises = Array.from(container.querySelectorAll<HTMLElement>('.js-social-updatable'), updateContent)
  return Promise.all(updatePromises)
}

function replaceIncomingFocus(container: HTMLElement) {
  let focusOn
  const children = container.querySelectorAll(':scope > *')
  for (const el of children) {
    if (el.checkVisibility()) {
      focusOn = el.querySelector('button[type="submit"]') as HTMLElement
    }
  }
  focusOn?.focus()
}

remoteForm('.js-social-form', async function (form, wants) {
  let response: SimpleResponse
  const container = form.closest<HTMLElement>('.js-social-container')
  const isDeferredTogglerTarget = form.classList.contains('js-deferred-toggler-target')

  try {
    response = await wants.json()

    if (container) {
      await handleSocialResponse(container, response.json.count, isDeferredTogglerTarget)
      replaceIncomingFocus(container)

      container.dispatchEvent(new CustomEvent('social:success', {detail: response, bubbles: true}))
    }
  } catch (e) {
    // 409 Conflict: the user needs to accept a confirmation dialog. Find its template and trigger it.
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (e.response?.status === 409 && e.response.json.confirmationDialog) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      const dialogPayload = e.response.json.confirmationDialog
      const confirmationDialogTemplate = document.querySelector<HTMLTemplateElement>(dialogPayload.templateSelector)
      const confirmCsrfToken = form.querySelector<HTMLInputElement>('.js-confirm-csrf-token')?.value

      if (confirmationDialogTemplate instanceof HTMLTemplateElement && confirmCsrfToken) {
        const content = new TemplateInstance(confirmationDialogTemplate, {
          confirmUrl: form.action,
          confirmCsrfToken,
          ...(dialogPayload.inputs || {}),
        })
        const dialogElement = await dialog({content})

        dialogElement.addEventListener('social-confirmation-form:success', async event => {
          if (!(event instanceof CustomEvent)) return
          if (container) await handleSocialResponse(container, event.detail.count, isDeferredTogglerTarget)
        })

        dialogElement.addEventListener('social-confirmation-form:error', () => {
          showGlobalError()
        })
      }
    } else {
      // If the social form is also a toggler, but *not* a deferred one, it was optimistically toggled on click. Because
      // the action failed, we need to toggle it back off here so it won't be in an incorrect state.
      if (container && !isDeferredTogglerTarget) container.classList.toggle('on')

      showGlobalError()
    }
  }
})

remoteForm('.js-social-confirmation-form', async function (form, wants) {
  try {
    const response = await wants.json()
    fire(form, 'social-confirmation-form:success', response.json)
  } catch {
    fire(form, 'social-confirmation-form:error')
  }
})

export function updateSocialCounts(container: HTMLElement, newCount: string) {
  for (const count of container.querySelectorAll('.js-social-count')) {
    count.textContent = newCount
    count.setAttribute('title', newCount)

    const singularSuffix = count.getAttribute('data-singular-suffix')
    const pluralSuffix = count.getAttribute('data-plural-suffix')
    const suffix = newCount === '1' ? singularSuffix : pluralSuffix

    if (suffix) {
      count.setAttribute('aria-label', `${newCount} ${suffix}`)
    }
  }
}
