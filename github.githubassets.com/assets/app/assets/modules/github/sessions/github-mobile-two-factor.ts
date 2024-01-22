import {TemplateInstance} from '@github/template-parts'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const POLL_WAIT_TIME_MS = 3000
const flashClassName = `github-mobile-auth-flash`

function addFlashMessage(message: string): void {
  const template = new TemplateInstance(document.querySelector<HTMLTemplateElement>('template.js-flash-template')!, {
    className: `flash-error ${flashClassName}`,
    message,
  })
  const node = document.importNode(template, true)
  const flashContainer = document.querySelector<HTMLElement>('#js-flash-container')
  // make sure we are on a page that has a flash container
  if (flashContainer) {
    removeFlash()
    flashContainer.appendChild(node)
  }
}

function removeFlash(): void {
  const flashContainer = document.querySelector<HTMLElement>('#js-flash-container')
  // make sure we are on a page that has a flash container
  if (flashContainer) {
    // make sure we don't show more than one flash message for github mobile auth at the same time
    for (const child of flashContainer.children) {
      if (!child.classList.contains('js-flash-template') && child.classList.contains(flashClassName)) {
        flashContainer.removeChild(child)
      }
    }
  }
}

export function hidePromptAndShowErrorMessage(): void {
  const githubMobileAuthenticatePrompt = document.getElementById('github-mobile-authenticate-prompt')
  if (githubMobileAuthenticatePrompt) {
    githubMobileAuthenticatePrompt.hidden = true
  }
  const githubMobileAuthenticateErrorAndRetry = document.getElementById('github-mobile-authenticate-error-and-retry')
  if (githubMobileAuthenticateErrorAndRetry) {
    githubMobileAuthenticateErrorAndRetry.hidden = false
  }
}

export function resetPrompt(): void {
  removeFlash()
  const githubMobileAuthenticatePrompt = document.getElementById('github-mobile-authenticate-prompt')
  if (githubMobileAuthenticatePrompt) {
    githubMobileAuthenticatePrompt.hidden = false
  }
  const githubMobileAuthenticateErrorAndRetry = document.getElementById('github-mobile-authenticate-error-and-retry')
  if (githubMobileAuthenticateErrorAndRetry) {
    githubMobileAuthenticateErrorAndRetry.hidden = true
  }
}

// the user has approved the mobile request - reload the page which will trigger the redirects
//
// token - An optional parameter - only used during the password reset flow
function approvedHandler(token?: string): void {
  let url
  if (token) {
    // during password reset, when the user approves the mobile request, we need to update the url
    // to use the new SAT token instead of the old SAT token
    url = new URL(`password_reset/${encodeURIComponent(token)}`, window.location.origin)
  } else {
    url = new URL('', window.location.href)
  }

  url.searchParams.set('redirect', 'true')
  window.location.assign(url)
}

// two_factor_login info erased from session - send them back to login form
function rejectedHandler(): void {
  document.getElementById('github-mobile-rejected-redirect')!.click()
}

function genericHandler(message: string): void {
  if (message) {
    addFlashMessage(message)
  }
  hidePromptAndShowErrorMessage()
}

function getErrorAndRetryMessage(attributeName: string): string {
  return document.getElementById('github-mobile-authenticate-error-and-retry')!.getAttribute(attributeName)!
}

function pollMobileAuthRequestStatus(
  url: RequestInfo,
  successCallback?: () => void,
  failCallback?: (message: string) => void,
  checkCancelCallback?: () => boolean,
): Promise<void> {
  return (async function poll(errorCount: number): Promise<void> {
    if (checkCancelCallback && checkCancelCallback()) {
      return
    }

    let status = 'STATUS_UNKNOWN'
    let token
    try {
      const form = document.getElementById('github-mobile-authenticate-form') as HTMLFormElement
      const csrfInput = form.querySelector('.js-data-url-csrf') as HTMLInputElement
      const response = await self.fetch(
        new Request(url, {
          method: 'POST',
          body: new FormData(form),
          mode: 'same-origin',
          headers: {
            Accept: 'application/json',
            'Scoped-CSRF-Token': csrfInput.value,
            'X-Requested-With': 'XMLHttpRequest',
          },
        }),
      )
      if (response.ok) {
        const responseJSON = await response.json()
        status = responseJSON.status
        token = responseJSON.token
      } else {
        status = 'STATUS_ERROR'
      }
    } catch {
      status = 'STATUS_ERROR'
    }

    let message

    switch (status) {
      case 'STATUS_APPROVED':
        // stop polling and handle approved case specifically
        return successCallback ? successCallback() : approvedHandler(token)
      case 'STATUS_EXPIRED':
        // stop polling and handle expired case specifically
        message = getErrorAndRetryMessage('timeout-flash')
        return failCallback ? failCallback(message) : genericHandler(message)
      case 'STATUS_ACTIVE':
      case 'STATUS_ERROR':
      case 'STATUS_UNKNOWN':
        // keep polling
        break
      case 'STATUS_REJECTED':
        // stop polling and handle rejected case specifically
        message = getErrorAndRetryMessage('error-flash')
        return failCallback ? failCallback(message) : rejectedHandler()
      case 'STATUS_NOT_FOUND': // not expected, we shouldn't reach the poller if this is the case
      case 'STATUS_UNSUPPORTED': // not expected, we shouldn't reach the poller if this is the case
      default:
        // stop polling and handle these cases generically
        message = getErrorAndRetryMessage('error-flash')
        return failCallback ? failCallback(message) : genericHandler(message)
    }

    // wait between polls
    await new Promise(resolve => setTimeout(resolve, POLL_WAIT_TIME_MS))
    poll(errorCount)
  })(0)
}

export async function initializeMobileAuthRequestStatusPoll(
  el: Element,
  successCallback?: () => void,
  failCallback?: (message: string) => void,
  checkCancelCallback?: () => boolean,
): Promise<void> {
  try {
    await pollMobileAuthRequestStatus(
      el.getAttribute('data-poll-url')!,
      successCallback,
      failCallback,
      checkCancelCallback,
    )
  } catch (e) {
    // if an error was thrown that we didn't handle properly in the poller
    // we need to make sure to still update the UI in a meaningful way
    const message = getErrorAndRetryMessage('error-flash')
    return genericHandler(message)
  }
}

observe('.js-poll-github-mobile-two-factor-authenticate', function (el) {
  initializeMobileAuthRequestStatusPoll(el)
})

observe('.js-poll-github-mobile-verified-device-authenticate', function (el) {
  initializeMobileAuthRequestStatusPoll(el)
})

observe('.js-poll-github-mobile-two-factor-password-reset-authenticate', function (el) {
  initializeMobileAuthRequestStatusPoll(el)
})
