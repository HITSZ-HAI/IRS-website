import {fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on, fire} from 'delegated-events'
import {requestSubmit} from '@github-ui/form-utils'
import sudo from '@github-ui/sudo'

on('click', 'button[data-sudo-required], summary[data-sudo-required]', checkSudo)
observe('form[data-sudo-required]', {
  constructor: HTMLFormElement,
  subscribe: form => fromEvent(form, 'submit', checkSudo),
})

async function checkSudo(event: Event) {
  const currentTarget = event.currentTarget
  if (!(currentTarget instanceof HTMLElement)) return
  const sudoRequired = currentTarget.getAttribute('data-sudo-required')
  if (sudoRequired === 'false') return

  event.stopPropagation()
  event.preventDefault()

  const sudoPassed = await sudo(currentTarget)

  if (sudoPassed) {
    currentTarget.removeAttribute('data-sudo-required')
    if (currentTarget instanceof HTMLFormElement) {
      requestSubmit(currentTarget)
    } else {
      currentTarget.click()
    }
  } else {
    // revert the disable-with state for the button which required sudo to handle case where sudo dialog is canceled and button was still disabled.
    const form = currentTarget.closest('form')
    if (form) {
      fire(form, 'deprecatedAjaxComplete')
    }
  }
}
