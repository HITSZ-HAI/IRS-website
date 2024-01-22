import type {CodeSection} from '@github-ui/code-nav'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {EllipsisIcon} from '@primer/octicons-react'
import {Box, type BoxProps} from '@primer/react'
import {clsx} from 'clsx'
import React, {useRef} from 'react'

import {useCurrentBlob} from '../../../../hooks/CurrentBlob'
import {useCodeLineIntersectionObservers} from '../../../../hooks/use-code-line-observer'
import {useCurrentLineHeight} from '../../../../hooks/use-current-line-height'
import {useIsSafari} from '../../../../hooks/use-is-safari'
import {useStickyHeaderHeight} from '../../../../hooks/use-sticky-header-height'
import type {SetStickyLinesType} from '../../../../hooks/use-sticky-lines'
import {
  calculateHighlightOffsetAndWidth,
  expandRow,
  type HighlightPosition,
  useIsLineCollapsed,
} from '../../../../utilities/lines'
import {CopilotButton, type CopilotButtonHandle} from '../CopilotButton'
import {HighlightedOverlay} from '../HighlightedOverlay'
import {useHighlightedLinesInfo} from './HighlightedLineProvider'
import type {CodeLineData} from './hooks/use-code-lines'
import {useFocusedSearchResult, useSearchResults} from './SearchResultsProvider'
import {SyntaxHighlightedLine} from './SyntaxHighlightedLine'

const noop = () => {}

interface CodeLineProps extends Pick<BoxProps, 'id' | 'onClick'> {
  codeLineData: CodeLineData
  codeLineClassName?: string
  paddingLeft?: string
  setIsCollapsed?: (isCollapsed: boolean) => void
  onLineStickOrUnstick?: SetStickyLinesType
  highlightedTerm?: string
  codeLineToSectionMap?: Map<number, CodeSection[]> | undefined
  virtualOffset?: number
  virtualKey?: number | string
  forceVisible?: boolean
  measureRef?: (el: HTMLElement | null) => void
  shouldUseCursor?: boolean
  copilotAccessAllowed: boolean
}

export const CodeLine = React.memo(CodeLineUnmemoized)

function CodeLineUnmemoized({
  codeLineData,
  codeLineClassName,
  id,
  onClick,
  setIsCollapsed,
  onLineStickOrUnstick,
  virtualOffset,
  codeLineToSectionMap,
  virtualKey,
  forceVisible,
  measureRef,
  copilotAccessAllowed,
}: CodeLineProps) {
  const {lineNumber, stylingDirectivesLine, rawText} = codeLineData
  const collapsed = useIsLineCollapsed(lineNumber)
  const {tabSize} = useCurrentBlob()
  const highlightedInfo = useHighlightedLinesInfo(lineNumber)
  const fileLineRef = useRef<HTMLDivElement>(null)

  const highlightPosition =
    !highlightedInfo || !fileLineRef.current
      ? undefined
      : calculateHighlightOffsetAndWidth(highlightedInfo, fileLineRef.current, lineNumber, tabSize, rawText ?? '')

  const canDoStickyLines = true
  const numParents = codeLineToSectionMap?.get(lineNumber)?.length ?? 0
  const stickyHeaderHeight = useStickyHeaderHeight()
  const lineRefCallbackForObserver = useCodeLineIntersectionObservers(
    codeLineData,
    canDoStickyLines,
    stickyHeaderHeight,
    onLineStickOrUnstick ?? noop,
    numParents,
  )

  const wrapOption = useCodeViewOptions().codeWrappingOption

  const overlaySymbols = useSearchResults(lineNumber)
  const focusedSymbol = useFocusedSearchResult(lineNumber)

  const currentLineHeight = useCurrentLineHeight('react-code-lines')

  const isFirstHighlightedLine = highlightedInfo?.start.line === lineNumber

  const menuAnchorRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<CopilotButtonHandle>(null)

  useLayoutEffect(() => {
    if (isFirstHighlightedLine) {
      menuRef.current?.setAnchor(menuAnchorRef.current)
    }
  }, [isFirstHighlightedLine])

  return (
    // TODO: this is not yet accessible.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      ref={element => {
        measureRef?.(element)
        lineRefCallbackForObserver(element as HTMLTableRowElement | null)
      }}
      data-key={virtualKey}
      className={clsx(
        codeLineClassName,
        'react-code-text react-code-line-contents',
        virtualOffset && 'virtual',
        wrapOption.enabled && measureRef && 'react-code-text-cell',
      )}
      style={{
        transform: virtualOffset ? `translateY(${virtualOffset}px)` : undefined,
        minHeight: wrapOption.enabled ? currentLineHeight : 'auto',
      }}
      onClick={onClick}
    >
      <div ref={menuAnchorRef}>
        {highlightedInfo && <HighlighterElement lineNumber={lineNumber} highlightPosition={highlightPosition} />}

        {collapsed && !highlightedInfo && (
          <HighlighterElement subtle lineNumber={lineNumber} highlightPosition={highlightPosition} />
        )}

        {overlaySymbols && overlaySymbols.length > 0 && (
          <HighlightedOverlay
            symbols={overlaySymbols}
            focusedSymbol={focusedSymbol}
            sx={{paddingLeft: '10px', width: 'auto'}}
            lineNumber={lineNumber}
          />
        )}
        <SyntaxHighlightedLine
          id={id}
          lineNumber={lineNumber}
          stylingDirectivesLine={stylingDirectivesLine}
          current={!!highlightedInfo}
          rawText={rawText}
          forceVisible={forceVisible}
          ref={fileLineRef}
        />
        <ExpandRowEllipsis
          codeLineData={codeLineData}
          setIsCollapsed={setIsCollapsed}
          onLineStickOrUnstick={onLineStickOrUnstick}
        />
        {isFirstHighlightedLine && copilotAccessAllowed && (
          <CopilotButton
            ref={menuRef}
            rowBeginNumber={highlightedInfo.start.line}
            rowEndNumber={highlightedInfo.end.line}
          />
        )}
      </div>
    </div>
  )
}

