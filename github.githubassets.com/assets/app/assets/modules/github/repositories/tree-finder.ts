// Inspired by TextMate's 'Go To File' feature (and its vim counterpart, command-t)

import {hasMatch, positions, score} from 'fzy.js'
import Combobox from '@github/combobox-nav'
import type MarkedTextElement from '../marked-text-element'
import {TemplateInstance} from '@github/template-parts'
import type VirtualFilterInputElement from '../virtual-filter-input-element'
import type VirtualListElement from '../virtual-list-element'
import memoize from '@github/memoize'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {onKey} from '../onfocus'

const fuzzyScore = memoize(score)

// Encode list item for URL accounting for '/' for items that are paths
function urlEncodeItem(itemName: string) {
  return encodeURIComponent(itemName).replaceAll('%2F', '/')
}

onKey('keydown', '.js-tree-finder-field', (event: KeyboardEvent) => {
  // TODO: Refactor to use data-hotkey
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (event.key === 'Escape') {
    event.preventDefault()
    history.back()
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
})

// Look for tree finder inputs in the document start preloading the results.
observe('.js-tree-finder', (list: Element) => {
  const listInput = list.querySelector<HTMLInputElement>('.js-tree-finder-field')!
  const virtualFilter = list.querySelector<VirtualFilterInputElement<string>>('.js-tree-finder-virtual-filter')!
  const virtualList = list.querySelector<VirtualListElement<string>>('.js-tree-browser')!
  const listResults = list.querySelector<HTMLElement>('.js-tree-browser-results')!
  const template = list.querySelector<HTMLTemplateElement>('.js-tree-browser-result-template')!
  const combobox = new Combobox(listInput, listResults)
  virtualFilter.filter = (item: string, query: string) => {
    return query === '' || (hasMatch(query, item) && fuzzyScore(query, item) > 0)
  }
  virtualFilter.addEventListener('virtual-filter-input-filter', () => {
    virtualList.updating = 'lazy'
  })
  virtualFilter.addEventListener('virtual-filter-input-filtered', () => {
    virtualList.updating = 'eager'
  })
  virtualList.addEventListener('virtual-list-sort', (event: Event) => {
    event.preventDefault()
    const query = listInput.value
    virtualList.sort((a: string, b: string) => fuzzyScore(query, b) - fuzzyScore(query, a))
  })
  virtualList.addEventListener('virtual-list-update', () => {
    // Remove navigation focus from the list - as pressing enter too quickly
    // could cause erroneous navigation events
    combobox.stop()
  })
  virtualList.addEventListener('virtual-list-updated', () => {
    // Navigate to the first item in the list
    combobox.start()
    combobox.navigate()
  })
  virtualList.addEventListener('virtual-list-render-item', (event: Event) => {
    if (!(event instanceof CustomEvent)) return
    const frag = new TemplateInstance(template, {
      item: event.detail.item,
      id: `entry-${Math.random().toString().substr(2, 5)}`,
      urlEncodedItem: urlEncodeItem(event.detail.item),
    })
    const marker = frag.querySelector<MarkedTextElement>('marked-text')
    if (marker) marker.positions = positions
    event.detail.fragment.append(frag)
  })

  virtualList.querySelector('ul')!.hidden = false
  listInput.focus()
  combobox.start()
})
