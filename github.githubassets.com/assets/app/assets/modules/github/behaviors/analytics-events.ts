// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {sendEvent} from '@github-ui/hydro-analytics'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {debugHydroPayload} from './console-debug'
const GENERIC_CLICK_EVENT_NAME = 'analytics.click'

on('click', '[data-analytics-event]', event => {
  // marketing pages will use marketing/analytics-events.ts, instead of behaviors/analytics-events.ts
  if (isMarketingPage()) {
    return
  }
  const element = event.currentTarget

  const analyticsEvent = element.getAttribute('data-analytics-event')
  if (!analyticsEvent) return

  const analyticsEventAttributes = JSON.parse(analyticsEvent)

  debugHydroPayload('hydro-debug.click', `{"event_type": "${GENERIC_CLICK_EVENT_NAME}", "payload": ${analyticsEvent}}`)
  sendEvent(GENERIC_CLICK_EVENT_NAME, analyticsEventAttributes)
})

function isMarketingPage(): boolean {
  return !!ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="is_logged_out_page"]')?.content
}
