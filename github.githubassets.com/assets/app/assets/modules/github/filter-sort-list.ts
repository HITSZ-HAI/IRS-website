import type {TextScore} from './fuzzy-filter'
import {compare} from './fuzzy-filter'
import {filterSort} from './filter-sort'

const originalOrder = new WeakMap<Element, HTMLElement[]>()

interface FilterOptions {
  limit?: number | null
  sortKey: (item: HTMLElement) => TextScore | null | undefined
}

// Filters and sorts list element items against a text query. For use with lists that
// are already in the DOM, not with lists of results that are changed dynamically
// via ajax.
//
// Returns Number of visible items.
export function filterSortList(list: Element, string: string, options: FilterOptions): number {
  const query = string.toLowerCase()
  const limit = options.limit

  let allItems = originalOrder.get(list)
  const checkedInputBeforeFilter = list.querySelector('input[type="radio"]:checked')
  const children = Array.from(list.children)
  if (!allItems) {
    allItems = Array.from(list.children) as HTMLElement[]
    originalOrder.set(list, allItems)
  } else if (list.classList.contains('filter-sort-list-refresh')) {
    // if we get this class, it means the items in the list might have been changed
    // in this case, we check if there are new items to be added to the cache
    // this is the case when creating a new label from the label picker (see app/assets/modules/github/issues/labels.ts)
    list.classList.remove('filter-sort-list-refresh')
    const currentItems = Array.from(list.children) as HTMLElement[]
    for (const currentItem of currentItems) {
      if (!allItems.includes(currentItem)) {
        allItems.push(currentItem)
      }
    }
  }
  for (const item of children) {
    list.removeChild(item)
    if (item instanceof HTMLElement) item.style.display = ''
  }

  const found = query ? filterSort(allItems, options.sortKey, compare) : allItems
  const limited = limit == null ? found : found.slice(0, limit)
  const visible = limited.length
  const results = document.createDocumentFragment()
  for (const item of limited) {
    results.appendChild(item)
  }

  // This ensures that checked input before and after filtering is the same one
  // See https://github.com/github/github/issues/88129#issuecomment-434839397
  let inputStateReset = false
  if (checkedInputBeforeFilter instanceof HTMLInputElement) {
    for (const checkedInput of results.querySelectorAll('input[type="radio"]:checked')) {
      if (checkedInput instanceof HTMLInputElement && checkedInput.value !== checkedInputBeforeFilter.value) {
        checkedInput.checked = false
        inputStateReset = true
      }
    }
  }

  list.appendChild(results)

  // Dispatch a change event after render for details-menu or any other code reacting to the input state
  if (checkedInputBeforeFilter && inputStateReset) {
    checkedInputBeforeFilter.dispatchEvent(new Event('change', {bubbles: true}))
  }

  return visible
}
