import verifySsoSession from './sso'

interface FilterOptions {
  limit?: number | null
}

interface Label {
  id: string
  name: string
  htmlName: string
  color: string
  selected: boolean
  element?: HTMLElement
  description?: string
}

interface Data {
  labels: Label[]
}

interface TypeAheadData {
  lastSearchResult: Data
  lastSearchText?: string
  cachedSuggestions: Label[]

  // Used to cache a user ID to a pre-existing rendered element (if they exist in multiple search results).
  // This is needed to persist their selected state across multiple searches.
  // Key is label.id (as a string) to the rendered element
  labelResultCache: Map<string, HTMLElement>
}

// Used to abort any previous type-ahead request if not needed
let abortController = new AbortController()

const typeAheadCache = new WeakMap<Element, TypeAheadData>()
const cache = new WeakMap<Element, Data>()
const currentQueryForList = new WeakMap<Element, string>()

// This is like `substringFilterList`, but instead of filtering down direct
// children of a DOM element, obtain most data from a JSON payload and search
// within that instead, only generating actual DOM elements when they are
// "revealed" by matching the search term. Similarly, remove elements from the
// DOM when they don't match a search term and they're not selected.
//
// Also, because elements might already exist in the DOM because of their
// pre-selected state, merge those elements with the data coming from JSON.
export async function labelsTypeaheadFilterList(
  list: Element,
  queryText: string,
  options: FilterOptions,
): Promise<number> {
  await verifySsoSession()

  currentQueryForList.set(list, queryText)
  let data = cache.get(list)

  // If we don't have data, fetch it
  if (!data) {
    try {
      data = await getData(list, queryText)
    } catch (error) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      if (error.name === 'AbortError') {
        // A stale type-ahead request was aborted
        return -1
      } else {
        throw error
      }
    }
  }

  // create an index of items already rendered into DOM - already selected items
  const existingElements: {[key: string]: HTMLInputElement} = {}
  for (const existing of list.querySelectorAll<HTMLInputElement>('label[aria-checked=true] > div > input[hidden]')) {
    existingElements[`${existing.name}${existing.value}`] = existing
  }

  const template = list.querySelector<HTMLTemplateElement>('template')!

  // remove all non-selected items after the template element
  let cutoffPoint = template.nextElementSibling
  while (cutoffPoint) {
    const el = cutoffPoint
    cutoffPoint = el.nextElementSibling
    if (
      el instanceof HTMLElement &&
      (el.getAttribute('aria-checked') === 'true' || el.classList.contains('select-menu-divider'))
    ) {
      el.hidden = true
    } else {
      el.remove()
    }
  }

  // create new list of items
  const items = document.createDocumentFragment()
  const typeAheadData = typeAheadCache.get(list)
  const limit = options.limit
  let visible = 0

  function addItem(label: Label) {
    const containsQueryText = `${label.name}`.toLowerCase().trim().includes(queryText.toLocaleLowerCase())
    const matching = !(limit != null && visible >= limit) && containsQueryText
    const shouldGenerate = matching || label.selected
    if (shouldGenerate) {
      const item = createLabelItem(label, template, existingElements, typeAheadData)
      item.hidden = !matching
      if (matching) visible++
      items.appendChild(item)
    }
  }

  for (const l of data.labels) {
    addItem(l)
  }

  // add new items to DOM
  list.append(items)
  return visible
}

function initializeTypeAheadCache(list: Element) {
  typeAheadCache.set(list, {
    lastSearchResult: {labels: []},
    cachedSuggestions: [],
    labelResultCache: new Map<string, HTMLElement>(),
  })
}

async function getData(list: Element, queryText: string): Promise<Data> {
  if (!typeAheadCache.has(list)) {
    initializeTypeAheadCache(list)
  }

  const hasPreRenderedData = list.hasAttribute('data-filterable-data-pre-rendered')
  if (hasPreRenderedData) {
    return getPreRenderedLabels(list)
  }

  return await fetchQueryIfNeeded(list, queryText)
}

