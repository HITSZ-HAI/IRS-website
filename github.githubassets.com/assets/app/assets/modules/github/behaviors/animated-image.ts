// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {sendStats} from '@github-ui/stats'

const selector = ['system', 'disabled']
  .map(state => `html[data-a11y-animated-images="${state}"] img[data-animated-image]`)
  .join(', ')

observe(selector, el => {
  if (!(el instanceof HTMLImageElement)) return // Element is not an image
  // Element has a parent link but is not the direct child
  if (el.closest('a') && !(el.parentElement instanceof HTMLAnchorElement)) return

  let parent = el.parentElement
  let link = null
  if (parent instanceof HTMLAnchorElement) {
    if (parent.childElementCount > 1) return // Image is not the only child of link
    link = parent
    link.setAttribute('data-target', 'animated-image.originalLink')
    parent = link.parentElement
  }

  el.removeAttribute('data-animated-image')
  el.setAttribute('data-target', 'animated-image.originalImage')

  const clone = link ? link.cloneNode(true) : el.cloneNode(true)

  const container = document.createElement('animated-image')
  container.appendChild(clone)
  parent?.replaceChild(container, link ? link : el)

  sendStats({incrementKey: 'ANIMATED_IMAGE_PLAYER_WRAPPED', requestUrl: window.location.href})
})
