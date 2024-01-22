// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {reportError} from '@github-ui/failbot'

// When a code nav response returns precise and search-based backends,
// we allow the user to retry their code nav query with the alternative
// backend.  This observe block is responsible for handling the retry
// logic,  making the async fetch request,  and updating the
// code nav modal with the new response.
on('click', '.js-code-nav-retry', async function (event) {
  // Ignore clicks with modifier keys
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */

  const popover = document.querySelector<HTMLElement>('.js-tagsearch-popover')
  if (!popover) return

  const popoverContent = popover.querySelector<HTMLElement>('.js-tagsearch-popover-content')
  if (!popoverContent) return

  // Because the definitions endpoint is responsible for rendering
  // the code nav modal's tabs and content,  a different dom element
  // target is required for overwriting the html returned from the fetch.
  let updateTarget: HTMLElement | null
  const target = event.currentTarget as HTMLElement
  const codeNavKind = target.getAttribute('data-code-nav-kind')
  if (codeNavKind === 'definitions') {
    updateTarget = popover.querySelector<HTMLElement>('.js-tagsearch-popover-content')
  } else {
    updateTarget = popover.querySelector<HTMLElement>('.js-code-nav-references')
  }
  if (!updateTarget) return

  const retryUrl = target.getAttribute('data-code-nav-url')
  if (!retryUrl) return

  const codeNavUrl = new URL(retryUrl, window.location.origin)
  try {
    const response = await fetch(codeNavUrl.toString(), {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    if (!response.ok) {
      return
    }
    const html = await response.text()
    if (!html) return

    updateTarget.innerHTML = html
  } catch {
    return
  }

  // Because a user has to scroll to trigger this retry behavior,
  // the code nav modal's scroll will need to be reset.
  popoverContent.scrollTop = 0
})

observe('.js-code-nav-container', {
  constructor: HTMLElement,
  subscribe(file) {
    const repoContainer = file
    const popover = document.querySelector('.js-tagsearch-popover') as HTMLElement
    if (!(popover instanceof HTMLElement))
      return {
        unsubscribe() {
          // Used as a no operation placeholder for unsubscribing if there is no popover.
        },
      }
    const popoverContent = popover.querySelector<HTMLElement>('.js-tagsearch-popover-content')!
    const popoverHTML = new WeakMap()
    const wrapCache = new WeakMap()

    let activeToken: Element | undefined

    // initialize requires both `popover` and `activeToken` to be defined.
    initialize()

    // The code nav modal is sticky in the PR view.  When a user navigates to a location from the modal,
    // and uses the 'back' button,  the code nav modal is still present,  and the active token (click target)
    // retains the CSS classes added to it by the `onMouseOver()` event listener.
    // This function ensures regardless of the user's previous navigation actions that the code nav modal is
    // always reset to hidden on a new blob view, and any previous active token classes are removed from their elements.
    function initialize() {
      hidePopover()
      for (const el of document.getElementsByClassName('pl-token')) {
        el.classList.remove('pl-token', 'active')
      }
    }

    async function onMouseMove(event: MouseEvent) {
      const range = matchFromPoint(/\w+[!?]?/g, event.clientX, event.clientY)
      if (!range) return

      const rangeElement = range.commonAncestorContainer.parentElement
      if (!rangeElement) return
      for (const className of rangeElement.classList) {
        if (['pl-token', 'pl-c', 'pl-s', 'pl-k'].includes(className)) return
      }

      if (rangeElement.closest('.js-skip-tagsearch')) {
        return
      }

      const text = range.toString()
      if (!text || text.match(/\n|\s|[();&.=",]/)) return

      let didCheckText = wrapCache.get(rangeElement)
      if (!didCheckText) {
        didCheckText = new Set()
        wrapCache.set(rangeElement, didCheckText)
      }
      if (didCheckText.has(text)) return
      didCheckText.add(text)

      const fileContainer = rangeElement.closest('.js-tagsearch-file')
      if (!fileContainer) return

      const path = fileContainer.getAttribute('data-tagsearch-path') || ''
      let lang = fileContainer.getAttribute('data-tagsearch-lang') || ''

      // Handle Ruby embedded in ERB templates
      if (lang === 'HTML+ERB') {
        if (rangeElement.closest('.pl-sre')) {
          lang = 'Ruby'
        } else {
          return
        }
      }

      if (file.classList.contains('js-code-block-container')) {
        lang = getCodeBlockLanguage(rangeElement) || ''
        // Ignore any requests where the range element is not in a code block
        // with a supported language
        if (!lang) return
      }

      const pos = getRowAndColumn(range)
      const wrapper = document.createElement('span')
      range.surroundContents(wrapper)
      wrapper.classList.add('pl-token')
      wrapper.addEventListener('click', async function (clickEvent: MouseEvent) {
        // Ignore clicks with modifier keys
        // TODO: Refactor to use data-hotkey
        /* eslint eslint-comments/no-use: off */
        if (clickEvent.altKey || clickEvent.ctrlKey || clickEvent.metaKey || clickEvent.shiftKey) return

        if (wrapper === activeToken) {
          hidePopover()
        } else {
          let html = undefined
          html = await fetchPopoverContents(popover, text, lang, pos, path)
          if (!html) return

          addPopoverElement(wrapper, html)
          popoverHTML.set(wrapper, html)

          setActivePopover(wrapper)
          populatePopover(wrapper)
          showPopover()
        }

        clickEvent.preventDefault()
      })
    }

    // Ensure popover list is reset to the top.
    function resetScrollTop() {
      popoverContent.scrollTop = 0
    }

    function addPopoverElement(wrapper: Element, html: string) {
      const temp = document.createElement('span')
      temp.innerHTML = html
      const details = temp.firstElementChild
      if (!details) return

      const dataHydroClick = details.getAttribute('data-hydro-click')
      const dataHydroClickHMAC = details.getAttribute('data-hydro-click-hmac')
      if (dataHydroClickHMAC && dataHydroClick) {
        wrapper.setAttribute('data-hydro-click', dataHydroClick)
        wrapper.setAttribute('data-hydro-click-hmac', dataHydroClickHMAC)
      }
    }

    function setActivePopover(token: HTMLElement) {
      if (activeToken) activeToken.classList.remove('active')
      activeToken = token
      activeToken.classList.add('active')
    }

    function populatePopover(token: HTMLElement) {
      popoverContent.innerHTML = popoverHTML.get(token) || ''

      positionPopover(token)
    }

    function positionPopover(token: HTMLElement) {
      const cRect = repoContainer.getClientRects()[0]!
      const rects = token.getClientRects()
      // If no rects are found return early.
      if (rects.length === 0) return
      const rect = rects[0]!
      popover.style.position = 'absolute'
      popover.style.zIndex = '3'
      if (repoContainer.classList.contains('position-relative')) {
        popover.style.top = `${rect.bottom - cRect.top + 7}px`
        popover.style.left = `${rect.left - cRect.left - 10}px`
      } else {
        popover.style.top = `${window.scrollY + rect.bottom}px`
        popover.style.left = `${window.scrollX + rect.left}px`
      }
    }

    function showPopover() {
      if (!popover.hidden) {
        // When existing popover is active and user clicks on different symbol, we need to still reset the navigation tabs and scrollTop for the popover's new contents.
        resetScrollTop()
        return
      }
      popover.hidden = false

      // Setting a scrollTop value only succeeds if the HTML element is visible.
      resetScrollTop()

      document.addEventListener('click', onDocumentClick)
      document.addEventListener('keyup', onKeyup)
      /* eslint-disable-next-line github/prefer-observers */
      window.addEventListener('resize', onResize)
    }

    function hidePopover() {
      if (popover.hidden) return
      popover.hidden = true

      if (activeToken) activeToken.classList.remove('active')
      activeToken = undefined

      document.removeEventListener('click', onDocumentClick)
      document.removeEventListener('keyup', onKeyup)
      window.removeEventListener('resize', onResize)
    }

    function onResize() {
      if (!(activeToken instanceof HTMLElement)) return
      positionPopover(activeToken)
    }

    function onDocumentClick(event: MouseEvent) {
      const {target} = event
      if (!(target instanceof Node)) return

      if (!popover.contains(target) && !activeToken!.contains(target)) {
        hidePopover()
      }
    }

    function onKeyup(event: KeyboardEvent) {
      // TODO: Refactor to use data-hotkey
      /* eslint eslint-comments/no-use: off */
      /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
      switch (event.key) {
        case 'Escape':
          hidePopover()
          break
      }
      /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
    }

    file.addEventListener('mousemove', onMouseMove)

    return {
      unsubscribe() {
        file.removeEventListener('mousemove', onMouseMove)
      },
    }
  },
})

async function fetchPopoverContents(
  popover: HTMLElement,
  text: string,
  lang: string,
  pos: [number, number],
  path: string,
): Promise<string> {
  const urlStr = popover.getAttribute('data-tagsearch-url')
  if (!urlStr) return ''
  const ref = popover.getAttribute('data-tagsearch-ref')
  if (!ref) return ''
  let codeNavContext = popover.getAttribute('data-tagsearch-code-nav-context')
  if (!codeNavContext) {
    codeNavContext = 'UNKNOWN_VIEW'
  }

  const url = new URL(urlStr, window.location.origin)
  const params = new URLSearchParams()
  params.set('q', text)
  params.set('blob_path', path)
  params.set('ref', ref)
  params.set('language', lang)
  params.set('row', pos[0].toString())
  params.set('col', pos[1].toString())
  params.set('code_nav_context', codeNavContext)
  url.search = params.toString()

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    if (!response.ok) {
      return ''
    }
    const html = await response.text()

    // Ignore responses with no definitions
    if (/js-tagsearch-no-definitions/.test(html)) return ''

    return html
  } catch {
    return ''
  }
}

interface CaretPosition {
  offsetNode: Node
  offset: number
}
declare global {
  interface Document {
    caretPositionFromPoint(x: number, y: number): CaretPosition | null
  }
}

// Returns matching text range given screen offsets.
//
// Examples
//
//   // Find nearest word under mouse cursor
//   matchFromPoint(/\w+/g, event.clientX, event.clientY)
//
// Returns Range or null if nothing matches position.
function matchFromPoint(regexp: RegExp, x: number, y: number): Range | undefined | null {
  let textNode: Node | undefined
  let offset: number | undefined

  if (document.caretPositionFromPoint) {
    const caret = document.caretPositionFromPoint(x, y)
    if (caret) {
      textNode = caret.offsetNode
      offset = caret.offset
    }
  } else if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y)
    if (range) {
      textNode = range.startContainer
      offset = range.startOffset
    }
  }

  if (!textNode || typeof offset !== 'number' || textNode.nodeType !== Node.TEXT_NODE) return

  const text = textNode.textContent
  const isEmpty = text?.replaceAll('\n', '').trim() === ''
  if (!text || isEmpty || textNode.nodeType !== Node.TEXT_NODE) {
    return null
  }
  const match = findNearestMatch(text, regexp, offset)
  if (!match) return null

  const matchedRange = document.createRange()
  matchedRange.setStart(textNode, match[1])
  matchedRange.setEnd(textNode, match[2])

  return matchedRange
}

// Find nearest match in string given a starting offset.
//
// Similar to String#scan, but only returns one result around the given offset.
//
// Examples
//
//   findNearestMatch("The quick brown fox jumps over the lazy dog", /\w+/g, 1)
//   // ["The", 0, 3]
//
//   findNearestMatch("The quick brown fox jumps over the lazy dog", /\w+/g, 18)
//   ["fox", 16, 19]
//
// Return matching string, start and end offsets. Otherwise returns null for no match.
export function findNearestMatch(str: string, regexp: RegExp, offset: number): [string, number, number] | null {
  let m
  let lastIndex = null
  while ((m = regexp.exec(str))) {
    // Prevent infinite loop from zero-length matches
    if (regexp.lastIndex === lastIndex) {
      reportError(new Error('regexp did not advance in findNearestMatch()'))
      return null
    }
    lastIndex = regexp.lastIndex
    const len = m.index + m[0].length
    if (m.index <= offset && offset <= len) {
      return [m[0], m.index, len]
    }
  }
  return null
}

// Get the language name of the embedded code block that the given element is
// located in. This will be used for files such as Markdown that can contain
// nested code blocks in multiple languages.
//
// Return language name or null
function getCodeBlockLanguage(element: Element): string | null {
  // FIXME Use js- class or data attributes for the language lookup/mappings
  const codeBlockElement = element.closest('.highlight')
  if (codeBlockElement) {
    for (const className of codeBlockElement.classList) {
      switch (className) {
        case 'highlight-source-go':
          return 'Go'
        case 'highlight-source-js':
          return 'JavaScript'
        case 'highlight-source-python':
          return 'Python'
        case 'highlight-source-ruby':
          return 'Ruby'
        case 'highlight-source-ts':
          return 'TypeScript'
      }
    }
  }

  return null
}

// Returns a zero-indexed position of the range in utf16 code units.
export function getRowAndColumn(range: Range): [number, number] {
  let node = range.startContainer
  let offset = range.startOffset
  let passParent = false
  for (;;) {
    let prev = node.previousSibling
    while (!passParent && prev) {
      // Diff views include additional DOM elements like comments and buttons that
      // don't appear in the DOM for regular blob views. HTML Comment and Button nodes
      // should not be included when calculating the offset (or column position). We only
      // want to count text that appears in the repository, so that the resulting column position
      // will align with the column position indexed by the code-navigation service for the symbol
      // under the user's cursor.
      if (!['#comment', 'BUTTON'].includes(prev.nodeName)) {
        offset += (prev.textContent || '').length
      }
      prev = prev.previousSibling
    }
    const parent = node.parentElement
    if (parent) {
      if (parent.classList.contains('js-code-nav-pass')) {
        // Compared with the standard blob view, the DOM structure in diff views is slightly different.
        // To make sure we don't over count the offset for the clicked symbol, some DOM elements'
        // text content should not be considered when calculating the symbol's column offset.
        // This conditional signals to not count any additional offsets until the parent DOM
        // element containing the symbol's line number is found.
        passParent = true
      } else if (parent.classList.contains('js-file-line')) {
        const lineNumber = parent.previousElementSibling!
        if (!lineNumber.classList.contains('js-code-nav-line-number')) {
          throw new Error('invariant')
        }
        const row = parseInt(lineNumber.getAttribute('data-line-number') || '1', 10)
        return [row - 1, offset]
      }
      node = parent
    } else {
      return [0, 0]
    }
  }
}
