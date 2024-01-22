import type {CodeSection} from '@github-ui/code-nav'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {Box} from '@primer/react'
import React, {useEffect, useImperativeHandle, useRef} from 'react'

import {useIsCursorEnabled} from '../../../../hooks/use-cursor-navigation'
import type {SetStickyLinesType} from '../../../../hooks/use-sticky-lines'
import {isLineInViewport, queryMatchElement} from '../../../../utilities/lines'
import SelectAllShortcutButton from '../../../../utilities/SelectAllShortcutButton'
import type {CodeNavData} from '../BlobContent'
import type {CodeLinesHandle} from './code-lines-handle'
import {CodeLine} from './CodeLine'
import type {CodeLineData} from './hooks/use-code-lines'
import {useVirtualCodeBlob} from './hooks/use-virtual-code-blob'
import {LineNumber} from './LineNumber'
import {NavigationCursor} from './NavigationCursor'

interface CodeLinesProps {
  linesData: CodeLineData[]
  tabSize: number
  onCollapseToggle: () => void

  materializeAllLines?: boolean
  textOverlayShouldBeVisible?: boolean
  codeSections?: Map<number, CodeSection[]>
  codeLineToSectionMap?: Map<number, CodeSection[]>
  contentWidth?: number
  textAreaRef?: React.RefObject<HTMLTextAreaElement>
  isTextAreaFocused?: boolean
  textSelection?: {start: number; end: number; keyboard: boolean; displayStart: boolean}
  additionalTextAreaInstructions?: string
  copilotAccessAllowed: boolean
  onLineNumberClick?: React.MouseEventHandler<HTMLDivElement>
  onLineStickOrUnstick?: SetStickyLinesType
  onCodeNavTokenSelected?: (symbol: CodeNavData) => void
}

export const CodeLines = React.memo(React.forwardRef(CodeLinesUnmemoized))

