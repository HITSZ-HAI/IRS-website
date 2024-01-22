import type {CodeSection, DefinitionOrReference} from '@github-ui/code-nav'
import safeStorage from '@github-ui/safe-storage'
import {useClientValue} from '@github-ui/use-client-value'
import {Box} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
// useLocation is safe for files not rendered in a partial on the overview.
// eslint-disable-next-line no-restricted-imports
import {useLocation} from 'react-router-dom'

// eslint-disable-next-line no-restricted-imports
import {type BlobRange, parseFileAnchor} from '../../../../../github/blob-anchor'
import {useFindInFileOpen} from '../../../../contexts/FindInFileOpenContext'
import {useSplitCodeownersErrorsContext} from '../../../../contexts/SplitCodeownersErrorsContext'
import {useCurrentBlame} from '../../../../hooks/CurrentBlame'
import {useCurrentBlob} from '../../../../hooks/CurrentBlob'
import {useLineElementMap} from '../../../../hooks/CurrentLineRefMap'
import {useFilesPageInfo} from '../../../../hooks/FilesPageInfo'
import {useIsCursorEnabled} from '../../../../hooks/use-cursor-navigation'
import {useManualRender} from '../../../../hooks/use-manual-render'
import {type ScrollRequestPayload, useScrollLineIntoView} from '../../../../hooks/use-scroll-line-into-view'
import {DELETE_STICKY_LINES_VALUE, type SetStickyLinesType} from '../../../../hooks/use-sticky-lines'
import {type SymbolUnderPointer, useSymbolUnderPointer} from '../../../../hooks/use-symbol-under-pointer'
import {
  applyStickyToParentStartLines,
  expandAllRows,
  expandRow,
  forceAnnouncementToScreenReaders,
  getActualLineNumberBinarySearch,
  isLineInViewport,
} from '../../../../utilities/lines'
import {BidiAlert} from '../../Banners/Bidi'
import type {CodeNavData} from '../BlobContent'
import {CopilotButtonContainer} from '../CopilotButton'
import {HighlightedLineMenuContainer} from '../HighlightedLineMenu'
import {BlameLines, BlameLinesSSR} from './Blame'
import type {CodeLinesHandle} from './code-lines-handle'
import {CodeLines} from './CodeLines'
import {CodeLinesSSR} from './CodeLinesSSR'
import {HighlightedLinesProvider} from './HighlightedLineProvider'
import {type CodeLineData, useCodeLines} from './hooks/use-code-lines'
import {SearchResultsProvider} from './SearchResultsProvider'
import {TextArea} from './TextArea'

const safeLocalStorage = safeStorage('localStorage')

