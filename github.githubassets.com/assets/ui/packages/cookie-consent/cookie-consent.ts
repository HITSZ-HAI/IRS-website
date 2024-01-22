import {setCookie, getCookie} from '@github-ui/cookies'
import {Deferred} from '@github-ui/deferred'
import type {ICookieCategoriesPreferences} from 'consent-banner'
import {ConsentControl} from 'consent-banner'

import {cookieCategories, consentControlOptions, DefaultCookieConsentPreferences} from './lib/configuration'

type CookieConsentPreferencesType = {
  [key: string]: boolean | undefined
}

export const CONSENT_COOKIE_NAME = 'GHCC'

const SIX_MONTHS = 1000 * 60 * 60 * 24 * 180 // 180 days in milliseconds
const CONSENT_COOKIE_EXPIRATION_DATE = new Date(new Date().getTime() + SIX_MONTHS) // 6 months from now

const onPreferenceChange = (preferences: ICookieCategoriesPreferences) => {
  setPreferencesToCookie(preferences)
  cookieConsentControl.hideBanner()
}

let cookieConsentControl: ConsentControl

export function initializeConsentControl() {
  cookieConsentControl = new ConsentControl(
    'cookie-consent-banner',
    'en',
    onPreferenceChange,
    cookieCategories,
    consentControlOptions,
  )
}

export function showPreferences() {
  cookieConsentControl.showPreferences(getPreferencesFromCookie() || {})
}

export function showCookieBanner() {
  cookieConsentControl.showBanner(DefaultCookieConsentPreferences.Required)
}

export function setConsentToAcceptAll() {
  setPreferencesToCookie(DefaultCookieConsentPreferences.NotRequired)
}

export function hasNoCookiePreferences() {
  return getPreferencesFromCookie() === null
}

const consentDeferred = new Deferred<CookieConsentPreferencesType>()

export function waitForConsentPreferences(): Promise<CookieConsentPreferencesType> {
  return consentDeferred.promise
}

function setPreferencesToCookie(preferences: CookieConsentPreferencesType): void {
  const consentPreferences = Object.keys(preferences)
    .map(cookieCategoryId => `${cookieCategoryId}:${preferences[cookieCategoryId] ? '1' : '0'}`)
    .join('-')

  setCookie(CONSENT_COOKIE_NAME, consentPreferences, CONSENT_COOKIE_EXPIRATION_DATE.toUTCString())
  consentDeferred.resolve(preferences)
}

export function getPreferencesFromCookie(): CookieConsentPreferencesType | null {
  const preferencesCookie = getCookie(CONSENT_COOKIE_NAME)

  if (!preferencesCookie) {
    return null
  }

  const preferences = preferencesCookie.value.split('-')
  const cookieCategoriesPreferences: CookieConsentPreferencesType = {}

  for (const cookieParts of preferences) {
    const [cookieCategoryId, preference] = cookieParts.split(':')

    if (cookieCategoryId) {
      cookieCategoriesPreferences[cookieCategoryId] = preference === '1'
    }
  }

  return cookieCategoriesPreferences
}

const initialConsent = getPreferencesFromCookie()

if (initialConsent) {
  consentDeferred.resolve(initialConsent)
}
