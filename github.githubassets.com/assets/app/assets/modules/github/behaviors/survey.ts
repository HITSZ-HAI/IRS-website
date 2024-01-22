// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

on('change', 'input.js-survey-contact-checkbox', function (event: Event) {
  const currentTarget = event.currentTarget as HTMLInputElement
  const question = currentTarget.closest<HTMLElement>('.js-survey-question-form')!
  const hiddenInput = question.querySelector<HTMLElement>('.js-survey-contact-checkbox-hidden')!
  if (currentTarget.checked) {
    hiddenInput.setAttribute('disabled', 'true')
  } else {
    hiddenInput.removeAttribute('disabled')
  }
})
