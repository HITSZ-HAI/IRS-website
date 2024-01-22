// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {onInput} from '../onfocus'
import {remoteForm} from '@github/remote-form'
import {requestSubmit} from '@github-ui/form-utils'

export function smsSending() {
  document.body.classList.add('is-sending')
  document.body.classList.remove('is-sent', 'is-not-sent')
}

export function smsSuccess() {
  document.body.classList.add('is-sent')
  document.body.classList.remove('is-sending')
}

function smsError(message: string) {
  if (message) {
    document.querySelector<HTMLElement>('.js-sms-error')!.textContent = message
  }
  document.body.classList.add('is-not-sent')
  document.body.classList.remove('is-sending')
}

remoteForm('.js-send-auth-code', async (form, wants) => {
  smsSending()
  let response
  try {
    response = await wants.text()
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    smsError(error.response.text)
  }
  if (response) {
    smsSuccess()
  }
})

remoteForm('.js-two-factor-set-sms-fallback', async (form, wants) => {
  let response
  try {
    response = await wants.text()
  } catch (error) {
    const pane1 = form.querySelector<HTMLElement>('.js-configure-sms-fallback')!
    const pane2 = form.querySelector<HTMLElement>('.js-verify-sms-fallback')!
    const pane = pane1.hidden ? pane2 : pane1
    const flash = pane.querySelector<HTMLElement>('.flash')!
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    switch (error.response.status) {
      case 404:
      case 422:
      case 429:
        // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
        flash.textContent = JSON.parse(error.response.text).error
        flash.hidden = false
    }
  }
  if (response) {
    switch (response.status) {
      case 200:
      case 201:
        window.location.reload()
        break
      case 202:
        form.querySelector<HTMLElement>('.js-configure-sms-fallback')!.hidden = true
        form.querySelector<HTMLElement>('.js-verify-sms-fallback')!.hidden = false
        form.querySelector<HTMLElement>('.js-fallback-otp')!.focus()
        break
    }
  }
})

onInput('.js-verification-code-input-auto-submit', function (event: Event) {
  const target = event.currentTarget as HTMLInputElement
  const pattern = target.pattern || '[0-9]{6}'
  if (new RegExp(`^(${pattern})$`).test(target.value)) {
    requestSubmit(target.form!)
  }
})

on('click', '.js-toggle-redacted-note-content', async event => {
  const currentButton = event.currentTarget as HTMLButtonElement
  const noteContainer = currentButton.closest('.note')!
  if (noteContainer) {
    const note = noteContainer.getElementsByClassName('js-note')![0]
    if (note) {
      const newContent = currentButton.getAttribute('data-content')!.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      note.innerHTML = newContent
    }
  }

  const toggleElements = noteContainer.getElementsByClassName('js-toggle-redacted-note-content')!
  for (const elem of toggleElements) {
    const button = elem as HTMLButtonElement
    button.hidden = !button.hidden
  }
})
