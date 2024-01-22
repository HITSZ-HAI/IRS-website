import {displayFlash} from '../flash'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('template.js-flash-template', {
  constructor: HTMLTemplateElement,
  add(el) {
    displayFlash(el)
  },
})
