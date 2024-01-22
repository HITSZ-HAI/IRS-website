import type {StylingDirective} from '@github-ui/code-view-types'
import {ObservableValue} from '@github-ui/observable'
import {useObservedState, useSubscription} from '@github-ui/react-observable'
import {useClientValue} from '@github-ui/use-client-value'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useIsPlatform} from '@github-ui/use-is-platform'
import {type RefObject, useCallback, useEffect, useMemo, useRef} from 'react'
// eslint-disable-next-line no-restricted-imports
import {useLocation} from 'react-router-dom'

// we are only using this within an effect, so it will not impact SSR
// eslint-disable-next-line no-restricted-imports
import {type BlobOffset, formatBlobRangeAnchor, parseFileAnchor} from '../../github/blob-anchor'
import type {CodeNavData} from '../components/blob/BlobContent/BlobContent'
import type {CodeLineData} from '../components/blob/BlobContent/Code/hooks/use-code-lines'
import {determineProperOffsetWithDummyDiv, getElementForLine, isLineInViewport, isSymbol} from '../utilities/lines'
import {useCurrentBlame} from './CurrentBlame'
import {useCurrentLineHeight} from './use-current-line-height'
import {focusSymbolPane} from './use-focus-symbol-pane'

export const charWidthMac = 7.2293
export const charWidthWindows = 6.6

// $lineNumberWidth from app/assets/stylesheets/bundles/code/react-blob.scss
// +
// padding-left  from .react-code-line-contents
// +
// padding-right from .react-code-line-contents
export const minLeftOffsetBlob = 92

//TODO: actually implement blame and figure out what this offset should be
export const minLeftOffsetBlame = 92

//arbitrarily chosen, could in theory determine the value from the screen size, just a constant for now
const defaultNumLinesToHopOnPageUpDown = 15

//extra space to the right of the cursor that we should scroll to provide additional context
const scrollRightOffset = 70

const startLineNumber = new ObservableValue(1)
const startCharacterNumber = new ObservableValue(0)
const endLineNumber = new ObservableValue(1)
const endCharacterNumber = new ObservableValue(0)

const keyboardNavUsed = new ObservableValue<boolean>(false)

//we need an easy way to get the line number to the goToLine dialog without having a bunch of drilling,
//and becuase this file's main hook is only used in one location, doing it with a local observable and an exported
//hook won't cause clashing
export function useCursorStartLineNumber(): number {
  return useObservedState(startLineNumber)
}

export function useCursorEndLineNumber(): number {
  return useObservedState(endLineNumber)
}

export function useKeyboardNavUsed(): boolean {
  return useObservedState(keyboardNavUsed)
}

/**
 * @returns a RefObject that contains the start and end indices of the current selection
 */
export function useCursorSelectionRef(): React.RefObject<{start: BlobOffset; end: BlobOffset} | null> {
  const ref = useRef<{start: BlobOffset; end: BlobOffset} | null>(null)

  function updateRef() {
    ref.current = {
      start: {line: startLineNumber.value, column: startCharacterNumber.value + 1},
      end: {line: endLineNumber.value, column: endCharacterNumber.value + 1},
    }
  }

  useSubscription(startLineNumber, updateRef)
  useSubscription(startCharacterNumber, updateRef)
  useSubscription(endLineNumber, updateRef)
  useSubscription(endCharacterNumber, updateRef)

  return ref
}

export function setKeyboardNavUsed(value: boolean) {
  keyboardNavUsed.value = value
}

//need the isBlame optional parameter because the useCurrentBlame context is not defined
//yet in the findInFileOpenContext, so it always returns undefined even if we are in blame
export function useIsCursorEnabled(isBlame?: boolean) {
  const wordWrapEnabled = useCodeViewOptions().codeWrappingOption.enabled
  const hasBlame = !!useCurrentBlame()
  const [isSSR] = useClientValue(() => false, true, [])

  return !wordWrapEnabled && !hasBlame && !isBlame && !isSSR
}

