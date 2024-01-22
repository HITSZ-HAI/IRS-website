// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {requestSubmit} from '@github-ui/form-utils'

observe('form.js-auto-replay-enforced-sso-request', {
  constructor: HTMLFormElement,
  initialize(el) {
    requestSubmit(el)
  },
})
