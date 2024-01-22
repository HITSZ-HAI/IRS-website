import {announceFromElement} from '@github-ui/aria-live'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('.js-discussion', announceTimelineEvents)

function announceTimelineEvents() {
  let existingTimelineItems: WeakSet<Element> = new WeakSet()
  setExistingTimelineItems()

  document.addEventListener('turbo:load', setExistingTimelineItems)

  observe('.js-timeline-item', el => {
    if (!(el instanceof HTMLElement)) return
    if (existingTimelineItems.has(el)) return

    announceFromElement(el)
  })

  function setExistingTimelineItems() {
    existingTimelineItems = new WeakSet(document.querySelectorAll('.js-timeline-item'))
  }
}