export function useCursorNavigation(
  cursorRef: RefObject<HTMLDivElement | null>,
  onCodeNavTokenSelected: ((symbol: CodeNavData) => void) | undefined,
  setLeftOffset: (offset: number) => void,
  setTopOffset: (offset: number) => void,
  linesData: readonly CodeLineData[],
  isVirtualized: boolean,
  isBlame: boolean,
  onLineNumberClick: React.MouseEventHandler<HTMLElement> | undefined,
  textAreaRef: RefObject<HTMLTextAreaElement | null> | undefined,
  tabSize: number,
  additionalTextAreaInstructions: string,
  textSelection?: {start: number; end: number; keyboard: boolean; displayStart: boolean} | undefined,
) {
  //keeping track of line and char separately from the offsetbecause with char specifically, we get into
  //floating point issues when checking if we are at the start of the line. Just multiplying by the charWidth is simpler
  const currentStartLine = useRef(0)
  const currentStartChar = useRef(0)
  const currentEndLine = useRef(0)
  const currentEndChar = useRef(0)
  //display line and char are used for determining if the user is highlighting backwards or forwards
  //the display values will be equal to the end values if the user is highlighting forwards and the
  //start values if the user is highlighting backwards
  const currentDisplayLine = useRef(0)
  const currentDisplayChar = useRef(0)
  const parentElementRef = useRef<HTMLElement | null | undefined>(null)
  const currentMaxRightChar = useRef(0)
  const currentTextAreaSelectionStart = useRef(0)
  const numLinesToHopOnPageUpDown = useRef(defaultNumLinesToHopOnPageUpDown)
  const currentTextAreaSelectionEnd = useRef(0)
  const minLeftOffset = isBlame ? minLeftOffsetBlame : minLeftOffsetBlob
  const isWindows = useIsPlatform(['windows'])
  //linux and mac have similar font rendering, so we can use the same char width approximation for both
  const charWidth = isWindows ? charWidthWindows : charWidthMac

  const lineRowHeight = useCurrentLineHeight('react-code-lines')

  const characterCountByLine = useMemo(() => {
    const charCountByLine: number[] = []
    for (let i = 0; i < linesData.length; i++) {
      if (i === 0) {
        charCountByLine.push(linesData[i]!.rawText?.length ?? 0)
      } else {
        charCountByLine.push((linesData[i]!.rawText?.length ?? 0) + charCountByLine[i - 1]! + 1)
      }
    }
    return charCountByLine
  }, [linesData])

  function setLeftOffsetWithCursorLocationUpdate(offset: number, offsetCharacter: number) {
    setLeftOffset(offset)
    currentDisplayChar.current = offsetCharacter
  }
  function setTopOffsetWithCursorLocationUpdate(offset: number, offsetLine: number) {
    setTopOffset(offset)
    currentDisplayLine.current = offsetLine
  }

  const updateUrlForLineNumber = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const shouldUseColumn = startLineNumber.value !== endLineNumber.value
      const highlightInfo = {
        start: {line: startLineNumber.value, column: shouldUseColumn ? startCharacterNumber.value + 1 : null},
        end: {line: endLineNumber.value, column: shouldUseColumn ? endCharacterNumber.value + 1 : null},
      }

      const anchorInfo = {
        anchorPrefix: 'L',
        blobRange: {
          start: highlightInfo.start,
          end: highlightInfo.end,
        },
      }

      const hash = formatBlobRangeAnchor(anchorInfo)
      window.location.hash = hash
      onLineNumberClick?.(e)
    },
    [onLineNumberClick],
  )
  const {hash} = useLocation()

  useEffect(() => {
    const heightToMoveBy = window.innerHeight - 200 > 300 ? window.innerHeight - 200 : 300
    const numLinesToMoveBy = Math.round(heightToMoveBy / lineRowHeight)
    const numLinesToMoveByWithMaxMin = Math.min(Math.max(numLinesToMoveBy, 1), 100)
    numLinesToHopOnPageUpDown.current = numLinesToMoveByWithMaxMin
  }, [lineRowHeight])

  useEffect(() => {
    if (!additionalTextAreaInstructions || additionalTextAreaInstructions === '') {
      return
    }
    if (additionalTextAreaInstructions.includes('PageUp')) {
      onPageUp()
    } else if (additionalTextAreaInstructions.includes('PageDown')) {
      onPageDown()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalTextAreaInstructions])

  useEffect(() => {
    if (!textSelection) return
    if (textSelection.start < 0 && textSelection.end < 0) return
    if (
      currentTextAreaSelectionStart.current === textSelection.start &&
      currentTextAreaSelectionEnd.current === textSelection.end
    ) {
      return
    }
    const startValues = determineLineAndOffsetFromCharOffsetBinarySearch(textSelection.start)
    const endValues = determineLineAndOffsetFromCharOffsetBinarySearch(textSelection.end)

    if (
      (currentTextAreaSelectionStart.current === textSelection.start &&
        currentTextAreaSelectionEnd.current !== textSelection.end) ||
      (!textSelection.keyboard && !textSelection.displayStart)
    ) {
      // we should position the cursor at the END of the selection area because that is where the selection has moved

      setLeftOffsetWithCursorLocationUpdate(
        determineProperOffsetWithDummyDiv(endValues.offset, linesData[endValues.line]?.rawText ?? '', tabSize),
        endValues.offset,
      )
      currentMaxRightChar.current = endValues.offset
      setTopOffsetWithCursorLocationUpdate(endValues.line * lineRowHeight, endValues.line)
      syncVisibleCursorToTextAreaCursor(startValues.line, endValues.line, startValues.offset, endValues.offset, false)
    } else {
      // we should position the cursor at the START of the selection area because that is where the selection has moved
      // or the end/start are the same and it doesn't matter which one we choose

      setLeftOffsetWithCursorLocationUpdate(
        determineProperOffsetWithDummyDiv(startValues.offset, linesData[startValues.line]?.rawText ?? '', tabSize),
        startValues.offset,
      )
      currentMaxRightChar.current = startValues.offset
      setTopOffsetWithCursorLocationUpdate(startValues.line * lineRowHeight, startValues.line)
      syncVisibleCursorToTextAreaCursor(startValues.line, endValues.line, startValues.offset, endValues.offset, true)
    }

    currentTextAreaSelectionEnd.current = textSelection.end
    currentTextAreaSelectionStart.current = textSelection.start
    if (textSelection.end === textSelection.start && !textSelection.keyboard) {
      //set whether or not the keyboard is what was used
      keyboardNavUsed.value = false
      selectSymbolAtCursor()
    }

    if (currentDisplayLine.current <= 5 && textSelection.keyboard) {
      handleVerticalScroll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesData, tabSize, textSelection])

  function determineLineAndOffsetFromCharOffsetBinarySearch(charOffset: number) {
    let line = 0
    let offset = 0
    let charCount = 0
    let prevCharCount = 0
    let nextCharCount = 0
    let i = 0
    let j = characterCountByLine.length - 1
    while (i <= j) {
      const mid = Math.floor((i + j) / 2)
      charCount = characterCountByLine[mid]! + 1
      prevCharCount = mid > 0 ? characterCountByLine[mid - 1]! + 1 : 0
      nextCharCount = mid < characterCountByLine.length - 1 ? characterCountByLine[mid + 1]! + 1 : Infinity
      if (charOffset >= prevCharCount && charOffset < charCount) {
        line = mid
        offset = charOffset - prevCharCount
        break
      } else if (charOffset < prevCharCount) {
        j = mid - 1
      } else if (charOffset >= charCount && charOffset < nextCharCount) {
        line = mid + 1
        offset = charOffset - charCount
        break
      } else if (charOffset >= nextCharCount) {
        i = mid + 1
      }
    }
    return {line, offset}
  }

  function syncVisibleCursorToTextAreaCursor(
    startLine: number,
    endLine: number,
    startChar: number,
    endChar: number,
    startIsVisible: boolean,
  ) {
    currentStartLine.current = startLine
    currentStartChar.current = startChar
    currentEndLine.current = endLine
    currentEndChar.current = endChar
    currentDisplayLine.current = startIsVisible ? startLine : endLine
    currentDisplayChar.current = startIsVisible ? startChar : endChar
    startLineNumber.value = getCorrectLineNumberWithCollapsedSections(startLine)
    startCharacterNumber.value = startChar
    endLineNumber.value = getCorrectLineNumberWithCollapsedSections(endLine)
    endCharacterNumber.value = endChar
  }

  useEffect(() => {
    const anchInfo = parseFileAnchor(hash)
    if (!anchInfo.blobRange?.start?.line) {
      //the line was removed, so don't do anything
      return
    }
    if (anchInfo.blobRange.start.line > linesData.length) {
      // The highlighted line is not displayed yet so we can't scroll to it.
      // This will run again when we are no longer truncated.
      return
    }

    const initialLineNumber = anchInfo.blobRange.start.line - 1
    const initialCharacterNumber = 0
    currentStartLine.current = initialLineNumber
    startLineNumber.value = initialLineNumber
    startCharacterNumber.value = initialCharacterNumber
    endLineNumber.value = initialLineNumber
    endCharacterNumber.value = initialCharacterNumber
    currentStartChar.current = initialCharacterNumber
    currentEndLine.current = initialLineNumber
    currentEndChar.current = initialCharacterNumber
    currentMaxRightChar.current = initialCharacterNumber
    setLeftOffsetWithCursorLocationUpdate(currentStartChar.current, currentStartChar.current)
    setTopOffsetWithCursorLocationUpdate(currentStartLine.current * lineRowHeight, currentStartLine.current)
    syncAndScrollCleanup(scrollRightOffset)
    //we don't want to declare syncAndScrollCleanup within the effect, so we don't want to include it in the deps
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, linesData, setLeftOffset, setTopOffset])

  function determineWhetherStartOrEndIsCurrentDisplayPosition() {
    if (
      currentStartLine.current === currentDisplayLine.current &&
      currentStartChar.current === currentDisplayChar.current &&
      (currentStartLine.current !== currentEndLine.current || currentStartChar.current !== currentEndChar.current)
    ) {
      return 'start'
    } else if (
      currentEndLine.current === currentDisplayLine.current &&
      currentEndChar.current === currentDisplayChar.current &&
      (currentStartLine.current !== currentEndLine.current || currentStartChar.current !== currentEndChar.current)
    ) {
      return 'end'
    }
    return 'same'
  }

  function determineAndSetTextAreaCursorPosition() {
    if (textAreaRef && textAreaRef.current) {
      const textArea = textAreaRef.current
      const zeroIndexedStartLineNum = currentStartLine.current - 1
      const zeroIndexedEndLineNum = currentEndLine.current - 1
      const offsetStart =
        // + 1 for every line except the first line because there is an implied newline character in the calculation
        // for every other line
        (zeroIndexedStartLineNum !== -1 ? characterCountByLine[zeroIndexedStartLineNum]! + 1 : 0) +
        currentStartChar.current

      const offsetEnd =
        (zeroIndexedEndLineNum !== -1 ? characterCountByLine[zeroIndexedEndLineNum]! + 1 : 0) + currentEndChar.current
      textArea.selectionStart = offsetStart
      textArea.selectionEnd = offsetEnd
      currentTextAreaSelectionStart.current = offsetStart
      currentTextAreaSelectionEnd.current = offsetEnd
    }
  }

  function onPageDown() {
    updateParentRefIfNecessary()

    let currentLineNumber = currentStartLine.current
    let currentCharNumber = currentStartChar.current

    if (currentLineNumber + numLinesToHopOnPageUpDown.current > linesData.length) {
      currentLineNumber = linesData.length - 1
    } else {
      currentLineNumber += numLinesToHopOnPageUpDown.current
    }

    currentCharNumber = handleDifferingLineLengthsWhenGoingUpOrDownWithParams(currentLineNumber, currentCharNumber)
    currentStartLine.current = currentLineNumber
    currentStartChar.current = currentCharNumber
    removeRangeFromSelection()
    setTopOffsetWithCursorLocationUpdate(currentLineNumber * lineRowHeight, currentLineNumber)

    syncAndScrollCleanup(scrollRightOffset)
  }
  function onPageUp() {
    updateParentRefIfNecessary()

    let currentLineNumber = currentStartLine.current
    let currentCharNumber = currentStartChar.current

    if (currentLineNumber < numLinesToHopOnPageUpDown.current) {
      currentLineNumber = 0
    } else {
      currentLineNumber -= numLinesToHopOnPageUpDown.current
    }

    currentCharNumber = handleDifferingLineLengthsWhenGoingUpOrDownWithParams(currentLineNumber, currentCharNumber)
    currentStartLine.current = currentLineNumber
    currentStartChar.current = currentCharNumber
    removeRangeFromSelection()
    setTopOffsetWithCursorLocationUpdate(currentLineNumber * lineRowHeight, currentLineNumber)
    syncAndScrollCleanup(scrollRightOffset)
  }

  function onEnter() {
    keyboardNavUsed.value = true
    focusSymbolPane()
    selectSymbolAtCursor()
  }

  function removeRangeFromSelection() {
    currentEndLine.current = currentStartLine.current
    currentEndChar.current = currentStartChar.current
  }

  function handleDifferingLineLengthsWhenGoingUpOrDownWithParams(currentLine: number, currentChar: number) {
    let returnChar = currentChar
    if (currentLine > linesData.length || !linesData[currentLine]) return returnChar
    const rawText = linesData[currentLine]!.rawText
    if (!rawText) return returnChar

    if (currentChar > rawText.length) {
      returnChar = rawText.length
      setLeftOffsetWithCursorLocationUpdate(determineProperOffsetWithDummyDiv(returnChar, rawText, tabSize), returnChar)
    } else if (returnChar < currentMaxRightChar.current && currentMaxRightChar.current < rawText.length) {
      returnChar = currentMaxRightChar.current
      setLeftOffsetWithCursorLocationUpdate(determineProperOffsetWithDummyDiv(returnChar, rawText, tabSize), returnChar)
    } else if (returnChar < currentMaxRightChar.current && currentMaxRightChar.current >= rawText.length) {
      returnChar = rawText.length
      setLeftOffsetWithCursorLocationUpdate(determineProperOffsetWithDummyDiv(returnChar, rawText, tabSize), returnChar)
    }
    return returnChar
  }

  function selectSymbolAtCursor() {
    const lineData = linesData[currentDisplayLine.current]
    if (!lineData) return

    const {rawText, stylingDirectivesLine} = lineData
    if (!rawText || !stylingDirectivesLine) return

    let matchingDirective: StylingDirective | null = null
    for (const directive of stylingDirectivesLine) {
      if (directive.start > currentDisplayChar.current) continue
      if (directive.end < currentDisplayChar.current) continue
      if (!directive.cssClass) continue

      matchingDirective = directive
      const isToken = isSymbol(rawText.substring(directive.start, directive.end), directive.cssClass)
      if (!isToken) return
    }

    if (!matchingDirective) return

    // If we have a styling directive, we know the exact bounds of the symbol
    onCodeNavTokenSelected?.({
      selectedText: rawText.substring(matchingDirective.start, matchingDirective.end),
      lineNumber: getCorrectLineNumberWithCollapsedSections(currentDisplayLine.current),
      offset: matchingDirective.start,
    })
  }

  function updateParentRefIfNecessary() {
    if (!parentElementRef.current) {
      if (isVirtualized) {
        parentElementRef.current = cursorRef.current?.parentElement?.parentElement
      } else {
        parentElementRef.current = cursorRef.current?.parentElement
      }
    }
  }

  function syncAndScrollCleanup(scrollOffset: number) {
    if (parentElementRef.current) {
      handleVerticalScroll()

      handleScrollRight(scrollOffset)
    }
    determineAndSetTextAreaCursorPosition()
  }

  function handleVerticalScroll() {
    const forwardsOrBackwards = determineWhetherStartOrEndIsCurrentDisplayPosition()
    let currentCharNumber = currentStartChar.current
    let currentLineNumber = currentStartLine.current
    if (forwardsOrBackwards === 'end') {
      currentCharNumber = currentEndChar.current
      currentLineNumber = currentEndLine.current
    }

    const lowerLineNumberToEnsure = Math.min(
      getCorrectLineNumberWithCollapsedSections(currentLineNumber + 5),
      linesData.length,
    )
    if (!isLineInViewport(lowerLineNumberToEnsure)) {
      const line = getElementForLine(lowerLineNumberToEnsure)
      //if the user has scrolled manually past the virtualization window, then line will be null, and we can't scroll
      //into view the line of a dom element that doesn't exist. Scroll into view is nicer and preferred, but this
      //works as a backup
      if (line === null) {
        window.scrollTo(0, currentLineNumber * lineRowHeight)
      }
      if (
        (line && line.getBoundingClientRect().y < 0) ||
        (line && line.getBoundingClientRect().y > window.innerHeight)
      ) {
        line.scrollIntoView({block: 'center'})
        //it does some weirdness where it scrolls slightly to the right when using scrollIntoView, so this fixes that
        window.scrollBy(-300, 0)
      } else if (line) {
        window.scrollBy(0, 100)
      }
      const browserWidth = window.innerWidth
      if (browserWidth < currentCharNumber * charWidth + minLeftOffset) {
        window.scrollTo(0, 0)
      }
    }

    // - 5 because the first few lines are covered up by the header
    const upperLineNumberToEnsure = Math.max(getCorrectLineNumberWithCollapsedSections(currentLineNumber - 5), 1)
    if (!isLineInViewport(upperLineNumberToEnsure)) {
      const line = getElementForLine(upperLineNumberToEnsure)

      //if the user has scrolled manually past the virtualization window, then line will be null, and we can't scroll
      //into view the line of a dom element that doesn't exist. Scroll into view is nicer and preferred, but this
      //works as a backup
      if (line === null) {
        window.scrollTo(0, currentLineNumber * lineRowHeight)
      }
      //deal with the scenario where the user has scrolled off page
      if (
        (line && line.getBoundingClientRect().y < 0) ||
        (line && line.getBoundingClientRect().y > window.innerHeight)
      ) {
        line.scrollIntoView({block: 'center'})
        //it does some weirdness where it scrolls slightly to the right when using scrollIntoView, so this fixes that
        window.scrollBy(-300, 0)
      } else if (line) {
        window.scrollBy(0, -200)
      }
    } else if (currentLineNumber <= 7) {
      window.scrollTo(0, 0)
    }
  }

  function getCorrectLineNumberWithCollapsedSections(visibleLineNumber: number) {
    return linesData[visibleLineNumber] ? linesData[visibleLineNumber]!.lineNumber : visibleLineNumber
  }

  function handleScrollRight(offset: number) {
    const forwardsOrBackwards = determineWhetherStartOrEndIsCurrentDisplayPosition()
    let currentCharNumber = currentStartChar.current
    if (forwardsOrBackwards === 'end') {
      currentCharNumber = currentEndChar.current
    }
    if (parentElementRef.current && parentElementRef.current.scrollBy) {
      if (
        currentCharNumber * charWidth + minLeftOffset + 50 >=
        parentElementRef.current.scrollLeft + parentElementRef.current.clientWidth
      ) {
        parentElementRef.current.scrollBy(
          currentCharNumber * charWidth +
            minLeftOffset -
            parentElementRef.current.scrollLeft -
            parentElementRef.current.clientWidth +
            offset,
          0,
        )
      } else if (currentCharNumber * charWidth + minLeftOffset <= parentElementRef.current.scrollLeft) {
        parentElementRef.current.scrollBy(
          currentCharNumber * charWidth +
            minLeftOffset -
            parentElementRef.current.scrollLeft -
            parentElementRef.current.clientWidth,
          0,
        )
      }
    }
  }

  return {
    onEnter,
    updateUrlForLineNumber,
    onPageDown,
    onPageUp,
    currentStartLine,
    currentStartChar,
    currentEndLine,
    currentEndChar,
    determineAndSetTextAreaCursorPosition,
    getCorrectLineNumberWithCollapsedSections,
  }
}

export function determineSymbolBounds(line: string, index: number) {
  // Special condition, if the user clicks on a :
  if (line[index] === ':') {
    if (!line[index - 1]?.match(/\w/) || !line[index + 1]?.match(/\w/)) {
      return {start: index, end: index + 1}
    }
  }
  // If the user is clicking on a non-word character, just highlight that.
  if (!line[index]?.match(/[a-zA-Z0-9_-]/)) {
    return {start: index, end: index + 1}
  }

  function takeUntilEdge(i: number, direction: number) {
    let sawColon = false
    for (; i >= 0 && i < line.length; i += direction) {
      if (!sawColon && line[i] === ':') {
        sawColon = true
        continue
      }

      if (!line[i]?.match(/[a-zA-Z0-9_-]/)) {
        break
      }
      sawColon = false
    }
    if (i < 0) {
      i += 1
    }
    if (sawColon) {
      i -= direction
    }

    return i
  }

  const end = takeUntilEdge(index, 1)
  const start = takeUntilEdge(index, -1)

  return {
    start,
    end,
  }
}
