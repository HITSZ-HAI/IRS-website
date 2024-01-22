import {logPageView} from '../jump-to/page-views'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

function load() {
  import('../jump-to')
}

observe('.js-jump-to-field', {
  constructor: HTMLInputElement,
  add(el) {
    el.addEventListener('focusin', load, {once: true})
    logPageView(window.location.pathname)
  },
})
