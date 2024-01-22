import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {Subscription} from '@github-ui/subscription'

type IdleListener = (isIdle: boolean) => unknown

const idleListeners: IdleListener[] = []
const DEBOUNCE_UNTIL_IDLE = 30000
const DEBOUNCE_UNTIL_ACTIVE = 0 // If active, we want to send immediately
let idle = ssrSafeDocument?.hidden || false // if the page is hidden on load, consider it idle immediately
let visibilityDebounceTimeout: ReturnType<typeof setTimeout> | undefined

export function addIdleStateListener(listener: IdleListener) {
  listener(idle)
  idleListeners.push(listener)

  return new Subscription(() => {
    const index = idleListeners.indexOf(listener)
    if (index !== -1) {
      idleListeners.splice(index, 1)
    }
  })
}

;(() => {
  // listen for visibility change events, which trigger the wait period for idle changes
  ssrSafeDocument?.addEventListener('visibilitychange', () => {
    const pageIsHidden = ssrSafeDocument?.hidden || false

    if (visibilityDebounceTimeout !== undefined) {
      // we were waiting to send an idle change, cancel the previous timeout and queue a new one
      clearTimeout(visibilityDebounceTimeout)
    }

    // When page visibility changes, wait a little bit before marking as idle in case visibility comes back
    const debouncePeriod = pageIsHidden ? DEBOUNCE_UNTIL_IDLE : DEBOUNCE_UNTIL_ACTIVE

    visibilityDebounceTimeout = setTimeout(() => {
      if (pageIsHidden === idle) {
        // idle hasn't changed, don't call any listeners
        return
      }

      idle = pageIsHidden
      visibilityDebounceTimeout = undefined

      // send current idle state to all listeners
      for (const idleListener of idleListeners) {
        idleListener(idle)
      }
    }, debouncePeriod)
  })
})()
