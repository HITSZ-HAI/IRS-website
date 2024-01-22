import {fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

async function load() {
  await import('../user-status-submit')
}

observe('.js-user-status-container, .js-load-user-status-submit', {
  subscribe: el => fromEvent(el, 'click', load, {once: true}),
})
