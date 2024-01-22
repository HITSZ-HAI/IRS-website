import {setCookie} from '../cookies'
import timezone from '../timezone'

// eslint-disable-next-line compat/compat
window.requestIdleCallback(() => {
  const value = timezone()
  if (value) {
    setCookie('tz', encodeURIComponent(value))
  }
})
