import {debounce} from '@github/mini-throttle'
import {reportError} from '@github-ui/failbot'
import {useEffect} from 'react'

import {useCurrentBlame} from './CurrentBlame'
import {useIsCursorEnabled} from './use-cursor-navigation'

export interface SymbolUnderPointer {
  node: Node
  lineNumber: number
  offset: number
}

export function useSymbolUnderPointer(
  onSymbolChanged: (symbolUnderPointer: SymbolUnderPointer) => void,
  validCodeNav: boolean,
): void {
  const hasBlame = !!useCurrentBlame()
  const cursorEnabled = useIsCursorEnabled()

  useEffect(() => {
    // We don't show the symbols pane on the blame page, so we don't need to add these event listeners.
    if (hasBlame || !validCodeNav || cursorEnabled) return

    let timer: ReturnType<typeof setTimeout>

    const debouncedMouseMove = debounce((event: MouseEvent) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        handleMouseMove(event, onSymbolChanged)
      }, 15)
    }, 5)
    window.addEventListener('mousemove', debouncedMouseMove)
    return () => {
      window.removeEventListener('mousemove', debouncedMouseMove)
    }
  }, [onSymbolChanged, hasBlame, validCodeNav, cursorEnabled])
}

function handleMouseMove(event: MouseEvent, onSymbolChanged: (value: SymbolUnderPointer) => void) {
  const range = matchFromPoint(/\w+[!?]?/g, event.clientX, event.clientY)
  if (!range) {
    return null
  }

  const rangeElement: HTMLElement | null = range.commonAncestorContainer.parentElement
  if (!rangeElement) return
  for (const className of rangeElement.classList) {
    // pl-token: class added when a symbol is highlighted (has a definition)
    // pl-c: comment
    // pl-s: string
    // pl-k: constant
    if (['pl-token', 'pl-c', 'pl-s', 'pl-k'].includes(className)) {
      return null
    }

    const text = range.toString()
    if (!text || text.match(/\n|\s|[();&.=",]/)) {
      return null
    }

    const {lineNumber, offset, node} = getRowColumnNode(range)
    if (lineNumber === 0 && offset === 0) {
      return null
    }

    if (!node) {
      return null
    }

    return onSymbolChanged({lineNumber, offset, node})
  }
}

// Returns a zero-indexed position of the range in utf16 code units and the node that matched.
function getRowColumnNode(range: Range): {lineNumber: number; offset: number; node: Node | null} {
  let node = range.startContainer
  let offset: number = range.startOffset

  for (;;) {
    let prev = node.previousSibling
    while (prev) {
      offset += (prev.textContent || '').length
      prev = prev.previousSibling
    }
    const parent = node.parentElement
    if (parent) {
      if (parent.classList.contains('react-file-line')) {
        const row = parseInt((parent as Element).getAttribute('data-line-number') || '1', 10)
        return {
          lineNumber: row,
          offset,
          node,
        }
      } else {
        node = parent
      }
    } else {
      return {
        lineNumber: 0,
        offset: 0,
        node: null,
      }
    }
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

/**
 * Returns matching text range given screen offsets.
 * Examples
 *
 * Find nearest word under mouse cursor
 * matchFromPoint(/\w+/g, event.clientX, event.clientY)
 *
 * Returns Range or null if nothing matches position.
 */
export function matchFromPoint(regexp: RegExp, x: number, y: number): Range | undefined | null {
  let textNode: Node | undefined = undefined
  let offset: number | undefined = undefined

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

  if (!textNode || typeof offset !== 'number' || textNode.nodeType !== Node.TEXT_NODE || !textNode.textContent) {
    return null
  }

  const match = findNearestMatch(textNode.textContent, regexp, offset)
  if (!match) {
    return null
  }

  const matchedRange = document.createRange()
  matchedRange.setStart(textNode, match[1])
  matchedRange.setEnd(textNode, match[2])

  return matchedRange
}

/**
 * Find nearest match in string given a starting offset.
 *
 * Similar to String#scan, but only returns one result around the given offset.
 *
 * Examples
 *
 * findNearestMatch("The quick brown fox jumps over the lazy dog", /\w+/g, 1)
 * ["The", 0, 3]
 *
 * findNearestMatch("The quick brown fox jumps over the lazy dog", /\w+/g, 18)
 * ["fox", 16, 19]
 *
 * Return matching string, start and end offsets. Otherwise returns null for no match.
 */
function findNearestMatch(str: string, regexp: RegExp, offset: number): [string, number, number] | null {
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
