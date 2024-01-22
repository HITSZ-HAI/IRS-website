import type {CodeSection} from '@github-ui/code-nav'
import {ObservableSet} from '@github-ui/observable'
import {useObservedState, useSubscription} from '@github-ui/react-observable'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {ssrSafeDocument} from '@github-ui/ssr-utils'

// eslint-disable-next-line no-restricted-imports
import {type BlobOffset, type BlobRange, DOMRangeFromBlob} from '../../github/blob-anchor'
import type {CodeLineData} from '../components/blob/BlobContent/Code/hooks/use-code-lines'
import {matchElementId} from '../components/blob/BlobContent/HighlightedOverlay'
import {charWidthMac} from '../hooks/use-cursor-navigation'
import type {SetStickyLinesType} from '../hooks/use-sticky-lines'

const rowCollapseStyleId = 'collapse-show-rows-styles'
const CODE_CELL_PADDING = 10
export const textAreaId = 'read-only-cursor-text-area'

export function queryLineElement(anchorPrefix: string, line: number) {
  return document.querySelector<HTMLElement>(`#${anchorPrefix}LC${line}`)
}

export function queryMatchElement(line: number, column: number) {
  return document.querySelector<HTMLElement>(`main #${matchElementId(line, column)}`)
}

const collapsedRows = new ObservableSet<number>()

export function useIsLineCollapsed(lineNumber: number) {
  return useObservedState(collapsedRows.has(lineNumber))
}
export function useLinesSubscription(callbackFunc: (collapsedSections: Set<number>) => void) {
  return useSubscription(collapsedRows, callbackFunc)
}

export function buildRowClass(
  codeSectionArray: CodeSection[],
  lineNumber: number,
  isEndLine: boolean,
  ownedCodeSections: Map<number, CodeSection[]> | null,
) {
  if (!ownedCodeSections) return ''

  let rowHideClassName = ''
  for (let i = 0; i < codeSectionArray.length; i++) {
    rowHideClassName += `${getLineChildClassName(codeSectionArray[i]!.startLine)} `
  }
  if (isEndLine && ownedCodeSections.has(lineNumber)) {
    const sections = ownedCodeSections.get(lineNumber)
    if (sections) {
      for (let j = 0; j < sections.length; j++) {
        rowHideClassName += `${getLineChildClassName(sections[j]!.startLine)} `
      }
    }
  }
  return rowHideClassName
}

function getLineChildClassName(lineNumber: number) {
  return `child-of-line-${lineNumber}`
}

export function applyStickyToParentStartLines(
  map: Map<number, CodeLineData[]>,
  line: number,
  codeLineToSectionMap: Map<number, CodeSection[]> | undefined,
  onLineStickOrUnstick: SetStickyLinesType,
) {
  if (!codeLineToSectionMap) return
  const sections = codeLineToSectionMap.get(line)
  if (sections) {
    for (const section of sections) {
      const startLines = map.get(section.endLine)
      if (startLines) {
        for (const startLine of startLines) {
          if (line > startLine.lineNumber) {
            onLineStickOrUnstick(startLine, false)
          }
        }
      }
    }
  }
}

export function expandRow(lineNumber: number) {
  setStylesForRow(lineNumber, false)
  collapsedRows.delete(lineNumber)
}
export function collapseRow(lineNumber: number) {
  setStylesForRow(lineNumber, true)
  collapsedRows.add(lineNumber)
}

export function expandAllRows() {
  const styleSheet = document.getElementById(rowCollapseStyleId)
  if (styleSheet) {
    styleSheet.textContent = ''
  }

  collapsedRows.clear()
}

