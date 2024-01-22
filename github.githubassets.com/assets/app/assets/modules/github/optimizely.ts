import {pageUser, stacktrace} from '@github-ui/failbot'
import {requestUri} from '@github-ui/analytics-overrides'
import {createInstance as sdkCreateInstance, setLogLevel, setLogger} from '@optimizely/optimizely-sdk'
import {isSupported} from '@github/browser-support'

const customErrorHandler = {
  handleError(error: Error) {
    reportError(error)
  },
}

export function createInstance() {
  configureLogger()
  const datafile = document.head.querySelector<HTMLMetaElement>('meta[name=optimizely-datafile]')?.content
  return sdkCreateInstance({datafile, errorHandler: customErrorHandler})
}

// LocalStorage value is only written in development, but it is still read in
// production so devs can opt-in by manually setting the value.
function configureLogger() {
  const logLevel = localStorage('optimizely.logLevel')

  if (logLevel) {
    setLogLevel(logLevel)
  } else {
    setLogger(null)
  }
}

// Guard against exceptions raised when site storage is blocked (user preference)
function localStorage(key: string) {
  try {
    return window.localStorage?.getItem(key)
  } catch (e) {
    return null
  }
}

async function reportError(error: Error) {
  if (!isSupported) return

  if (error.message.startsWith('Optimizely::InvalidExperimentError:')) return

  const url = document.head?.querySelector<HTMLMetaElement>('meta[name="browser-optimizely-client-errors-url"]')
    ?.content
  if (!url) return

  const context = {
    message: error.message,
    stack: error.stack,
    stacktrace: stacktrace(error),
    sanitizedUrl: requestUri() || window.location.href,
    user: pageUser() || undefined,
  }

  try {
    await fetch(url, {method: 'post', body: JSON.stringify(context)})
  } catch {
    // Error reporting failed so do nothing.
  }
}
