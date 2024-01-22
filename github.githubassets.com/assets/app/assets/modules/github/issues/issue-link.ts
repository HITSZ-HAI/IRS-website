import {fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

// Load issue/PR/discussion references to display the title for the tooltip from the server on hover.
// If hovercards are enabled for the referenced type on this part of the DOM,
// this behavior is bypassed in favor of the hovercard.
async function issueLabel(event: Event) {
  const currentTarget = event.currentTarget as HTMLElement
  const url = currentTarget.getAttribute('data-url')
  if (!url || isHovercardEnabled(currentTarget)) {
    return
  }

  const id = currentTarget.getAttribute('data-id') || ''
  const text = currentTarget.textContent
  const elements = document.querySelectorAll(`.js-issue-link[data-id='${id}']`)

  for (const el of elements) {
    el.removeAttribute('data-url')
  }

  try {
    const titleUrl = `${url}/title`
    const response = await fetch(titleUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      const responseError = new Error()
      const statusText = response.statusText ? ` ${response.statusText}` : ''
      responseError.message = `HTTP ${response.status}${statusText}`
      throw responseError
    }
    const data = await response.json()
    setLabel(elements, `${text}, ${data.title}`)
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    const status = (error.response != null ? error.response.status : undefined) || 500

    const message = (() => {
      switch (status) {
        case 404:
          return currentTarget.getAttribute('data-permission-text')
        default:
          return currentTarget.getAttribute('data-error-text')
      }
    })()

    setLabel(elements, message || '')
  }
}

function setLabel(elements: NodeList, text: string) {
  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue
    el.classList.add('tooltipped', 'tooltipped-ne')
    el.setAttribute('aria-label', text)
  }
}

function isHovercardEnabled(element: HTMLElement): boolean {
  const hovercardType = element.getAttribute('data-hovercard-type')
  switch (hovercardType) {
    case 'issue':
    case 'pull_request':
      return !!element.closest('[data-issue-and-pr-hovercards-enabled]')
    case 'discussion':
      return !!element.closest('[data-discussion-hovercards-enabled]')
    default:
      return false
  }
}

observe('.js-issue-link', {
  subscribe: el => fromEvent(el, 'mouseenter', issueLabel),
})
