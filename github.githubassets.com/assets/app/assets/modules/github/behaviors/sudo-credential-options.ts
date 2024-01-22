import {attr, controller, target} from '@github/catalyst'
import type {WebauthnGetElement} from '@github-ui/webauthn-get-element'
import {State} from '@github-ui/webauthn-get-element'
import {
  initializeMobileAuthRequestStatusPoll,
  hidePromptAndShowErrorMessage as showGitHubMobileErrorState,
  resetPrompt as resetGitHubMobilePrompt,
} from '../sessions/github-mobile-two-factor'
import {supported} from '@github/webauthn-json/browser-ponyfill'
import {smsSending, smsSuccess} from '../sessions/two-factor'
import {requestSubmit} from '@github-ui/form-utils'

enum SudoCredentialOptionsElementState {
  WebAuthn = 'webauthn',
  Password = 'password',
  GitHubMobile = 'github_mobile',
  TotpApp = 'app',
  TotpSms = 'sms',
}

@controller
export class SudoCredentialOptionsElement extends HTMLElement {
  static attrPrefix = ''
  @attr initialState: string
  @attr webauthnAvailable: string
  @attr githubMobileAvailable: string
  @attr totpAppAvailable: string
  @attr totpSmsAvailable: string
  @attr githubMobilePromptUrl: string
  @attr githubMobileGenericErrorMessage: string
  @attr smsGenericErrorMessage: string
  @attr genericErrorMessage: string
  @attr totpSmsTriggerUrl: string

  @target flashErrorMessageContainer: HTMLElement
  @target flashErrorMessageText: HTMLElement
  @target webauthnContainer: HTMLElement
  @target githubMobileContainer: HTMLElement
  @target githubMobileLoading: HTMLElement
  @target githubMobileLanding: HTMLElement
  @target totpAppContainer: HTMLElement
  @target totpSmsContainer: HTMLElement
  @target totpSmsLanding: HTMLElement
  @target passwordContainer: HTMLElement
  @target githubMobileNoChallengeMessage: HTMLElement
  @target githubMobileChallengeMessage: HTMLElement
  @target githubMobileChallengeValue: HTMLElement

  @target webauthnNav: HTMLElement
  @target githubMobileNav: HTMLElement
  @target totpAppNav: HTMLElement
  @target totpSmsNav: HTMLElement
  @target totpSmsResendNav: HTMLElement
  @target passwordNav: HTMLElement

  @target webauthnGet: WebauthnGetElement
  @target loginField: HTMLInputElement
  @target passwordField: HTMLInputElement

  #currentState: SudoCredentialOptionsElementState

  connectedCallback() {
    // set state explicitly on load to get evaluated webauthn warnings, etc
    const stateKey = this.initialState as SudoCredentialOptionsElementState
    this.#currentState = stateKey
    this.reRenderPrompt(true)
  }

