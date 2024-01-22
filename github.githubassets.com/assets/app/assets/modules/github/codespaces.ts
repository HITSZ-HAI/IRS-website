// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {remoteForm} from '@github/remote-form'
import {requestSubmit} from '@github-ui/form-utils'

on('remote-input-error', '#js-codespaces-repository-select', () => {
  const warning = document.querySelector<HTMLElement>('#js-codespaces-unable-load-repositories-warning')!
  warning.hidden = false
})

function updateNewCodespaceUrl(form: FormData): void {
  const url = new URL(document.location.href, window.location.origin)
  const urlParams = new URLSearchParams(url.search)
  // Certain form name/values we don't want to save as these are very ENV specific.
  // They can cause problems in different environments (e.g. review lab, local, production, etc...)
  // Add those keys to this list as needed.
  const paramsKeysToReject = ['vscs_target']

  for (const [key, value] of form.entries()) {
    if (paramsKeysToReject.includes(key) || !value) {
      urlParams.delete(key)
      continue
    }

    urlParams.set(key, value as string)
  }

  window.history.replaceState({}, '', `?${urlParams.toString()}`)
}

remoteForm('.js-new-codespace-form', async function (form, wants) {
  const container = form.closest<HTMLElement>('[data-replace-remote-form-target]')!
  const submitButton = container.querySelector('.js-new-codespace-submit-button')

  if (submitButton instanceof HTMLInputElement) {
    submitButton.disabled = true
  }

  form.classList.remove('is-error')
  form.classList.add('is-loading')

  try {
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true')
    }

    const response = await wants.html()
    if (response.status !== 200) {
      resetNewCodespacePageWithResponseError()
    }
    replaceAndRefocus(container, response.html)

    if (container.getAttribute('data-allow-update-url') === 'true') {
      const newFormData = new FormData(document.querySelector('form.js-new-codespace-form') as HTMLFormElement)
      updateNewCodespaceUrl(newFormData)
    }
  } catch (e) {
    resetNewCodespacePageWithResponseError()
    throw e // We still want this to wind up in telemetry
  }
})

export function replaceAndRefocus(target: HTMLElement, partial: DocumentFragment) {
  const partialContent = partial.querySelector('*')

  const focusedElement = target.ownerDocument.activeElement

  let elementToRefocus
  if (focusedElement instanceof HTMLElement) {
    elementToRefocus = partialContent?.querySelector(generateCssSelectorForElement(focusedElement))
  }

  target.replaceWith(partial)

  if (elementToRefocus instanceof HTMLElement) {
    elementToRefocus.focus()
  }
}

function generateCssSelectorForElement(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase()
  const classNames = element.hasAttribute('class') ? `.${element.className.split(' ').join('.')}` : ''
  const id = element.hasAttribute('id') ? `#${element.id}` : ''
  const name = element.hasAttribute('name') ? `[name="${element.getAttribute('name')}"]` : ''

  return `${tagName}${id}${classNames}${name}`
}

function resetNewCodespacePageWithResponseError() {
  const url = new URL(document.location.href, window.location.origin)
  const urlParams = new URLSearchParams(url.search)
  urlParams.set('response_error', 'true')
  window.location.replace(`${window.location.pathname}?${urlParams.toString()}`)
}

type LoadingState = null | 'provisioning' | 'provisioned' | 'stuck' | 'failed'

let loadingState: LoadingState = null

function advanceLoadingState(state: LoadingState) {
  loadingState = state

  if (state !== null) {
    const loadingSteps = document.querySelector<HTMLDivElement>('.js-codespace-loading-steps')!
    loadingSteps.setAttribute('data-current-state', loadingState as string)
  }
}

observe('.js-codespace-loading-steps', {
  constructor: HTMLElement,
  add: el => {
    const currentState = el.getAttribute('data-current-state') as LoadingState
    if (currentState) advanceLoadingState(currentState)
  },
})

observe('.js-codespace-advance-state', {
  constructor: HTMLElement,
  add: el => {
    const targetState = el.getAttribute('data-state') as LoadingState
    if (targetState) advanceLoadingState(targetState)
  },
})

interface CascadeTokenResponse {
  token: string
}

let cascadeToken: string | null = null

function fetchCascadeToken(mintTokenForm: HTMLFormElement) {
  remoteForm('.js-fetch-cascade-token', async function (_form, wants) {
    try {
      const response = await wants.json()
      const payload = response.json as CascadeTokenResponse
      cascadeToken = payload.token
    } catch (e) {
      // do nothing since we have a fallback to this error and don't want to throw
    }
  })

  requestSubmit(mintTokenForm)
}

function waitForCascadeTokenWithTimeout(
  querySelector: string,
  cb: (token: string | undefined) => void,
  timeout: number,
) {
  const container = document.querySelector(querySelector)
  if (container) {
    const start = Date.now()
    const checkToken = () => {
      const elapsed = Date.now() - start
      if (cascadeToken || elapsed >= timeout) {
        clearInterval(checkInterval)
        cb(cascadeToken || undefined)
        return
      }
    }
    const checkInterval = setInterval(checkToken, 50)
  }
}

observe('.js-auto-submit-form', {
  constructor: HTMLFormElement,
  initialize: requestSubmit,
})

observe('.js-workbench-form-container', {
  constructor: HTMLElement,
  add: container => {
    const cascadeTokenField = container.querySelector('.js-cascade-token') as HTMLInputElement

    resolveCascadeToken(container, cascadeTokenField)
  },
})

function resolveCascadeToken(container: HTMLElement, cascadeTokenField: HTMLInputElement) {
  if (cascadeTokenField.value !== '') {
    const form = container.querySelector('form') as HTMLFormElement

    requestSubmit(form)
  } else {
    const mintTokenForm = document.querySelector('.js-fetch-cascade-token') as HTMLFormElement

    fetchCascadeToken(mintTokenForm)

    // wait 10000ms (10 seconds) for token and insert into the form if we successfully fetch a token
    waitForCascadeTokenWithTimeout('.js-workbench-form-container', insertCodespaceTokenIntoShowAuthForm, 10000)
  }
}

function insertCodespaceTokenIntoShowAuthForm(token: string | undefined) {
  const form = document.querySelector('.js-workbench-form-container form') as HTMLFormElement
  if (form && token) {
    insertCodespaceTokenIntoCascadeField(form, token)
    insertCodespaceTokenIntoPartnerInfo(form, token)
    requestSubmit(form)
  } else {
    // something happened and we couldn't get the token!
    advanceLoadingState('failed')
  }
}

function insertCodespaceTokenIntoCascadeField(form: HTMLFormElement, token: string) {
  const cascadeField = form.querySelector('.js-cascade-token')
  if (cascadeField) {
    cascadeField.setAttribute('value', token)
  }
}

function insertCodespaceTokenIntoPartnerInfo(form: HTMLFormElement, token: string) {
  const partnerInfoField = form.querySelector('.js-partner-info')
  if (partnerInfoField) {
    let partnerInfoData = partnerInfoField.getAttribute('value')
    if (partnerInfoData) {
      partnerInfoData = partnerInfoData.replace('%CASCADE_TOKEN_PLACEHOLDER%', token)
      partnerInfoField.setAttribute('value', partnerInfoData)
    }
  }
}
