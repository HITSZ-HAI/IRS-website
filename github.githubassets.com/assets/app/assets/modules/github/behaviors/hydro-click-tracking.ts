// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {sendData} from '../hydro-tracking'
import {debugHydroPayload} from './console-debug'

on('click', '[data-hydro-click]', function (event) {
  const el = event.currentTarget
  const payload = el.getAttribute('data-hydro-click') || ''
  const hmac = el.getAttribute('data-hydro-click-hmac') || ''
  const hydroClientContext = el.getAttribute('data-hydro-client-context') || ''
  debugHydroPayload('hydro-debug.click', payload)
  sendData(payload, hmac, hydroClientContext)
})