  reRenderPrompt(initialLoad = false): void {
    this.resetPrompt()
    try {
      switch (this.#currentState) {
        case SudoCredentialOptionsElementState.WebAuthn:
          this.renderWebauthnOption()
          break
        case SudoCredentialOptionsElementState.GitHubMobile:
          this.renderGitHubMobileOption(initialLoad)
          break
        case SudoCredentialOptionsElementState.TotpApp:
          this.renderTotpAppOption()
          break
        case SudoCredentialOptionsElementState.TotpSms:
          this.renderTotpSmsOption(initialLoad)
          break
        case SudoCredentialOptionsElementState.Password:
        default:
          this.renderPasswordOption()
          break
      }
      this.reRenderNavContainer()
    } catch (e) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      this.handleUnexpectedPromptError(e)
    }
  }

  handleUnexpectedPromptError(unexpectedError: Error) {
    let errorMessage = ''

    switch (this.#currentState) {
      case SudoCredentialOptionsElementState.GitHubMobile:
        errorMessage = this.githubMobileGenericErrorMessage
        break
      case SudoCredentialOptionsElementState.TotpSms:
        errorMessage = this.smsGenericErrorMessage
        break
      default:
        errorMessage = this.genericErrorMessage
    }

    // if we have an unexpected error, show a generic error message
    // and try the password prompt as a fallback to prevent the user from being presented with an empty prompt / no options
    if (unexpectedError && this.#currentState !== SudoCredentialOptionsElementState.Password) {
      this.renderPasswordOptionWithError(errorMessage)
      throw unexpectedError // re-throw the error so we can capture any unexpected errors with failbot/sentry
    }
  }

  renderPasswordOptionWithError(errorMessage: string): void {
    this.showPassword()
    this.showErrorMessage(errorMessage)
  }

  resetPrompt(): void {
    this.hideErrorMessage()
    if (this.isWebAuthnAvailable()) {
      this.hideWebAuthn()
    }
    if (this.isGitHubMobileAvailable()) {
      this.hideGitHubMobile()
    }
    if (this.isTotpAppAvailable()) {
      this.hideTotpApp()
    }
    if (this.isTotpSmsAvailable()) {
      this.hideTotpSms()
    }
    this.hidePassword()
  }

  hideWebAuthn() {
    this.safeSetElementVisibility(this.webauthnContainer, false)
    this.safeSetElementVisibility(this.webauthnNav, false)
  }

  hideGitHubMobile() {
    this.safeSetElementVisibility(this.githubMobileContainer, false)
    this.safeSetElementVisibility(this.githubMobileNav, false)
    this.safeSetElementVisibility(this.githubMobileLoading, false)
    this.safeSetElementVisibility(this.githubMobileLanding, false)
  }

  hideTotpApp() {
    this.safeSetElementVisibility(this.totpAppContainer, false)
    this.safeSetElementVisibility(this.totpAppNav, false)
  }

  hideTotpSms() {
    this.safeSetElementVisibility(this.totpSmsContainer, false)
    this.safeSetElementVisibility(this.totpSmsLanding, false)
    this.safeSetElementVisibility(this.totpSmsNav, false)
    this.safeSetElementVisibility(this.totpSmsResendNav, false)
  }

  hidePassword() {
    this.safeSetElementVisibility(this.passwordContainer, false)
    this.safeSetElementVisibility(this.passwordNav, false)
  }

  reRenderNavContainer() {
    if (this.isWebAuthnAvailable() && this.#currentState !== SudoCredentialOptionsElementState.WebAuthn) {
      this.safeSetElementVisibility(this.webauthnNav, true)
    }
    if (this.isGitHubMobileAvailable() && this.#currentState !== SudoCredentialOptionsElementState.GitHubMobile) {
      this.safeSetElementVisibility(this.githubMobileNav, true)
    }
    if (this.isTotpAppAvailable() && this.#currentState !== SudoCredentialOptionsElementState.TotpApp) {
      this.safeSetElementVisibility(this.totpAppNav, true)
    }
    if (this.isTotpSmsAvailable() && this.#currentState !== SudoCredentialOptionsElementState.TotpSms) {
      this.safeSetElementVisibility(this.totpSmsNav, true)
    }
    if (this.#currentState !== SudoCredentialOptionsElementState.Password) {
      this.safeSetElementVisibility(this.passwordNav, true)
    }
  }

  renderWebauthnOption(): void {
    this.safeSetElementVisibility(this.webauthnContainer, true)
    this.webauthnGet?.setState(supported() ? State.Ready : State.Unsupported)
  }

  renderGitHubMobileOption(initialLoad: boolean): void {
    try {
      resetGitHubMobilePrompt()
    } catch {
      // ignore errors
    }
    // if it's the initial load, show the "landing" page that
    // offers a button to initiate the GH mobile auth request
    if (initialLoad) {
      this.safeSetElementVisibility(this.githubMobileLoading, false)
      this.safeSetElementVisibility(this.githubMobileLanding, true)
      this.safeSetElementVisibility(this.githubMobileContainer, false)
    } else {
      this.safeSetElementVisibility(this.githubMobileLoading, true)
      this.safeSetElementVisibility(this.githubMobileLanding, false)
      this.safeSetElementVisibility(this.githubMobileContainer, false)
      this.initiateGitHubMobileAuthRequest()
    }
  }

  renderTotpSmsOption(initialLoad: boolean): void {
    // if it's the initial load, show the "landing" page that
    // offers a button to initiate the text message
    if (initialLoad) {
      this.safeSetElementVisibility(this.totpSmsLanding, true)
      this.safeSetElementVisibility(this.totpSmsContainer, false)
    } else {
      this.safeSetElementVisibility(this.totpSmsLanding, false)
      this.safeSetElementVisibility(this.totpSmsContainer, true)
      this.initiateTotpSmsRequest()
    }
  }

  renderTotpAppOption(): void {
    this.safeSetElementVisibility(this.totpAppContainer, true)
  }

  renderPasswordOption(): void {
    this.safeSetElementVisibility(this.passwordContainer, true)
    if (this.loginField) {
      this.loginField.focus()
    } else {
      this.passwordField?.focus()
    }
  }

  hasMultipleOptions(): boolean {
    return (
      this.isWebAuthnAvailable() ||
      this.isGitHubMobileAvailable() ||
      this.isTotpAppAvailable() ||
      this.isTotpSmsAvailable()
    )
  }

  isWebAuthnAvailable(): boolean {
    return this.webauthnAvailable === 'true'
  }

  isGitHubMobileAvailable(): boolean {
    return this.githubMobileAvailable === 'true'
  }

  isTotpAppAvailable(): boolean {
    return this.totpAppAvailable === 'true'
  }

  isTotpSmsAvailable(): boolean {
    return this.totpSmsAvailable === 'true'
  }

  showWebauthn(): void {
    this.#currentState = SudoCredentialOptionsElementState.WebAuthn
    this.reRenderPrompt()
  }

  showGitHubMobile(): void {
    this.#currentState = SudoCredentialOptionsElementState.GitHubMobile
    this.reRenderPrompt()
  }

  showTotpApp(): void {
    this.#currentState = SudoCredentialOptionsElementState.TotpApp
    this.reRenderPrompt()
  }

  showTotpSms(): void {
    this.#currentState = SudoCredentialOptionsElementState.TotpSms
    this.reRenderPrompt()
  }

  showPassword(): void {
    this.#currentState = SudoCredentialOptionsElementState.Password
    this.reRenderPrompt()
  }

  githubMobileRetry(e: Event): void {
    e.preventDefault()
    this.showGitHubMobile()
  }

  async initiateGitHubMobileAuthRequest(): Promise<void> {
    const url = this.githubMobilePromptUrl
    const csrfToken = (document.getElementById('sudo-credential-options-github-mobile-csrf') as HTMLInputElement).value
    const data = new FormData()
    // eslint-disable-next-line github/authenticity-token
    data.append('authenticity_token', csrfToken)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: data,
      })

      if (!response.ok && this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
        this.mobileFailHandler(this.githubMobileGenericErrorMessage)
        return
      }

      const json = await response.json()
      const hasChallenge = !!json.challenge

      this.safeSetElementVisibility(this.githubMobileNoChallengeMessage, !hasChallenge)
      this.safeSetElementVisibility(this.githubMobileChallengeMessage, hasChallenge)
      this.safeSetElementVisibility(this.githubMobileChallengeValue, hasChallenge)

      if (hasChallenge) {
        this.githubMobileChallengeValue.textContent = json.challenge
      }

      const el = document.getElementsByClassName('js-poll-github-mobile-sudo-authenticate')[0]!
      initializeMobileAuthRequestStatusPoll(
        el,
        () => this.mobileApprovedHandler(),
        (message: string) => this.mobileFailHandler(message),
        () => this.mobileCancelCheck(),
      )
    } catch (e) {
      if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
        this.mobileFailHandler(this.githubMobileGenericErrorMessage)
      }
    } finally {
      if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
        this.safeSetElementVisibility(this.githubMobileLoading, false)
        this.safeSetElementVisibility(this.githubMobileContainer, true)
      }
    }
  }

  async resendTotpSms(): Promise<void> {
    this.hideErrorMessage()
    // start the spinner
    smsSending()
    try {
      await this.initiateTotpSmsRequest(true)
    } catch (e) {
      // errors are handled in the initiateTotpSmsRequest method
    }
    // always stop the spinner
    document.body.classList.remove('is-sending')
  }

  async initiateTotpSmsRequest(isResend = false): Promise<void> {
    const url = new URL(this.totpSmsTriggerUrl, window.location.origin)
    if (isResend) {
      url.searchParams.set('resend', 'true')
    }
    const csrfToken = (document.getElementById('sudo-credential-options-sms-csrf') as HTMLInputElement).value
    const data = new FormData()
    // eslint-disable-next-line github/authenticity-token
    data.append('authenticity_token', csrfToken)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: data,
      })
      if (!response.ok && this.#currentState === SudoCredentialOptionsElementState.TotpSms) {
        const responseJson = await response.json()
        this.showErrorMessage(responseJson.error)
      } else if (this.#currentState === SudoCredentialOptionsElementState.TotpSms && isResend) {
        smsSuccess()
      }
    } catch (e) {
      if (this.#currentState === SudoCredentialOptionsElementState.TotpSms) {
        this.showErrorMessage(this.smsGenericErrorMessage)
      }
    }
    if (this.#currentState === SudoCredentialOptionsElementState.TotpSms) {
      this.safeSetElementVisibility(this.totpSmsResendNav, true)
    }
  }

  mobileApprovedHandler(): void {
    if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
      const form = this.githubMobileContainer.getElementsByTagName('form')[0]!
      requestSubmit(form)
    }
  }

  mobileFailHandler(message: string): void {
    if (this.#currentState === SudoCredentialOptionsElementState.GitHubMobile) {
      this.showErrorMessage(message)
      showGitHubMobileErrorState()
    }
  }

  mobileCancelCheck(): boolean {
    return this.#currentState !== SudoCredentialOptionsElementState.GitHubMobile
  }

  safeSetElementVisibility(elem: HTMLElement, visible: boolean): boolean {
    if (elem) {
      elem.hidden = !visible
      return true
    }
    return false
  }

  showErrorMessage(message: string): void {
    if (this.flashErrorMessageText) {
      this.flashErrorMessageText.textContent = message
      this.safeSetElementVisibility(this.flashErrorMessageContainer, true)
    }
  }

  hideErrorMessage(): void {
    if (this.flashErrorMessageText) {
      this.flashErrorMessageText.textContent = ''
    }
    this.safeSetElementVisibility(this.flashErrorMessageContainer, false)
  }
}
