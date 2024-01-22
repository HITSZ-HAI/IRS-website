// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('[data-indeterminate]', {
  constructor: HTMLInputElement,
  initialize(el) {
    el.indeterminate = true
  },
})