function HighlighterElement({
  lineNumber,
  highlightPosition,
  subtle,
}: {
  lineNumber: number
  highlightPosition?: HighlightPosition
  subtle?: boolean
}) {
  //on safari the highlights are weirdly offset from the text area highlights, so we add a -3px bump to them
  const isSafari = useIsSafari()

  const hasOffset = highlightPosition?.offset !== undefined
  const hasWidth = highlightPosition?.width !== undefined
  const offset = highlightPosition?.offset ?? -72 // 72 is the width of the line number column ($lineNumberWidth)
  const width = highlightPosition?.width ?? 0

  // 82 is the width of the line number column ($lineNumberWidth) + 10px padding
  const widthWithOffset = hasOffset && hasWidth ? width : width + 82

  // 72 is the width of the line number column ($lineNumberWidth) that we are offsetting
  const defaultWidth = `calc(100% + 72px)`

  return (
    <Box
      sx={{
        position: 'absolute',
        backgroundColor: subtle ? 'neutral.subtle' : 'var(--bgColor-attention-muted, var(--color-attention-subtle))',
        height: '100%',
        opacity: '.6',
        boxShadow: subtle
          ? 'inset 2px 0 0 var(--fgColor-muted,  var(--color-fg-subtle))'
          : 'inset 2px 0 0 var(--fgColor-attention, var(--color-attention-fg))',
        top: isSafari ? '-3px' : 0,
        left: `${offset}px`,
        width: hasWidth ? `${widthWithOffset}px` : defaultWidth,
        // Allow clicks to pass through this element to the underlying code line
        pointerEvents: 'none',
      }}
      key={`highlighted-line-${lineNumber}`}
    />
  )
}

interface ExpandRowEllipsisProps {
  codeLineData: CodeLineData
  setIsCollapsed?: (isCollapsed: boolean) => void
  onLineStickOrUnstick?: SetStickyLinesType
}

function ExpandRowEllipsis({codeLineData, setIsCollapsed, onLineStickOrUnstick}: ExpandRowEllipsisProps) {
  const {lineNumber, ownedSection} = codeLineData
  const collapsed = useIsLineCollapsed(lineNumber)

  if (!collapsed) return null

  return (
    <>
      <button
        aria-label="Expand row"
        className="Button Button--iconOnly Button--invisible Button--small px-2 py-0 ml-1 border-0 expand-row-ellipsis"
        onMouseDown={ev => {
          expandRow(lineNumber)
          setIsCollapsed?.(false)

          if (ownedSection) {
            ownedSection.collapsed = false
            onLineStickOrUnstick?.(codeLineData, true)
          }

          ev.preventDefault()
        }}
      >
        <EllipsisIcon />
      </button>
    </>
  )
}

try{ CodeLine.displayName ||= 'CodeLine' } catch {}
try{ CodeLineUnmemoized.displayName ||= 'CodeLineUnmemoized' } catch {}
try{ HighlighterElement.displayName ||= 'HighlighterElement' } catch {}
try{ ExpandRowEllipsis.displayName ||= 'ExpandRowEllipsis' } catch {}