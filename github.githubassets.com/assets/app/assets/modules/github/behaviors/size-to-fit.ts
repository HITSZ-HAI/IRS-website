// Size to Fit textarea behavior
//
// Auto sizes any textareas marked with `.js-size-to-fit` to its text
// contents height.

// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import subscribe from '@github/textarea-autosize'

observe('textarea.js-size-to-fit', {
  constructor: HTMLTextAreaElement,
  subscribe,
})
