import type {CodeSection} from '@github-ui/code-nav'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {ChevronDownIcon, ChevronRightIcon} from '@primer/octicons-react'
import {Box, type BoxProps, Octicon} from '@primer/react'
import {clsx} from 'clsx'
import React, {lazy, type PropsWithChildren, useCallback, useEffect, useRef} from 'react'

// eslint-disable-next-line no-restricted-imports
import {
  type BlobOffset,
  formatBlobRangeAnchor,
  parseBlobRange,
  parseFileAnchor,
} from '../../../../../github/blob-anchor'
import {useCursorSelectionRef} from '../../../../hooks/use-cursor-navigation'
import {useReposAnalytics} from '../../../../hooks/use-repos-analytics'
import type {SetStickyLinesType} from '../../../../hooks/use-sticky-lines'
import {
  calculateLineAndColumn,
  collapseRow,
  expandAllRows,
  expandRow,
  useIsLineCollapsed,
} from '../../../../utilities/lines'
import {BidiTooltip} from '../../Banners/Bidi'
import {CodeownersErrorLineIndicator} from '../../Banners/CodeownerFileBanner'
import type {HighlightedLineMenuHandle} from '../HighlightedLineMenu'
import {useHighlightedLinesInfo} from './HighlightedLineProvider'
import type {CodeLineData} from './hooks/use-code-lines'

interface LineNumberProps extends Pick<BoxProps, 'id' | 'onClick'> {
  codeLineData: CodeLineData
  ownedCodeSections?: Map<number, CodeSection[]> | null
  onCollapseToggle?: (isCollapsed: boolean) => void
  preventClick?: boolean
  onLineStickOrUnstick?: SetStickyLinesType
  virtualOffset?: number
}

const HighlightedLineMenu = lazy(() => import('../HighlightedLineMenu'))

export const LineNumber = React.memo(LineNumberUnmemoized)

function LineNumberUnmemoized({
  codeLineData,
  onClick,
  ownedCodeSections,
  onCollapseToggle,
  preventClick,
  onLineStickOrUnstick,
  virtualOffset,
}: PropsWithChildren<LineNumberProps>) {
  const {lineNumber, ownedSection, codeLineClassName, isStartLine, codeownersLineError, bidi} = codeLineData
  const {sendRepoClickEvent} = useReposAnalytics()
  const selectionRef = useCursorSelectionRef()

  const codeCellClickFunc: React.MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      if (event.defaultPrevented) {
        return
      }
      const targetedLineNumber = parseInt(event.currentTarget.getAttribute('data-line-number')!, 10)

      let anchorInfo = parseFileAnchor(`L${targetedLineNumber}`)

      let highlightStart: BlobOffset | undefined = undefined
      let highlightEnd: BlobOffset | undefined = undefined

      const cursorSelection = selectionRef.current
      if (cursorSelection) {
        highlightStart = cursorSelection.start
        highlightEnd = cursorSelection.end
      } else {
        const selectionRange = window.getSelection()?.rangeCount ? window.getSelection()?.getRangeAt(0) : null
        if (selectionRange) {
          highlightStart = calculateLineAndColumn(selectionRange.startContainer, selectionRange.startOffset)
          highlightEnd = calculateLineAndColumn(selectionRange.endContainer, selectionRange.endOffset)
        }
      }

      let selection = false
      if (
        highlightStart &&
        highlightEnd &&
        highlightStart.line <= targetedLineNumber &&
        highlightEnd.line >= targetedLineNumber
      ) {
        selection = true

        anchorInfo = {
          anchorPrefix: '',
          blobRange: {
            start: highlightStart,
            end: highlightEnd,
          },
        }
      }

      const {blobRange} = anchorInfo

      const currentLines = parseBlobRange(window.location.hash)
      if (currentLines && event.shiftKey && !selection) {
        sendRepoClickEvent('BLOB.MULTILINE')
        anchorInfo.blobRange = {
          start: currentLines.start,
          end: blobRange.end,
        }
      } else {
        sendRepoClickEvent('BLOB.LINE')
      }

      const hash = formatBlobRangeAnchor(anchorInfo)
      history.replaceState(history.state, '', hash)

      onClick?.(event)
    },
    [onClick, selectionRef, sendRepoClickEvent],
  )

  const highlightedInfo = useHighlightedLinesInfo(lineNumber)
  const isFirstHighlightedLine = highlightedInfo?.start.line === lineNumber

  // calculates if the line is fully within the highlight info
  // all lines numbers except the first line are considered fully highlight
  // the first line is considered fully highlighted if there is no column offset
  const isInHighlightRange =
    highlightedInfo && highlightedInfo.start.line < lineNumber && highlightedInfo.end.line >= lineNumber
  const isFullyHighlighted = isInHighlightRange || (isFirstHighlightedLine && highlightedInfo?.start.column === null)

  const menuAnchorRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HighlightedLineMenuHandle>(null)

  useLayoutEffect(() => {
    if (isFirstHighlightedLine) {
      menuRef.current?.setAnchor(menuAnchorRef.current)
    }
  }, [isFirstHighlightedLine])

  const {codeFoldingOption} = useCodeViewOptions()
  const showCodeFoldingIcon = codeFoldingOption.enabled

  useEffect(() => {
    if (!codeFoldingOption.enabled) {
      expandAllRows()
      onCollapseToggle?.(false)
      if (ownedSection) {
        ownedSection.collapsed = false
      }
    }
  }, [codeFoldingOption.enabled, ownedSection, onCollapseToggle])

  return (
    <>
      <div
        ref={menuAnchorRef}
        data-line-number={lineNumber}
        className={clsx(
          codeLineClassName,
          'react-line-number react-code-text',
          virtualOffset && 'virtual',
          preventClick && 'prevent-click',
          isFullyHighlighted && 'highlighted-line',
        )}
        style={
          virtualOffset ? {paddingRight: '16px', transform: `translateY(${virtualOffset}px)`} : {paddingRight: '16px'}
        }
        onMouseDown={preventClick ? undefined : codeCellClickFunc}
      >
        {lineNumber}
        {codeownersLineError && (
          <CodeAlert>
            <CodeownersErrorLineIndicator />
          </CodeAlert>
        )}
        {bidi && (
          <CodeAlert>
            <BidiTooltip />
          </CodeAlert>
        )}
        {showCodeFoldingIcon && isStartLine && ownedSection && ownedCodeSections && (
          <CodeAlert displayRight={true}>
            <CodeFoldingChevron
              codeLineData={codeLineData}
              onCollapseToggle={onCollapseToggle}
              onLineStickOrUnstick={onLineStickOrUnstick}
            />
          </CodeAlert>
        )}
      </div>
      {isFirstHighlightedLine && (
        <HighlightedLineMenu
          codeLineClassName={codeLineClassName}
          ref={menuRef}
          rowBeginId={`LG${highlightedInfo.start.line}`}
          rowBeginNumber={highlightedInfo.start.line}
          rowEndNumber={highlightedInfo.end.line}
          rowEndId={`LG${highlightedInfo.end.line}`}
        />
      )}
    </>
  )
}

