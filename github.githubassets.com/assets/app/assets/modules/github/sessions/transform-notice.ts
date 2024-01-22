import {deleteCookie, getCookies} from '../cookies'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('.js-transform-notice', {
  constructor: HTMLElement,
  add(el) {
    const cookies = getCookies('org_transform_notice')
    for (const cookie of cookies) {
      const message = document.createElement('span')
      try {
        message.textContent = atob(decodeURIComponent(cookie.value))
        deleteCookie(cookie.key)
        el.appendChild(message)
        el.hidden = false
      } catch (e) {
        // Do nothing, ignore on invalid encoding.
      }
      return
    }
  },
})
