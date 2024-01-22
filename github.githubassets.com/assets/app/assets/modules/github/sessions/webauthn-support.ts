import {iuvpaaSupportLevel, webauthnSupportLevel} from '@github-ui/webauthn-support-level'
import {get, parseRequestOptionsFromJSON} from '@github/webauthn-json/browser-ponyfill'
import type {CredentialRequestOptionsJSON} from '@github/webauthn-json/browser-ponyfill'
import {requestSubmit, changeValue} from '@github-ui/form-utils'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

interface WebauthnPublicKeyCredential extends PublicKeyCredential {
  isConditionalMediationAvailable?: () => Promise<boolean>
}

const conditionalAbortController = new AbortController()
// webauthn-get.ts component
const webauthnGetComponent = 'webauthn-get'
// An event dispatched by `WebauthnGetElement` when a normal get request is initiated
const webauthnGetEvent = 'webauthn-get-prompt'

export async function isConditionalMediationSupported(): Promise<boolean | undefined> {
  return await (
    globalThis.PublicKeyCredential as unknown as WebauthnPublicKeyCredential | undefined
  )?.isConditionalMediationAvailable?.()
}

export async function supportConditionalMediation(): Promise<void> {
  const uivpaa = await iuvpaaSupportLevel()
  const conditionalForm = document.querySelector<HTMLFormElement>('.js-conditional-webauthn-placeholder')!
  const webauthnGet = document.querySelector<HTMLElement>(webauthnGetComponent)!

  // Don't initiate conditional mediation if this is a "low confidence" passkey login
  if (webauthnGet && webauthnGet.getAttribute('subtle-login') !== null) {
    return
  }

  const isAvailable = await isConditionalMediationSupported()

  if (conditionalForm && isAvailable && uivpaa === 'supported') {
    document.querySelector('#login_field')?.setAttribute('autocomplete', 'username webauthn')
    const signRequest = conditionalForm.getAttribute('data-webauthn-sign-request')

    if (!signRequest) {
      return
    }

    if (webauthnGet) {
      // Cancel pending conditional request if a basic get request is started
      webauthnGet.addEventListener(webauthnGetEvent, () => {
        conditionalAbortController.abort()
      })
    }

    const signRequestJSON: CredentialRequestOptionsJSON = JSON.parse(signRequest)
    const options = parseRequestOptionsFromJSON(signRequestJSON)
    options.signal = conditionalAbortController.signal

    const signResponse = await get(options)
    const responseField = conditionalForm.querySelector<HTMLFormElement>('.js-conditional-webauthn-response')!
    responseField.value = JSON.stringify(signResponse)
    requestSubmit(conditionalForm)
  }
}

// Record the browser's webauthn support level in the GitHub login form.
// Ask the device to sign a request when the user taps its button.
observe('.js-webauthn-support', {
  constructor: HTMLInputElement,
  add(el) {
    changeValue(el, webauthnSupportLevel())
  },
})

observe('.js-webauthn-iuvpaa-support', {
  constructor: HTMLInputElement,
  async add(el) {
    changeValue(el, await iuvpaaSupportLevel())
  },
})

observe('.js-support', {
  constructor: HTMLInputElement,
  async add(el) {
    changeValue(el, 'true')
  },
})

observe('.js-conditional-webauthn-placeholder', function () {
  supportConditionalMediation()
})
