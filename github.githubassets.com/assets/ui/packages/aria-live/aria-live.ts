import {ssrSafeDocument} from '@github-ui/ssr-utils'

// Announce an element's text to the screen reader.
export function announceFromElement(el: HTMLElement, options?: {assertive?: boolean}) {
  announce(getTextContent(el), options)
}

// Announce message update to screen reader.
export function announce(message: string, options?: {assertive?: boolean}) {
  const {assertive} = options ?? {}

  setContainerContent(message, assertive)
}

// Set aria-live container to message.
function setContainerContent(message: string, assertive?: boolean) {
  const container = ssrSafeDocument?.querySelector(
    assertive ? '#js-global-screen-reader-notice-assertive' : '#js-global-screen-reader-notice',
  )
  if (!container) return
  if (container.textContent === message) {
    /* This is a hack due to the way the aria live API works.
    A screen reader will not read a live region again
    if the text is the same. Adding a space character tells
    the browser that the live region has updated,
    which will cause it to read again, but with no audible difference. */
    container.textContent = `${message}\u00A0`
  } else {
    container.textContent = message
  }
}

// Gets the trimmed text content of an element.
function getTextContent(el: HTMLElement): string {
  // innerText does not contain hidden text
  /* eslint-disable-next-line github/no-innerText */
  return (el.getAttribute('aria-label') || el.innerText || '').trim()
}
