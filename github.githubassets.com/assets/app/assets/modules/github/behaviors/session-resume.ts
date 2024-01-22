import {persistResumableFields, restoreResumableFields, setForm} from '@github/session-resume'
import {debounce} from '@github/mini-throttle'
import {getPageID} from '../session-resume-helpers'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import safeStorage from '@github-ui/safe-storage'

// For some fields we'll save them to localStorage instead of sessionStorage
const safeLocalStorage = safeStorage('localStorage', {
  ttl: 1000 * 60 * 5,
  throwQuotaErrorsOnSet: false,
  sendCacheStats: true,
})

export const restoreFieldsFromAllBackends = () => {
  restoreResumableFields(getPageID())
  restoreResumableFields(getPageID(), {storage: safeLocalStorage})
}

const sessionResumableSelector = '.js-session-resumable'
const localStorageResumableSelector = '.js-local-storage-resumable'

const persistFieldstoAllBackends = () => {
  persistResumableFields(getPageID(), {selector: sessionResumableSelector})
  persistResumableFields(getPageID(), {selector: localStorageResumableSelector, storage: safeLocalStorage})
}

const debouncedRestoreResumableFields = debounce(function () {
  restoreFieldsFromAllBackends()
}, 50)

/**
 * Returns true while turbo is showing a "preview" of the route from cache: in other words between
 * the time a route is visited and the time it is loaded
 * @returns boolean
 */
function isTurboRenderingCachePreview(): boolean {
  return document.querySelector('html')?.hasAttribute('data-turbo-preview') ?? false
}

// Session Resume.
//
// Annotate fields to be persisted on navigation away from the current page.
// Fields be automatically restored when the user revists the page again in
// their current browser session (excludes seperate tabs).
//
// Not design for persisted crash recovery.

// Listen for all form submit events and to see if their default submission
// behavior is invoked.
window.addEventListener('submit', setForm, {capture: true})

// Resume field content on regular page loads.
window.addEventListener('pageshow', function () {
  restoreFieldsFromAllBackends()
})

// Resume field content on elements that are added later
// We use a debounced version to avoid repeatedly calling it if multiple
// fields are added
observe('.js-session-resumable', function () {
  // we don't want to restore fields on turbo-cache previews as that empties the cache
  // causing the fields to be lost when turbo re-renders with the fetched page
  if (!isTurboRenderingCachePreview()) {
    debouncedRestoreResumableFields()
  }
})

// Persist resumable fields when page is unloaded
window.addEventListener('pagehide', function () {
  persistFieldstoAllBackends()
})

// preserve fields before navigating away
window.addEventListener('turbo:before-fetch-response', function () {
  persistFieldstoAllBackends()
})

// restore fields once turbo navigation has finished
window.addEventListener('turbo:load', function () {
  restoreFieldsFromAllBackends()
})