// This function will try to find any server side rendered users through the tag `.js-filterable-label`
// If any are found, they will be added to the API returned data.
function getPreRenderedLabels(list: Element): Data {
  const data = []
  // Add all server rendered labels to our data
  const labels = list.querySelectorAll<HTMLElement>('.js-filterable-label')
  list.removeAttribute('data-filterable-data-pre-rendered')

  // If the list has been refreshed, or first time loaded, this will be non-zero, and therefore we clear the array and re-add the new items
  if (labels.length > 0) {
    // Read the server-side rendered elements that need to be added to suggestions.
    // This is a work-around to allow the server-side rendered elements to work with the filtering.
    for (const renderedLabel of list.querySelectorAll<HTMLElement>('.js-filterable-label')) {
      renderedLabel.classList.remove('js-filterable-label')

      // Deconstruct the element into a <Label> object
      data.push({
        id: renderedLabel.querySelector('input[hidden]')!.getAttribute('value') || '',
        name: renderedLabel.querySelector('input[hidden]')!.getAttribute('data-label-name') || '',
        htmlName: renderedLabel.querySelector('.js-label-name-html')!.textContent!,
        description: renderedLabel.querySelector('.js-label-description')?.textContent || '',
        color: renderedLabel.querySelector('.js-label-color')!.getAttribute('label-color') || '',
        selected: renderedLabel.getAttribute('aria-checked') === 'true',
        element: renderedLabel,
      })
    }
  }

  // If the list has been refreshed, or first time loaded, this will be non-zero, and therefore we clear the array and re-add the new items
  const typeAheadData = typeAheadCache.get(list)!
  if (data.length > 0) {
    typeAheadData.cachedSuggestions = data
    typeAheadData.lastSearchText = ''
    typeAheadData.lastSearchResult = {labels: data}
  }

  return typeAheadData.lastSearchResult
}

async function fetchQueryIfNeeded(list: Element, queryText: string): Promise<Data> {
  const url = new URL(list.getAttribute('data-filterable-src') || '', window.location.origin)
  if (url.pathname === '/') throw new Error('could not get data-filterable-src')

  const typeAheadData = typeAheadCache.get(list)!
  const trimmedText = queryText.trim()
  if (typeAheadData.lastSearchText === trimmedText) {
    return typeAheadData.lastSearchResult
  }

  typeAheadData.lastSearchText = trimmedText

  const inputId = list.getAttribute('data-filterable-for') || ''
  const inputElement = document.getElementById(inputId)

  // Abort any old requests (if any)
  abortController.abort()
  // Abort controller needs to be re-created, there exists one per abort.
  abortController = new AbortController()
  const requestHeaders = {
    headers: {Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
    signal: abortController.signal,
  }

  const params = url.searchParams || new URLSearchParams()
  params.set('q', queryText)
  params.set('typeAhead', 'true')
  url.search = params.toString()

  inputElement?.classList.add('is-loading')

  const response = await fetch(url.toString(), requestHeaders)
  typeAheadData.lastSearchResult = await response.json()

  inputElement?.classList.remove('is-loading')
  return typeAheadData.lastSearchResult
}

function createLabelItem(
  label: Label,
  template: HTMLTemplateElement,
  existingElements: Record<string, HTMLElement>,
  typeAheadData: TypeAheadData | undefined,
): HTMLElement {
  if (label.element != null) {
    return label.element
  }

  const resultCache = typeAheadData?.labelResultCache.get(label.id)
  if (resultCache) {
    return resultCache
  }

  const li = template.content.cloneNode(true) as HTMLElement
  const input = li.querySelector<HTMLInputElement>('input[type=checkbox]')!

  input.value = label.id!
  input.setAttribute('data-label-name', label.name)

  const inputKey = `${input.name}${label.id}`
  let selected = label.selected
  if (existingElements[inputKey]) {
    selected = true
    existingElements[inputKey]!.remove()
    delete existingElements[inputKey]
  }

  const item = li.querySelector<HTMLElement>('[role^=menuitem]')!
  if (selected) {
    item.setAttribute('aria-checked', 'true')
    input.checked = true
  }

  const id = li.querySelector('.js-label-id')
  if (id) id.setAttribute('data-name', label.id)

  const color = li.querySelector('.js-label-color')
  if (color) {
    const newStyle = color.getAttribute('style')?.replace('background-color:', `background-color:#${label.color};`)
    color.setAttribute('style', newStyle!)
  }

  const htmlName = li.querySelector('.js-label-name-html')
  if (htmlName) htmlName.innerHTML = label.htmlName!

  const labelDescription = li.querySelector('.js-label-description')
  if (labelDescription) {
    if (label.description) {
      labelDescription.textContent = label.description
    } else {
      labelDescription.remove()
    }
  }

  label.element = item
  typeAheadData?.labelResultCache.set(label.id, item)

  return label.element
}