interface CodeAlertProps extends Pick<BoxProps, 'sx'> {
  displayRight?: boolean
}

function CodeAlert({children, sx, displayRight}: PropsWithChildren<CodeAlertProps>) {
  const marginDirection = displayRight ? undefined : {left: '-4px'}
  const marginX = displayRight ? '8px' : '1px'
  return (
    <Box as="span" sx={{...marginDirection, margin: `1px ${marginX}`, position: 'absolute', zIndex: '1', ...sx}}>
      {children}
    </Box>
  )
}

function CodeFoldingChevron({
  codeLineData,
  onCollapseToggle,
  onLineStickOrUnstick,
}: {
  codeLineData: CodeLineData
  onCollapseToggle?: (isCollapsed: boolean) => void
  onLineStickOrUnstick?: SetStickyLinesType
}) {
  const collapsed = useIsLineCollapsed(codeLineData.lineNumber)

  const expand = useCallback(
    (event: React.MouseEvent) => {
      const {lineNumber, ownedSection} = codeLineData
      if (ownedSection) ownedSection.collapsed = false
      onCollapseToggle?.(false)
      expandRow(lineNumber)
      onLineStickOrUnstick?.(codeLineData, true)
      event.preventDefault()
    },
    [codeLineData, onCollapseToggle, onLineStickOrUnstick],
  )

  const collapse = useCallback(
    (event: React.MouseEvent) => {
      const {lineNumber, ownedSection} = codeLineData
      if (ownedSection) ownedSection.collapsed = true
      onCollapseToggle?.(true)
      collapseRow(lineNumber)
      event.preventDefault()
    },
    [codeLineData, onCollapseToggle],
  )

  return collapsed ? (
    <Box aria-label={'Expand code section'} onMouseDown={expand} role="button" sx={{position: 'absolute'}}>
      <Octicon icon={ChevronRightIcon} />
    </Box>
  ) : (
    <Box aria-label={'Collapse code section'} onMouseDown={collapse} role="button" sx={{position: 'absolute'}}>
      <Octicon icon={ChevronDownIcon} />
    </Box>
  )
}

try{ HighlightedLineMenu.displayName ||= 'HighlightedLineMenu' } catch {}
try{ LineNumber.displayName ||= 'LineNumber' } catch {}
try{ LineNumberUnmemoized.displayName ||= 'LineNumberUnmemoized' } catch {}
try{ CodeAlert.displayName ||= 'CodeAlert' } catch {}
try{ CodeFoldingChevron.displayName ||= 'CodeFoldingChevron' } catch {}