function CodeLinesUnmemoized(
  {
    linesData,
    onLineNumberClick,
    codeSections,
    codeLineToSectionMap,
    onLineStickOrUnstick,
    tabSize,
    contentWidth,
    onCollapseToggle,
    onCodeNavTokenSelected,
    textAreaRef,
    isTextAreaFocused,
    textOverlayShouldBeVisible,
    materializeAllLines,
    textSelection,
    additionalTextAreaInstructions,
    copilotAccessAllowed,
  }: CodeLinesProps,
  ref: React.ForwardedRef<CodeLinesHandle>,
) {
  const parentRef = useRef<HTMLTableElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const horizontalScrollBarRef = useRef<HTMLDivElement>(null)
  const shouldUseCursor = useIsCursorEnabled()
  // Prevent loops and jumping when scrolling
  const ignoreNextScrollContainerEvent = useRef(false)
  const ignoreNextScrollBarEvent = useRef(false)

  useEffect(() => {
    //need to set the on scroll here because it relies on having access to parentRef to sync up the scrolls
    if (textAreaRef && textAreaRef.current) {
      textAreaRef.current.onscroll = () => {
        if (
          scrollRef &&
          scrollRef.current &&
          textAreaRef.current &&
          textAreaRef.current.scrollLeft !== scrollRef.current.scrollLeft
        ) {
          //if the text area is scrolled on its own, which will only happen when the browser scrolls horizontally for
          //a find in file result, we need to sync up the scroll of the text area with the visible lines

          scrollRef.current.scrollLeft = textAreaRef.current.scrollLeft
        }
      }
      const textRef = textAreaRef.current
      return () => {
        if (textRef) {
          textRef.onscroll = null
        }
      }
    }
  }, [textAreaRef, parentRef, shouldUseCursor])

  const wrapOptionEnabled = useCodeViewOptions().codeWrappingOption.enabled

  const virtualizer = useVirtualCodeBlob({
    parentRef,
    lineCount: linesData.length,
    materializeAllLines: !!materializeAllLines,
  })

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (isLineInViewport(0)) return
      virtualizer.scrollToIndex(0, {align: 'start'})
    },
    scrollToLine: (lineNumber, column) => {
      //align: start because this positions the element closer to the top of the screen
      virtualizer.scrollToIndex(lineNumber, {align: 'start'})

      const container = parentRef.current
      if (!container) {
        return
      }

      container.scroll({left: getHorizontalScrollOffset(container, lineNumber, column)})
    },
  }))

  const scrollingProps = shouldUseCursor
    ? {overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': {display: 'none'}}
    : {overflowX: 'auto'}

  return (
    <Box
      ref={parentRef}
      sx={{position: 'relative', pointerEvents: shouldUseCursor ? 'none' : 'auto'}}
      onScroll={event => handleBlobScrollSync(event, textAreaRef)}
    >
      <Box
        ref={scrollRef}
        sx={scrollingProps}
        //TODO: this is necessary to resolve an axe complaint, but we don't actually want this to be in the tab order.
        //unsure what the resolution to that issue is outside of an onFocus
        tabIndex={0}
        onScroll={ev => {
          if (
            shouldUseCursor &&
            horizontalScrollBarRef.current &&
            horizontalScrollBarRef.current.scrollLeft !== ev.currentTarget.scrollLeft
          ) {
            if (!ignoreNextScrollContainerEvent.current) {
              if (textAreaRef?.current) {
                textAreaRef.current.scrollLeft = ev.currentTarget.scrollLeft
              }
              ignoreNextScrollBarEvent.current = true
              horizontalScrollBarRef.current.scrollLeft = ev.currentTarget.scrollLeft
            } else {
              ignoreNextScrollContainerEvent.current = false
            }
          }
        }}
      >
        <Box
          className="react-code-file-contents"
          role="presentation"
          aria-hidden={true}
          data-tab-size={tabSize}
          data-paste-markdown-skip
          sx={{
            tabSize,
            isolation: 'isolate',
            position: 'relative',
            width: contentWidth,
            maxWidth: wrapOptionEnabled ? '100%' : 'unset',
          }}
          style={{height: virtualizer.totalSize}}
          data-hpc
        >
          <div className="react-line-numbers" style={{pointerEvents: 'auto', height: virtualizer.totalSize}}>
            {virtualizer.virtualItems.map(virtualItem => {
              const lineData = linesData[virtualItem.index]!
              return (
                <LineNumber
                  codeLineData={lineData}
                  key={`line-number-${lineData.lineNumber}`}
                  onClick={onLineNumberClick}
                  ownedCodeSections={codeSections}
                  onLineStickOrUnstick={onLineStickOrUnstick}
                  onCollapseToggle={onCollapseToggle}
                  virtualOffset={virtualItem.start}
                />
              )
            })}
          </div>
          <div className="react-code-lines" style={{height: virtualizer.totalSize}}>
            {virtualizer.virtualItems.map(virtualItem => {
              const lineData = linesData[virtualItem.index]!
              return (
                <CodeLine
                  codeLineData={lineData}
                  codeLineClassName={lineData.codeLineClassName}
                  key={`line-number-${lineData.lineNumber}-content:${lineData.rawText}`}
                  id={`LC${lineData.lineNumber}`}
                  onLineStickOrUnstick={onLineStickOrUnstick}
                  setIsCollapsed={onCollapseToggle}
                  codeLineToSectionMap={codeLineToSectionMap}
                  virtualOffset={virtualItem.start}
                  virtualKey={virtualItem.key}
                  // Not great but measureRef doesn't work in tests due to something wrong in the observer
                  // In order to make tests work, we need to not pass this prop during tests
                  measureRef={process.env.NODE_ENV === 'test' ? undefined : virtualItem.measureRef}
                  copilotAccessAllowed={copilotAccessAllowed}
                />
              )
            })}
          </div>
          <SelectAllShortcutButton
            shouldNotOverrideCopy={shouldUseCursor}
            containerRef={shouldUseCursor ? textAreaRef : parentRef}
          />
          {shouldUseCursor && (
            <NavigationCursor
              linesData={linesData}
              isBlame={false}
              onCodeNavTokenSelected={onCodeNavTokenSelected}
              onLineNumberClick={onLineNumberClick}
              isCursorVisible={!!isTextAreaFocused}
              isVirtualized={true}
              textAreaRef={textAreaRef}
              onCollapseToggle={onCollapseToggle}
              onLineStickOrUnstick={onLineStickOrUnstick}
              tabSize={tabSize}
              textSelection={textSelection}
              shouldRenderOverlay={!!textOverlayShouldBeVisible}
              additionalTextAreaInstructions={additionalTextAreaInstructions ?? ''}
            />
          )}
        </Box>
      </Box>
      {shouldUseCursor && contentWidth && scrollRef.current && scrollRef.current.clientWidth < contentWidth && (
        <Box
          sx={{
            width: '100%',
            pointerEvents: 'auto',
            overflowX: 'auto',
            overflowY: 'visible',
            height: '17px',
            position: 'sticky',
            bottom: 0,
          }}
          onScroll={ev => {
            if (scrollRef.current && scrollRef.current.scrollLeft !== ev.currentTarget.scrollLeft) {
              if (!ignoreNextScrollBarEvent.current) {
                if (textAreaRef?.current) {
                  textAreaRef.current.scrollLeft = ev.currentTarget.scrollLeft
                }
                ignoreNextScrollContainerEvent.current = true
                scrollRef.current.scrollLeft = ev.currentTarget.scrollLeft
              } else {
                ignoreNextScrollBarEvent.current = false
              }
            }
          }}
          ref={horizontalScrollBarRef}
          // Prevent cursor events
          onClick={ev => ev.preventDefault()}
          onMouseDown={ev => ev.preventDefault()}
          onMouseUp={ev => ev.preventDefault()}
        >
          <Box sx={{width: contentWidth, height: '1px'}} />
        </Box>
      )}
    </Box>
  )
}

//becasue we are relying on the text area's highlighting to show the highlights, we need
//to sync the horizontal scrolling of the visible blob and the invisible text area
function handleBlobScrollSync(
  event: React.UIEvent<HTMLDivElement>,
  textAreaRef: React.RefObject<HTMLTextAreaElement> | undefined,
) {
  const scrolledElement = event.target as HTMLElement
  textAreaRef?.current?.scrollTo(scrolledElement.scrollLeft, scrolledElement.scrollTop)
}

export function getHorizontalScrollOffset(container: HTMLElement, lineNumber: number, column?: number): number {
  if (!column) {
    return 0
  }
  const element = queryMatchElement(lineNumber, column)
  if (!element) {
    return 0
  }

  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()
  const fitsWithoutScroll =
    containerRect.left + containerRect.width - container.scrollLeft - (elementRect.left + elementRect.width) > 0

  // Prefer 0 offset if element fits to avoid annoying micro scrolling
  return fitsWithoutScroll ? 0 : element.offsetLeft
}

try{ CodeLines.displayName ||= 'CodeLines' } catch {}
try{ CodeLinesUnmemoized.displayName ||= 'CodeLinesUnmemoized' } catch {}