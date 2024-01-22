import type {Context} from '@github/hydro-analytics-client'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {sendEvent} from '@github-ui/hydro-analytics'

on('click', '[data-octo-click]', function (event) {
  const targetEl = event.currentTarget
  if (!(targetEl instanceof HTMLElement)) {
    return
  }

  const eventType = targetEl.getAttribute('data-octo-click') || ''
  const context: Context = {}

  if (targetEl.hasAttribute('data-ga-click')) {
    const gaEvent = targetEl.getAttribute('data-ga-click')!
    const parts = gaEvent.split(',')
    context.category = parts[0]!.trim()
    context.action = parts[1]!.trim()
  }

  if (targetEl.hasAttribute('data-octo-dimensions')) {
    const dimensionsList = targetEl.getAttribute('data-octo-dimensions')!.split(',')

    for (const dimensionPair of dimensionsList) {
      const [key, value] = dimensionPair.split(/:(.+)/)
      if (key) {
        context[key] = value || ''
      }
    }
  }
  sendEvent(eventType, context)
})
