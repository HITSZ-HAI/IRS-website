// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

function changeSelection(event: Event) {
  const input = event.target as HTMLElement
  const container = input?.closest<HTMLDetailsElement>('.js-branch-protection-integration-select')
  const currentSelection = container?.querySelector<HTMLElement>('.js-branch-protection-integration-select-current')
  const item = input?.closest<HTMLElement>('.js-branch-protection-integration-select-item')
  const label = item?.querySelector<HTMLElement>('.js-branch-protection-integration-select-label')
  if (currentSelection && label && container) {
    currentSelection.innerHTML = label.innerHTML
    container.open = false
  }
}

on('change', '.js-branch-protection-integration-select-input', changeSelection)
