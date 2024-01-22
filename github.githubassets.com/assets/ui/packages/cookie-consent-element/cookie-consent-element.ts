import {controller, attr} from '@github/catalyst'
import {
  initializeConsentControl,
  hasNoCookiePreferences,
  showCookieBanner,
  setConsentToAcceptAll,
} from '@github-ui/cookie-consent'

@controller
export class CookieConsentElement extends HTMLElement {
  @attr initialCookieConsentAllowed: boolean
  @attr cookieConsentRequired: boolean

  connectedCallback() {
    initializeConsentControl()

    if (this.initialCookieConsentAllowed && hasNoCookiePreferences()) {
      this.#setInitialCookieConsent()
    }
  }

  #setInitialCookieConsent() {
    if (this.cookieConsentRequired) {
      showCookieBanner()
    } else {
      setConsentToAcceptAll()
    }
  }
}