export function CodeBlob({
  blobLinesHandle,
  onCodeNavTokenSelected,
  codeSections,
  codeLineToSectionMap,
  validCodeNav,
  onLineStickOrUnstick,
  searchResults,
  focusedSearchResult,
}: {
  blobLinesHandle: React.RefObject<CodeLinesHandle>
  onCodeNavTokenSelected: (symbol: CodeNavData) => void
  codeSections?: Map<number, CodeSection[]>
  codeLineToSectionMap: Map<number, CodeSection[]> | undefined
  validCodeNav: boolean
  onLineStickOrUnstick: SetStickyLinesType
  searchResults: DefinitionOrReference[]
  focusedSearchResult: number | undefined
}) {
  const {rawLines, stylingDirectives, tabSize} = useCurrentBlob()
  const hasBlame = !!useCurrentBlame()
  const [shouldMaterializeAllLines, setShouldMaterializeAllLines] = useState(false)
  const shouldUseCursor = useIsCursorEnabled()
  const [highlightedLines, setHighlightedLines] = useState<BlobRange | undefined>(undefined)
  //defaulting to true for keyboard so that a symbol is not initially selected
  const [textSelection, setTextSelection] = useState({start: -1, end: -1, keyboard: true, displayStart: false})
  const [additionalTextAreaInstructions, setAdditionalTextAreaInstructions] = useState('')
  const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const [textOverlayShouldBeVisible, setTextOverlayShouldBeVisible] = useState(false)
  const cursorClickStartRef = useRef({startX: 0, startY: 0})
  const {hash} = useLocation()
  const {refInfo, path, copilotAccessAllowed} = useFilesPageInfo()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined)
  const [isSSR] = useClientValue(() => false, true, [])

  const reRender = useManualRender()
  const currentLineRefMap = useLineElementMap()
  const onLineNumberClick = useCallback(() => {
    setHighlightedLines(parseFileAnchor(window.location.hash)?.blobRange)
  }, [])
  const {findInFileOpen, setFindInFileOpen} = useFindInFileOpen()

  const splitCodeownersErrors = useSplitCodeownersErrorsContext()
  const {lines, plainTextLinesAsString} = useCodeLines(
    rawLines ?? [],
    stylingDirectives ?? null,
    codeSections ?? null,
    splitCodeownersErrors,
    codeLineToSectionMap,
  )

  //we need this linesRef for a situation where a user clicks on a symbol that exists within a collapsed section.
  //we set a 0ms timeout for moving the screen to the appropriate scroll position, which then allows the component
  //to re-render and generate a new value for which lines should be present, but the timeout was set when only
  //the out of date set of lines was present. Using this ref instead of just 'lines' allows the line calculation
  //to have the up to date values for figuring out where the line is on the screen
  const linesRef = useRef<CodeLineData[]>(lines)
  linesRef.current = lines
  //this is used to clear all styling programmatically added to the page for collapsed/expanded lines. It is only
  //run if a new file is soft-navigated to.
  useEffect(() => {
    expandAllRows()
  }, [refInfo.currentOid, path])

  useEffect(() => {
    window.onbeforeprint = () => setShouldMaterializeAllLines(true)
    window.onafterprint = () => setShouldMaterializeAllLines(false)
  }, [])

  useEffect(() => {
    // Do the announcement of the help menu to each user exactly one time. Hopefully they hear it!
    if (!(safeLocalStorage.getItem('heardHelpAnnouncement') === 'true')) {
      forceAnnouncementToScreenReaders('While the code is focused, press Alt+F1 for a menu of operations.', 2000)
      safeLocalStorage.setItem('heardHelpAnnouncement', 'true')
    }
  }, [])
  /**
   *  This useCallback is present to handle when the user hovers over a symbol
   *  and we add an on click event to that particular symbol. We add an attribute at
   *  the same time which we then later check for on future hovers to make sure we do
   *  not add the same event listener multiple times.
   *
   *  SymbolUnderPointer is changed constantly, basically whenever you move the mouse, so
   *  removing the event listener on a useEffect return does not work in this instance.
   *
   *  It is possible the entire thing can be refactored in some way to be able to remove
   *  the event listener on a useEffect return, but the only way this is a significant
   *  performance degredation is if a user systematically hovers over every symbol on the page, whereas
   *  this version saves us a lot of time on repeated hovers of the same symbol as well as time saved on
   *  moving the cursor around the page.
   */
  useSymbolUnderPointer(
    useCallback(
      (symbolUnderPointer: SymbolUnderPointer) => {
        function onTokenClick(e: Event) {
          const text = (e.target as Element).textContent ? (e.target as Element).textContent : ''
          if (onCodeNavTokenSelected && symbolUnderPointer) {
            onCodeNavTokenSelected({
              selectedText: text!,
              lineNumber: symbolUnderPointer.lineNumber,
              offset: symbolUnderPointer.offset,
            })
            if (findInFileOpen) {
              setFindInFileOpen(false)
            }
          }
        }
        if (symbolUnderPointer && symbolUnderPointer?.node && !hasBlame) {
          if (!symbolUnderPointer.node.textContent || symbolUnderPointer.node.textContent.length < 3) return
          const element = symbolUnderPointer.node as Element
          if (!element || !element.hasAttribute || element.hasAttribute('clickadded')) {
            return
          }
          element.classList.add('pl-token')
          element.setAttribute('clickadded', 'true')
          element.addEventListener('click', onTokenClick)
        }
      },
      [findInFileOpen, hasBlame, setFindInFileOpen, onCodeNavTokenSelected],
    ),
    validCodeNav,
  )

  const scrollSelectedLineIntoView = ({line, column}: ScrollRequestPayload) => {
    if (line < 10) {
      blobLinesHandle.current?.scrollToTop()
    } else if (blobLinesHandle.current) {
      //necessary because scrollToLine just scrolls to the X line visible on the page, which normally is
      //the same as the line number, but once a line has collapsed sections above it it is no longer equivalent
      const lineAccountingForCollapsedSections = getActualLineNumberBinarySearch(line, lines)
      if (lineAccountingForCollapsedSections === -1) {
        // the line was a part of a collapsed section
        const sectionArray = codeLineToSectionMap?.get(line)

        for (const section of sectionArray ?? []) {
          if (section && section.collapsed) {
            //expand every collapsed section that this code line is part of
            section.collapsed = false
            expandRow(section?.startLine)
          }
        }
        reRender()
      }
      setTimeout(() => {
        //we want to use the linesRef because otherwise it will just use the lines from when the sections were collapsed,
        //making the lines incomplete for finding where it should actually get scrolled to
        const updatedLineAccountingForCollapsedSections = getActualLineNumberBinarySearch(line, linesRef.current)
        blobLinesHandle.current?.scrollToLine(updatedLineAccountingForCollapsedSections, column)
      }, 0)

      if (currentLineRefMap && !isLineInViewport(line)) {
        // -1 in 'set sticky lines' for the line number clears out all current sticky lines
        onLineStickOrUnstick(DELETE_STICKY_LINES_VALUE, true)
        applyStickyToParentStartLines(currentLineRefMap, line, codeLineToSectionMap, onLineStickOrUnstick)
      }
    }
  }

  // Update highlight on hash path change
  useEffect(() => {
    const anchInfo = parseFileAnchor(hash)

    if (!anchInfo.blobRange?.start?.line) {
      setHighlightedLines(undefined)
      return
    }

    setHighlightedLines(anchInfo.blobRange)
  }, [path, hash, lines.length])

  // Update scrolling position on path change
  useEffect(() => {
    const anchInfo = parseFileAnchor(hash)
    if (!anchInfo.blobRange?.start?.line) {
      return
    }
    //this needs to be a timeout because of SSR
    setTimeout(() => scrollSelectedLineIntoView({line: anchInfo.blobRange.start.line}), 0)
    // need to suppress this eslint warning because other parts of the code need to update the hash to trigger this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, hasBlame])

  useEffect(() => {
    const currentTextArea = textAreaRef.current

    if (!currentTextArea || !shouldUseCursor) {
      setContentWidth(undefined)
      return
    }

    // Only set width when the scrollable content is larger than the provided width
    // Account for the copilot button by adding 70px
    setContentWidth(
      currentTextArea.scrollWidth > currentTextArea.clientWidth ? currentTextArea.scrollWidth + 70 : undefined,
    )

    const observer = new ResizeObserver(entries => {
      for (const {target} of entries) {
        setContentWidth(target.scrollWidth > target.clientWidth ? target.scrollWidth + 70 : undefined)
      }
    })
    observer.observe(currentTextArea)

    return () => {
      observer.disconnect()
    }
  }, [shouldUseCursor, path])

  // NOTE: This is a primary way to trigger scrolling the currently selected line into view. Without this mechanism,
  // the line can't be scrolled into view if it's already in the URL hash.
  useScrollLineIntoView(scrollSelectedLineIntoView)

  return (
    <SearchResultsProvider searchResults={searchResults} focusedSearchResult={focusedSearchResult}>
      <HighlightedLinesProvider highlightedLines={highlightedLines}>
        {lines.some(line => line.bidi) && <BidiAlert />}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            py: hasBlame ? 0 : 2,
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
            position: 'relative',
          }}
        >
          <HighlightedLineMenuContainer>
            <CopilotButtonContainer>
              <Box
                sx={{
                  flex: 1,
                  position: 'relative',
                  minWidth: 0,
                  overflowX: hasBlame ? 'auto' : undefined,
                  overflowY: hasBlame ? 'hidden' : undefined,
                }}
                ref={parentRef}
                onBlur={e => {
                  //only count the focus loss if it isn't a child
                  if (e.currentTarget.contains(e.relatedTarget)) {
                    return
                  }
                  setIsTextAreaFocused(false)
                }}
              >
                {shouldUseCursor && (
                  <TextArea
                    textAreaRef={textAreaRef}
                    setTextOverlayShouldBeVisible={setTextOverlayShouldBeVisible}
                    setTextSelection={setTextSelection}
                    setAdditionalTextAreaInstructions={setAdditionalTextAreaInstructions}
                    cursorClickStartRef={cursorClickStartRef}
                    parentRef={parentRef}
                    tabSize={tabSize}
                    plainTextLinesAsString={plainTextLinesAsString}
                    numLines={lines.length}
                    setIsTextAreaFocused={setIsTextAreaFocused}
                  />
                )}
                {hasBlame ? (
                  !isSSR ? (
                    <BlameLines
                      ref={blobLinesHandle}
                      linesData={lines}
                      tabSize={tabSize}
                      copilotAccessAllowed={copilotAccessAllowed}
                      onLineNumberClick={onLineNumberClick}
                    />
                  ) : (
                    <BlameLinesSSR
                      linesData={lines}
                      tabSize={tabSize}
                      copilotAccessAllowed={copilotAccessAllowed}
                      onLineNumberClick={onLineNumberClick}
                    />
                  )
                ) : !isSSR ? (
                  <CodeLines
                    ref={blobLinesHandle}
                    linesData={lines}
                    onLineNumberClick={onLineNumberClick}
                    codeSections={codeSections}
                    codeLineToSectionMap={codeLineToSectionMap}
                    onLineStickOrUnstick={onLineStickOrUnstick}
                    tabSize={tabSize}
                    contentWidth={contentWidth}
                    onCollapseToggle={reRender}
                    textAreaRef={textAreaRef}
                    isTextAreaFocused={isTextAreaFocused}
                    onCodeNavTokenSelected={onCodeNavTokenSelected}
                    textOverlayShouldBeVisible={textOverlayShouldBeVisible}
                    materializeAllLines={shouldMaterializeAllLines}
                    textSelection={textSelection}
                    additionalTextAreaInstructions={additionalTextAreaInstructions}
                    copilotAccessAllowed={copilotAccessAllowed}
                  />
                ) : (
                  <CodeLinesSSR
                    linesData={lines}
                    onLineNumberClick={onLineNumberClick}
                    codeSections={codeSections}
                    codeLineToSectionMap={codeLineToSectionMap}
                    onLineStickOrUnstick={onLineStickOrUnstick}
                    tabSize={tabSize}
                    contentWidth={contentWidth}
                    copilotAccessAllowed={copilotAccessAllowed}
                    onCollapseToggle={reRender}
                  />
                )}
              </Box>
            </CopilotButtonContainer>
          </HighlightedLineMenuContainer>
        </Box>
      </HighlightedLinesProvider>
    </SearchResultsProvider>
  )
}

try{ CodeBlob.displayName ||= 'CodeBlob' } catch {}