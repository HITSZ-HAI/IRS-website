// Detects signout/signin events via `flash[:stale_session_signedin]` and
// notifies other browser tabs so that they can:
//
// 1. display the "You signed out in another tab" banner; and
// 2. disable pjaxing and form submission.
//
// On browsers that don't support BroadcastChannel, the `logged-in`
// localStorage key is used to send messages between tabs.
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

function sessionChanged(reason: string) {
  const flash = document.querySelector<HTMLElement>('.js-stale-session-flash')!
  const flashSignedIn = flash.querySelector<HTMLElement>('.js-stale-session-flash-signed-in')!
  const flashSignedOut = flash.querySelector<HTMLElement>('.js-stale-session-flash-signed-out')!
  const flashSwitched = flash.querySelector<HTMLElement>('.js-stale-session-flash-switched')!

  flash.hidden = false
  flashSignedIn.hidden = reason !== 'SIGNED_IN'
  flashSignedOut.hidden = reason !== 'SIGNED_OUT'
  flashSwitched.hidden = !reason?.startsWith('SWITCHED')

  if (reason?.startsWith('SWITCHED:')) {
    const switchedDetail = reason.split(':')
    if (switchedDetail.length === 3) {
      const from = switchedDetail[1]
      const to = switchedDetail[2]
      const originalUserId = flashSwitched.getAttribute('data-original-user-id')
      if (originalUserId && originalUserId === to) {
        flash.hidden = true
        flashSwitched.hidden = true
        flashSwitched.removeAttribute('data-original-user-id')
      } else if (!originalUserId) {
        flashSwitched.setAttribute('data-original-user-id', from || '')
      }
    }
  }

  window.addEventListener('popstate', function (event: PopStateEvent) {
    if (event.state && event.state.container != null) {
      location.reload()
    }
  })

  document.addEventListener('submit', function (event: Event) {
    event.preventDefault()
  })
}

let bc: Pick<BroadcastChannel, 'postMessage' | 'onmessage'> | null = null
if (typeof BroadcastChannel === 'function') {
  try {
    bc = new BroadcastChannel('stale-session')
    bc.onmessage = event => {
      if (typeof event.data === 'string') sessionChanged(event.data)
    }
  } catch {
    // ignore
  }
}
if (!bc) {
  let postingMessage = false

  bc = {
    postMessage(message: string) {
      postingMessage = true
      try {
        window.localStorage.setItem('logged-in', message)
      } finally {
        postingMessage = false
      }
    },
    onmessage: null,
  }

  window.addEventListener('storage', function (event) {
    /* eslint eslint-comments/no-use: off */
    /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
    if (!postingMessage && event.storageArea === window.localStorage && event.key === 'logged-in') {
      try {
        if (
          event.newValue === 'SIGNED_IN' ||
          event.newValue === 'SIGNED_OUT' ||
          event.newValue?.startsWith('SWITCHED')
        ) {
          sessionChanged(event.newValue)
        }
      } finally {
        window.localStorage.removeItem(event.key)
      }
    }
    /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
  })
}

const element = document.querySelector('.js-stale-session-flash[data-signedin]')
if (element) {
  const value = element.getAttribute('data-signedin') || ''
  bc?.postMessage(value)
}

const broadcastMsgOnSignOut = () => {
  bc?.postMessage('false')
}

observe('.js-loggout-form', function (el: Element) {
  el.addEventListener('submit', broadcastMsgOnSignOut)
})