//This is using direct dom manipulation for the styling becasue doing it in a react way would potentially
//cause a lot of re-renders, and we don't want to have constant re-rendering when someone is simply expanding and
//collapsing a given row. I did a reasonable amount of research trying to find if there was a react specific way to
//add and remove stylesheets, but there weren't any examples that came up in my googling.
function setStylesForRow(lineNumber: number, isCollapsed: boolean) {
  const styles = `.${getLineChildClassName(lineNumber)} { display: none; } `

  if (document.getElementById(rowCollapseStyleId)) {
    const styleSheet = document.getElementById(rowCollapseStyleId)
    if (isCollapsed) {
      styleSheet!.textContent += styles
    } else {
      let sheetTextContent = styleSheet?.textContent || ''
      sheetTextContent = sheetTextContent.replace(styles, '')
      styleSheet!.textContent = sheetTextContent
    }
  } else {
    //this case will ideally only run once, the very first time someone collapses a row
    const styleSheet = document.createElement('style')
    styleSheet.id = rowCollapseStyleId
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

const codeTextAttribute = 'data-code-text'

export function isNodeTokenNode(line: SafeHTMLString, charOffset: number): boolean {
  const fragment = document.createRange().createContextualFragment(line)
  let textLengthSoFar = 0
  for (const node of [...fragment.childNodes]) {
    if (node instanceof HTMLElement) {
      if (node.textContent) {
        textLengthSoFar += node.textContent.length
      } else if (node.getAttribute(codeTextAttribute)) {
        textLengthSoFar += node.getAttribute(codeTextAttribute)!.length
      }
      // >= because we want the end of a symbol to count as in the symbol node
      if (textLengthSoFar >= charOffset) {
        if (isSymbolNode(node)) {
          return true
        } else {
          return false
        }
      }
    } else if (node instanceof Text) {
      if (node.textContent) {
        textLengthSoFar += node.textContent.length
      }
      //only greater than not equal to because we want a the beginning of a symbol to count as in the symbol node
      if (textLengthSoFar > charOffset) {
        return false
      }
    }
  }
  return false
}

export function isSymbolNode(node: Node): node is HTMLSpanElement {
  if (!(node instanceof HTMLSpanElement)) return false

  const text = node.getAttribute(codeTextAttribute) ?? node.textContent ?? ''
  const classes = [...node.classList].join(' ')

  return isSymbol(text, classes)
}

export function isSymbol(text: string, className: string) {
  if (text.length < 3) return false

  const classesArray = className.split(' ')
  //we are okay with quotes being present in the symbol if the symbol's class is pl-ent
  const matchRegEx = classesArray.includes('pl-ent') ? /\n|\s|[();&.=,]/ : /\n|\s|[();&.=",]/
  if (text.match(matchRegEx)) return false

  if (classesArray.includes('pl-c') || classesArray.includes('pl-k')) return false // comments or keywords

  return true
}

export function getCodeSymbolFromPoint(x: number, y: number): string | null {
  let nodeAtPoint: Node | undefined = undefined

  nodeAtPoint ??= document.caretPositionFromPoint?.(x, y)?.offsetNode
  if (nodeAtPoint) {
    //for firefox we need to do additional massaging to get the actual element that has the clicked text
    const offset = document.caretPositionFromPoint?.(x, y)?.offset ?? 1
    //item list is 0 indexed, offset is 1 indexed
    nodeAtPoint = nodeAtPoint.childNodes.item(offset - 1)
  }
  // eslint-disable-next-line compat/compat
  nodeAtPoint ??= document.caretRangeFromPoint?.(x, y)?.startContainer

  if (!nodeAtPoint || !isSymbolNode(nodeAtPoint)) return null

  return nodeAtPoint.getAttribute(codeTextAttribute)
}

/**
 * From a text node and offset, find the line number that line is on and the offset within that line
 * @param textNode The node to find the line number for
 * @param offset The offset within the text node
 * @returns The line number and character column of the line
 */
export function calculateLineAndColumn(textNode: Node, offset: number): BlobOffset | undefined {
  let lineNumber = null
  let lineElement = null
  let childNode = null
  let column = offset

  // Determine if the code is highlighted or not
  if (textNode.parentElement?.classList.contains('react-file-line')) {
    lineNumber = textNode.parentElement.getAttribute('data-line-number')
    lineElement = textNode.parentElement
    childNode = textNode
  } else if (textNode.parentElement?.parentElement?.classList.contains('react-file-line')) {
    lineNumber = textNode.parentElement.parentElement.getAttribute('data-line-number')
    lineElement = textNode.parentElement.parentElement
    childNode = textNode.parentNode
    // If we highlight to the end of the line, the textNode will be the line element
  } else if (textNode.parentElement?.firstElementChild?.classList.contains('react-file-line')) {
    lineNumber = textNode.parentElement.firstElementChild.getAttribute('data-line-number')
    if (!lineNumber || !parseInt(lineNumber, 10)) {
      return
    }
    return {line: parseInt(lineNumber, 10) - 1, column: null}
  } else {
    return
  }

  if (!lineNumber || !parseInt(lineNumber, 10)) {
    return
  }

  for (const child of lineElement.childNodes) {
    if (child === childNode) {
      break
    }
    column += child.textContent?.length || 0
  }

  return {line: parseInt(lineNumber, 10), column: column !== 0 ? column + 1 : null}
}

export interface HighlightPosition {
  offset?: number
  width?: number
}
export function determineProperOffsetWithDummyDiv(charOffset: number, lineRawText: string, tabSize: number) {
  const dummyDiv = document.createElement('div')
  dummyDiv.style.position = 'absolute'
  dummyDiv.style.visibility = 'hidden'
  dummyDiv.style.fontFamily = 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace'
  dummyDiv.style.fontSize = '12px'
  dummyDiv.style.lineHeight = '20px'
  dummyDiv.style.whiteSpace = 'pre'
  dummyDiv.style.tabSize = tabSize.toString()

  dummyDiv.textContent = lineRawText.slice(0, charOffset)
  document.body.appendChild(dummyDiv)
  const offset = dummyDiv.clientWidth
  document.body.removeChild(dummyDiv)
  if (offset === 0 && charOffset !== 0) {
    //we are in a test or some other issue came up, return approximation
    return charOffset * charWidthMac
  }
  return offset
  // else {
  //   //TODO: this needs a lot of work, need to figure out the char offset in the last part of the line somehow
  //   dummyDiv.style.whiteSpace = 'pre-wrap'
  //   dummyDiv.textContent = lineRawText
  //   document.body.appendChild(dummyDiv)
  //   const offset = dummyDiv.clientHeight
  //   document.body.removeChild(dummyDiv)
  //   if (offset === 0 && charOffset !== 0) {
  //     //we are in a test or some other issue came up, return approximation
  //     return charOffset * charWidth
  //   }
  //   return offset
  // }
}
export function calculateHighlightOffsetAndWidth(
  highlightedInfo: BlobRange,
  lineElement: HTMLElement,
  lineNumber: number,
  tabSize: number,
  rawText: string,
): HighlightPosition | undefined {
  if (highlightedInfo?.start.line === lineNumber && highlightedInfo?.start.column !== null) {
    const range = DOMRangeFromBlob(
      {
        start: highlightedInfo.start,
        end: {
          line: highlightedInfo.start.line,
          column: highlightedInfo.end.line === lineNumber ? highlightedInfo.end.column : null,
        },
      },
      () => lineElement,
    )

    if (range && range.startContainer.parentElement) {
      const lineOffset = range?.getBoundingClientRect().x - lineElement.getBoundingClientRect().x

      return {
        offset: lineOffset + CODE_CELL_PADDING,
        width: highlightedInfo.end.line === lineNumber ? range.getBoundingClientRect().width : undefined,
      }
    } else if (rawText) {
      const offset = determineProperOffsetWithDummyDiv(highlightedInfo.start.column - 1, rawText, tabSize)
      const endColumn = highlightedInfo.end.line === lineNumber ? highlightedInfo.end.column : null

      return {
        // need to multiply by 2 because we're purely calculating the width of the text, not including any padding
        offset: offset + CODE_CELL_PADDING * 2,
        width:
          highlightedInfo.end.line === lineNumber
            ? determineProperOffsetWithDummyDiv(endColumn ? endColumn - 1 : rawText.length - 1, rawText, tabSize) -
              offset
            : undefined,
      }
    }
  } else if (highlightedInfo?.end.line === lineNumber && highlightedInfo?.end.column !== null) {
    const range = DOMRangeFromBlob(
      {
        start: {line: highlightedInfo.end.line, column: 0},
        end: highlightedInfo.end,
      },
      () => lineElement,
    )

    if (range) {
      return {
        width: range.getBoundingClientRect().width + CODE_CELL_PADDING,
      }
    } else {
      return {
        width: determineProperOffsetWithDummyDiv(highlightedInfo.end.column - 1, rawText, tabSize) + CODE_CELL_PADDING,
      }
    }
  }
}

export function isLineInViewport(lineNumber: number): boolean {
  const line = queryLineElement('', lineNumber)
  return isInViewport(line)
}
export function getElementForLine(lineNumber: number): HTMLElement | null {
  return queryLineElement('', lineNumber)
}
function isInViewport(element: HTMLElement | null): boolean {
  if (!element) return false

  const rect = element.getBoundingClientRect()
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
}

export function calculateLineNumberFromOffset(pageYOffset: number, topPageSpace: number, lineHeight: number) {
  const line = Math.floor((pageYOffset - topPageSpace) / lineHeight)
  return line + 1 //line numbers are 1 indexed
}

export function getActualLineNumberBinarySearch(wrongLineNumber: number, linesData: readonly CodeLineData[]) {
  let low = 0
  let high = linesData.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const midElement = linesData[mid]
    if (!midElement) return -1
    if (midElement.lineNumber === wrongLineNumber) {
      return mid
    } else if (midElement.lineNumber < wrongLineNumber) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return -1
}

function createScreenReaderAnnouncementDiv() {
  if (typeof ssrSafeDocument === 'undefined') return
  const dummyDiv = ssrSafeDocument.createElement('div')
  dummyDiv.classList.add('sr-only')
  dummyDiv.id = 'screenReaderAnnouncementDiv'
  dummyDiv.setAttribute('role', 'alert')
  dummyDiv.setAttribute('aria-live', 'assertive')
  ssrSafeDocument.body.appendChild(dummyDiv)
}

export function forceAnnouncementToScreenReaders(textToAnnounce: string, timeoutBeforeAnnouncing = 0) {
  if (typeof ssrSafeDocument === 'undefined') return
  let screenReaderDiv = ssrSafeDocument.getElementById('screenReaderAnnouncementDiv')

  if (!screenReaderDiv) {
    createScreenReaderAnnouncementDiv()
  }
  screenReaderDiv = ssrSafeDocument.getElementById('screenReaderAnnouncementDiv')
  if (!screenReaderDiv) return //something went wrong creating the div

  const textToAnnounceDeDuped =
    screenReaderDiv.textContent === textToAnnounce ? `${textToAnnounce}\u00A0` : textToAnnounce

  setTimeout(() => {
    if (screenReaderDiv) {
      screenReaderDiv.textContent = textToAnnounceDeDuped
    }
  }, timeoutBeforeAnnouncing)
}
