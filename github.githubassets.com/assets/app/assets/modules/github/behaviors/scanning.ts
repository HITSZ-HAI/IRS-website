import type {BlobRange} from '../blob-anchor'
import {DOMRangeFromBlob} from '../blob-anchor'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {surroundContents} from '../range'
import {GetCharIndexFromBytePosition} from '@github-ui/text'

function queryLineElement(snippet: Element, line: number) {
  return snippet.querySelector(`#LC${line}`)
}

function highlightRange(blobRange: BlobRange, snippet: Element, adjustStart: boolean, adjustEnd: boolean) {
  const range = DOMRangeFromBlob(blobRange, line => queryLineElement(snippet, line))
  if (!range) return

  if (adjustStart) {
    const adjustedStart = GetCharIndexFromBytePosition(range.startContainer.textContent!, range.startOffset)
    if (adjustedStart === -1) return
    range.setStart(range.startContainer, adjustedStart)
  }

  if (adjustEnd) {
    const adjustedEnd = GetCharIndexFromBytePosition(range.endContainer.textContent!, range.endOffset)
    if (adjustedEnd === -1) return
    range.setEnd(range.endContainer, adjustedEnd)
  }

  const span = document.createElement('span')
  const highlightClasses = ['text-bold', 'hx_keyword-hl', 'rounded-2', 'd-inline-block']

  span.classList.add(...highlightClasses)
  surroundContents(range, span)
}

export function highlightColumns(blobRange: BlobRange, snippet: Element) {
  if (blobRange.start.line !== blobRange.end.line) {
    // highlight first line, and adjust only the start as there may be Unicode characters
    // preceding the start column
    const startBlobRange = {
      start: {line: blobRange.start.line, column: blobRange.start.column},
      end: {line: blobRange.start.line, column: null},
    }
    highlightRange(startBlobRange, snippet, true, false)

    for (let i = blobRange.start.line + 1; i < blobRange.end.line; i += 1) {
      // highlight middle lines, and do not adjust anything since we're highlighting
      // the whole line
      const fullBlobRange = {
        start: {line: i, column: 0},
        end: {line: i, column: null},
      }
      highlightRange(fullBlobRange, snippet, false, false)
    }

    // highlight last line, and only adjust the end as there may be Unicode characters
    // in the middle of the match
    const endBlobRange = {
      start: {line: blobRange.end.line, column: 0},
      end: {line: blobRange.end.line, column: blobRange.end.column},
    }
    highlightRange(endBlobRange, snippet, false, true)
  } else {
    highlightRange(blobRange, snippet, true, true)
  }
}

export function parseColumnHighlightRange(snippet: Element): BlobRange | null {
  const startLine = parseInt(snippet.getAttribute('data-start-line')!)
  const endLine = parseInt(snippet.getAttribute('data-end-line')!)
  const startColumn = parseInt(snippet.getAttribute('data-start-column')!)
  // The end column is a special case, as 0 acts as a special value
  const dataEndColumn = parseInt(snippet.getAttribute('data-end-column')!)

  // Nothing to highlight if start and end lines and start and end cols are the
  // same, as column ranges are half-open
  if (startLine === endLine && startColumn === dataEndColumn) return null

  // 0 here indicates that no end column was provided, so the highlight should
  // continue to the end of the line.
  // DOMRangeFromBlob will interpret null in a similar way to this.
  const endColumn = dataEndColumn !== 0 ? dataEndColumn : null

  return {
    start: {line: startLine, column: startColumn},
    end: {line: endLine, column: endColumn},
  }
}

observe('.js-highlight-code-snippet-columns', function (snippet: Element) {
  const blobRange = parseColumnHighlightRange(snippet)
  if (blobRange !== null) {
    highlightColumns(blobRange, snippet)
  }
})
