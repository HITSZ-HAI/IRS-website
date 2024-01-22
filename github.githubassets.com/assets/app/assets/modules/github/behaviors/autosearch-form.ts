// Autosearch form
//
// Automatically replaces the contents of a container against a search field
// in the search form.
//
// Note: Using `data-throttled-autosubmit` means that the form will autosubmit
// on input with a bit of throttle so that we don't send unnessesary requests
// to the server. See `app/assets/modules/github/behaviors/autosubmit.js`.
//
// Markup:
//
// `data-autosearch-results-container` - The ID of the container to update with results
//
// <form action="/search" data-autosearch-results-container="search-results">
//   <input type="search" placeholder="Find something" data-throttled-autosubmit>
//   <div id="search-results">
//     This content will get replaced when the input changes
//   </div>
// </form>
//
import {announceFromElement} from '@github-ui/aria-live'
import {combineGetFormSearchParams} from '@github-ui/form-utils'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {parseHTML} from '@github-ui/parse-html'
import {replaceState} from '../history'

let previousController: AbortController | null = null
let resultsTimeout: ReturnType<typeof setTimeout> | undefined
const NO_DELAY = 0
const SCREEN_READER_DELAY = 500
on('submit', '[data-autosearch-results-container]', async function (event) {
  const form = event.currentTarget
  if (!(form instanceof HTMLFormElement)) return
  event.preventDefault()

  previousController?.abort()
  form.classList.add('is-sending')
  const url = new URL(form.action, window.location.origin)
  const method = form.method
  const formData = new FormData(form)
  const serialized = combineGetFormSearchParams(url, formData)
  let body = null
  if (method === 'get') {
    url.search = serialized
  } else {
    body = formData
  }
  const {signal} = (previousController = new AbortController())
  const request = new Request(url.toString(), {
    method,
    body,
    signal,
    headers: {Accept: 'text/html', 'X-Requested-With': 'XMLHttpRequest'},
  })
  let response: Response | null = null
  try {
    response = await fetch(request)
  } catch {
    // Ignore network errors
  }
  form.classList.remove('is-sending')
  if (!response || !response.ok || signal.aborted) return
  const id = form.getAttribute('data-autosearch-results-container')
  const resultsContainer = id ? document.getElementById(id) : null
  if (resultsContainer) {
    const oldHeight = resultsContainer.style.height
    resultsContainer.style.height = getComputedStyle(resultsContainer).height
    resultsContainer.textContent = ''
    if (resultsTimeout !== undefined) clearTimeout(resultsTimeout)
    const delayResults = resultsContainer.hasAttribute('data-delay-results')
    const results = await response.text()

    // The screenreader will try to find an element with [data-autosearch-results] attributes to read.
    // Otherwise it will fallback to the first element from the response.
    const resultsContent =
      parseHTML(document, results).querySelector('[data-autosearch-results]') ||
      parseHTML(document, results).firstElementChild

    resultsTimeout = setTimeout(
      () => {
        resultsContainer.appendChild(parseHTML(document, results))
        announceFromElement(resultsContent as HTMLElement)
        requestAnimationFrame(() => {
          resultsContainer.style.height = oldHeight
        })
      },
      delayResults ? SCREEN_READER_DELAY : NO_DELAY,
    )
  }
  replaceState(null, '', `?${serialized}`)
})
