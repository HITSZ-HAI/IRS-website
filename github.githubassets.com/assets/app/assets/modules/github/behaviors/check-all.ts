// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import subscribe from '@github/check-all'

observe('.js-check-all-container', {
  constructor: HTMLElement,
  subscribe,
})
