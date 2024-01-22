import {useSyncExternalStore} from 'react'

export function useIsSafari() {
  return useSyncExternalStore(subscribe, isSafariInBrowser, isSafariOnServer)
}
function isSafariInBrowser() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

function isSafariOnServer() {
  return false
}

//this is just a no-op, it has to be verbose because otherwise the linter is not happy
function subscribe() {
  return () => {
    return
  }
}
