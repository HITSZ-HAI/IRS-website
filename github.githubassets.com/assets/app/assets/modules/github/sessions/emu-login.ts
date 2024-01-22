import {isEnterprise} from '@github-ui/runtime-environment'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('.js-login-field', {
  constructor: HTMLInputElement,
  add(el) {
    EMULoginHandler(el)

    el.addEventListener('input', function () {
      EMULoginHandler(el)
    })
  },
})

export function EMULoginHandler(loginElement: HTMLInputElement) {
  const form = loginElement.closest<HTMLElement>('form')
  if (!form) return

  const passwordInput = form.querySelector<HTMLInputElement>('.js-password-field')
  const signInButton = form.querySelector<HTMLInputElement>('.js-sign-in-button')
  if (!passwordInput || !signInButton) return
  const loginInput = loginElement.value
  const invalidUnderscoreLogin = ['pj_nitin', 'up_the_irons']

  const emuLoginExperienceAvailable = () => {
    // disable-emu-sso: proxima has its own SSO login experience, this form only supports the admin user
    return !isEnterprise() && signInButton.getAttribute('disable-emu-sso') !== 'true'
  }

  const webauthnLoginSection = document.querySelector('.js-webauthn-login-emu-control')
  const webauthnLoginHint = document.querySelector('.js-webauthn-subtle-emu-control')
  const webauthnLoginHintBox = document.querySelector('.js-webauthn-hint-emu-control')
  const forgotPassword = document.querySelector('#forgot-password')

  if (
    emuLoginExperienceAvailable() &&
    loginInput.includes('_') &&
    !loginInput.includes('@') &&
    !invalidUnderscoreLogin.includes(loginInput) &&
    !loginInput.endsWith('_admin') &&
    !(signInButton.getAttribute('development') && loginInput.endsWith('_fab'))
  ) {
    passwordInput.setAttribute('disabled', 'true')
    signInButton.value = signInButton.getAttribute('data-sso-label') || ' '
    webauthnLoginSection?.setAttribute('hidden', 'true')
    webauthnLoginHint?.setAttribute('hidden', 'true')
    webauthnLoginHintBox?.setAttribute('hidden', 'true')
    forgotPassword?.setAttribute('hidden', 'true')
  } else {
    passwordInput.removeAttribute('disabled')
    signInButton.value = signInButton.getAttribute('data-signin-label') || ' '
    webauthnLoginSection?.removeAttribute('hidden')
    webauthnLoginHint?.removeAttribute('hidden')
    webauthnLoginHintBox?.removeAttribute('hidden')
    forgotPassword?.removeAttribute('hidden')
  }
}
