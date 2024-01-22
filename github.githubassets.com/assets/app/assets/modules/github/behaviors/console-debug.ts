import safeStorage from '@github-ui/safe-storage'
const {getItem} = safeStorage('localStorage')

export function debugHydroPayload(debugKey: string, payload: string): void {
  if (process.env.NODE_ENV === 'development') {
    if (getItem(debugKey) === 'true') {
      /* eslint eslint-comments/no-use: off */
      /* eslint-disable no-console */
      try {
        const parsed = JSON.parse(payload)
        const eventName = parsed?.payload?.event_name ?? parsed?.event_type
        console.group(`[${debugKey}] ${eventName}`)
        console.table(parsed)
        const keys = Object.keys(parsed?.payload || {})
        for (const key of keys) {
          const object = parsed.payload[key]
          if (object instanceof Object && Object.keys(object).length > 0) {
            console.group(key)
            console.table(object)
            console.groupEnd()
          }
        }
        console.groupEnd()
      } catch (e) {
        console.group(`[hydro ${debugKey}] - failed to parse payload`)
        console.log(payload)
        console.groupEnd()
      }
      /* eslint-enable no-console */
    }
  }
}
