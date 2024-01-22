// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {toggleDetailsTarget} from './details'

on('click', '.js-skip-to-content', function (event) {
  const startOfContent = document.getElementById('start-of-content')
  if (startOfContent) {
    const nextElement = startOfContent.nextElementSibling
    if (nextElement instanceof HTMLElement) {
      nextElement.setAttribute('tabindex', '-1')
      nextElement.setAttribute('data-skipped-to-content', '1')
      nextElement.focus()
    }
  }
  event.preventDefault()
})

export function hasSkippedToContent() {
  let skippedToContent = false
  const startOfContent = document.getElementById('start-of-content')

  if (startOfContent) {
    const nextElement = startOfContent.nextElementSibling

    if (nextElement instanceof HTMLElement) {
      skippedToContent = nextElement.getAttribute('data-skipped-to-content') === '1'

      if (skippedToContent) {
        nextElement.removeAttribute('data-skipped-to-content')
      }

      return skippedToContent
    }
  }
}

const touchDevice = 'ontouchstart' in document
const headerMenuItems = document.querySelectorAll<HTMLElement>('.js-header-menu-item')
for (const menuItem of headerMenuItems) {
  menuItem.addEventListener('details:toggled', event => {
    const target = event.target as HTMLInputElement

    if (event instanceof CustomEvent && event.detail.open) {
      for (const item of headerMenuItems) {
        if (item !== target) {
          toggleDetailsTarget(item, {force: false})
        }
      }
    }
  })

  if (!touchDevice) {
    menuItem.addEventListener('mouseleave', event => {
      const target = event.target as HTMLInputElement

      if (target.classList.contains('open')) {
        toggleDetailsTarget(target, {force: false})
      }
    })
  }
}

document.addEventListener('context-region-label:update', event => {
  if (!(event instanceof CustomEvent && event.detail.label)) return

  const contextRegionLabels = document.querySelectorAll('.js-context-region-label')
  for (const contextRegionLabel of contextRegionLabels) {
    contextRegionLabel.textContent = event.detail.label
  }
})

document.addEventListener('turbo:before-cache', event => {
  for (const dialog of (event.target as HTMLElement).querySelectorAll('modal-dialog[open]')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(dialog as any).close()
  }
})
