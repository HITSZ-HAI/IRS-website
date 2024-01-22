// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('body.js-print-popup', () => {
  window.print()
  setTimeout(window.close, 1000)
})
