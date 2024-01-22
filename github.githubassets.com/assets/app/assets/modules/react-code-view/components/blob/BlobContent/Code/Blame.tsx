import type {Blame, BlameCommit, BlameRange} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {blamePath, commitHovercardPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {SafeHTMLText} from '@github-ui/safe-html'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {useVirtualWindow} from '@github-ui/use-virtual'
import {VersionsIcon} from '@primer/octicons-react'
import {Box, RelativeTime, Tooltip} from '@primer/react'
import React, {useCallback, useImperativeHandle, useRef} from 'react'

import {useBlameAgeColor} from '../../../../../react-shared/Repos/blameUtils'
import {useCurrentBlame} from '../../../../hooks/CurrentBlame'
import {isLineInViewport} from '../../../../utilities/lines'
import type {CodeLinesHandle} from './code-lines-handle'
import {CodeLine} from './CodeLine'
import type {CodeLineData} from './hooks/use-code-lines'
import {LineNumber} from './LineNumber'

const codeRowHeightInPixels = 20
const singleBlameLineHeightWide = 31 // 20px line height + 10px vertical padding + 1px border
const singleBlameLineHeightNarrow = 41 // 20px line height + 20px vertical padding + 1px border
const defaultOverscanAmount = 100

interface BlameLinesProps {
  linesData: readonly CodeLineData[]
  tabSize: number
  materializeAllLines?: boolean
  copilotAccessAllowed: boolean
  onLineNumberClick?: React.MouseEventHandler<HTMLDivElement>
}
export const BlameLines = React.forwardRef(BlameLinesWithRef)

export function BlameLinesSSR({copilotAccessAllowed, linesData, tabSize, onLineNumberClick}: BlameLinesProps) {
  const parentRef = useRef<HTMLTableElement>(null)

  const blame = useCurrentBlame()
  const blameSegments = extractBlameSegments(blame, linesData)
  return (
    <div className="d-flex flex-column" style={{tabSize}} ref={parentRef} data-hpc>
      {blameSegments.map((segment, index) => (
        <BlameSegment
          key={`blame-for-segment-${segment.range?.start ?? segment.linesData[0]!.lineNumber}`}
          {...segment}
          index={index}
          copilotAccessAllowed={copilotAccessAllowed}
          onLineNumberClick={onLineNumberClick}
        />
      ))}
    </div>
  )
}
function BlameLinesWithRef(
  {copilotAccessAllowed, linesData, tabSize, materializeAllLines, onLineNumberClick}: BlameLinesProps,
  ref: React.ForwardedRef<CodeLinesHandle>,
) {
  const parentRef = useRef<HTMLTableElement>(null)
  const blame = useCurrentBlame()
  const {screenSize} = useScreenSize()

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (isLineInViewport(0)) return
      virtualizer.scrollToIndex(0, {align: 'start'})
    },
    scrollToLine: lineNumber => {
      if (isLineInViewport(lineNumber)) return
      virtualizer.scrollToIndex(lineNumber, {align: 'center'})
    },
  }))

  /**
   * This size estimation function is used by the virtualizer to guess which elements should appear in the window.
   * It doesn't need to be perfect - it just needs to get close.
   */
  const estimateSize = useCallback(
    (index: number) => {
      const line = linesData[index]!
      const range = blame?.ranges[line.lineNumber]
      if (range && range.end === range.start) {
        //using window.innerWidth means this estimate won't be udpated if a user resizes their window. It's just
        //a guess though, so it probably will be fine?
        return window.innerWidth > ScreenSize.medium ? singleBlameLineHeightWide : singleBlameLineHeightNarrow
      }

      return codeRowHeightInPixels
    },
    [linesData, blame],
  )

  const virtualizer = useVirtualWindow({
    parentRef,
    size: linesData.length,
    overscan: materializeAllLines ? Number.MAX_SAFE_INTEGER : defaultOverscanAmount,
    estimateSize,
  })

  const virtualLinesData = virtualizer.virtualItems.map(virtualItem => ({
    ...linesData[virtualItem.index]!,
    virtualOffset: virtualItem.start,
  }))

  const blameSegments = extractBlameSegments(blame, virtualLinesData)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        isolation: 'isolate',
        position: 'relative',
        tabSize,
        height: [
          // If the screen size is < 768px, we show the blame lines as a column. This means the height calculation
          // Will be wrong
          `${virtualizer.totalSize + blameSegments.length * singleBlameLineHeightNarrow}px`,
          `${virtualizer.totalSize + blameSegments.length * singleBlameLineHeightNarrow}px`,
          `${virtualizer.totalSize}px`,
        ],
      }}
      ref={parentRef}
      data-hpc
    >
      {blameSegments.map((segment, index) => {
        let virtualOffset = segment.linesData[0]!.virtualOffset ?? 0

        if (screenSize < ScreenSize.large) {
          virtualOffset += (index ?? 0) * singleBlameLineHeightNarrow
        }

        return (
          <BlameSegment
            key={`blame-for-segment-${segment.range?.start ?? segment.linesData[0]!.lineNumber}`}
            range={segment.range}
            commit={segment.commit}
            linesData={segment.linesData}
            index={index}
            copilotAccessAllowed={copilotAccessAllowed}
            onLineNumberClick={onLineNumberClick}
            virtualOffset={virtualOffset}
          />
        )
      })}
    </Box>
  )
}

interface BlameSegmentProps extends BlameSegmentData, VirtualLineData {
  copilotAccessAllowed: boolean
  onLineNumberClick?: React.MouseEventHandler<HTMLDivElement>
}

function BlameSegment({
  range,
  commit,
  linesData,
  virtualOffset,
  copilotAccessAllowed,
  onLineNumberClick,
}: BlameSegmentProps) {
  function BlameSegmentContent() {
    return (
      <>
        {range && commit ? <BlameForRange range={range} commit={commit} /> : <div className="height-full" />}
        <div className="d-flex flex-row">
          <div className={`react-line-numbers ${linesData.length > 1 ? '' : 'react-blame-no-line-data'}`}>
            {linesData.map(lineData => (
              <LineNumber
                key={`line-number-${lineData.lineNumber}`}
                codeLineData={lineData}
                onClick={onLineNumberClick}
              />
            ))}
          </div>
          <div className={`react-code-lines ${linesData.length > 1 ? '' : 'react-blame-no-line-data'}`}>
            {linesData.map(lineData => (
              <CodeLine
                key={`code-line=${lineData.lineNumber}`}
                id={`LC${lineData.lineNumber}`}
                codeLineData={lineData}
                copilotAccessAllowed={copilotAccessAllowed}
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className="react-blame-segment-wrapper"
      style={
        virtualOffset !== undefined
          ? {
              transform: `translateY(${virtualOffset}px)`,
              position: 'absolute',
              top: 0,
            }
          : undefined
      }
    >
      {BlameSegmentContent()}
    </div>
  )
}

interface VirtualLineData {
  virtualOffset?: number
}

interface VirtualCodeLineData extends CodeLineData, VirtualLineData {}

interface BlameSegmentData {
  commit?: BlameCommit
  range?: BlameRange
  linesData: readonly VirtualCodeLineData[]
  virtualOffset?: number
  index?: number
}

interface InProgressBlameSegmentData extends BlameSegmentData {
  linesData: VirtualCodeLineData[]
}

function extractBlameSegments(blame: Blame | undefined, linesData: readonly VirtualCodeLineData[]): BlameSegmentData[] {
  if (!blame) return [{linesData}]

  const segments: InProgressBlameSegmentData[] = []

  let current: InProgressBlameSegmentData | null = null
  let isFirst = true
  for (const lineData of linesData) {
    if (!current) {
      current = {linesData: []}
    }

    const range = isFirst
      ? Object.values(blame?.ranges ?? {}).find(r => r.start <= lineData.lineNumber && r.end >= lineData.lineNumber)
      : blame?.ranges[lineData.lineNumber]
    if (range) {
      current.range = range
      current.commit = blame.commits[range.commitOid]
    }

    current.linesData.push(lineData)

    if (current.range?.end === lineData.lineNumber) {
      segments.push(current)
      current = null
    }

    isFirst = false
  }

  if (current) {
    segments.push(current)
    current = null
  }

  return segments
}

const BlameForRange = React.memo(BlameForRangeUnmemoized)

function BlameForRangeUnmemoized({range, commit}: {range: BlameRange; commit: BlameCommit}) {
  const repo = useCurrentRepository()
  const commitDate = new Date(commit.committedDate)
  const repoCreationDate = new Date(repo.createdAt)

  const timestampAgoElement = (
    <div className="timestamp-ago">
      <RelativeTime
        date={commitDate}
        tense="past"
        sx={{color: 'fg.muted', whiteSpace: 'nowrap', fontSize: 'smaller'}}
      />
    </div>
  )

  return (
    <div className="react-blame-for-range d-flex">
      <div aria-hidden className="age-indicator">
        <BlameAgeIndicator commitDate={commitDate} repoCreationDate={repoCreationDate} />
      </div>
      <div className="pt-1 timestamp-wrapper-desktop">{timestampAgoElement}</div>
      <div className="author-avatar-wrapper">
        {commit.authorAvatarUrl && <GitHubAvatar src={commit.authorAvatarUrl} size={18} />}
      </div>
      <Box
        sx={{
          verticalAlign: 'top',
          pt: [2, 2, '6px'],
          pb: [2, 2, 0],
          // Screens < 768px, let the commit message grow to fill the space
          minWidth: [0, 0, 170],
          flexGrow: [1, 1, 1],
        }}
      >
        <div className="d-flex">
          <SafeHTMLText
            html={commit.shortMessageHtmlLink}
            sx={{
              whiteSpace: 'nowrap',
              ml: 2,
              overflowX: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              fontSize: [1, 1, 0],
            }}
            data-hovercard-url={commitHovercardPath({owner: repo.ownerLogin, repo: repo.name, commitish: commit.oid})}
          />
        </div>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignContent: 'flex-start',
          justifySelf: 'flex-end',
          verticalAlign: 'top',
          pl: 2,
          pt: ['2px', '2px', '1px'],
          pb: [1, 1, 0],
          width: [150, 150, 34],
          pr: [2, 2, 0],
        }}
      >
        <div className="pt-1 pr-3 timestamp-wrapper-mobile">{timestampAgoElement}</div>
        <ReblameButton range={range} commit={commit} />
      </Box>
    </div>
  )
}

function ReblameButton({range, commit}: {range: BlameRange; commit: BlameCommit}) {
  const repo = useCurrentRepository()
  if (!range.reblamePath) return null

  const href = blamePath({
    owner: repo.ownerLogin,
    repo: repo.name,
    commitish: commit.firstParentOid,
    filePath: range.reblamePath,
  })

  const longDateFormatter = new Intl.DateTimeFormat(undefined, {year: 'numeric', month: 'short', day: 'numeric'})
  const shortSHA = commit.oid.slice(0, 7)
  const formattedDate = longDateFormatter.format(new Date(commit.committedDate))
  const blameLabel = `Blame prior to change ${shortSHA}, made on ${formattedDate}`
  const reblameId = `reblame-${shortSHA}`

  return (
    <Tooltip aria-label={blameLabel} id={reblameId}>
      <Link aria-labelledby={reblameId} to={href} className="Button Button--iconOnly Button--invisible Button--small">
        <VersionsIcon />
      </Link>
    </Tooltip>
  )
}

function BlameAgeIndicator({commitDate, repoCreationDate}: {commitDate: Date; repoCreationDate: Date}) {
  const color = useBlameAgeColor(commitDate, repoCreationDate)
  return <div className="blame-age-indicator" style={{backgroundColor: color}} />
}

try{ BlameLines.displayName ||= 'BlameLines' } catch {}
try{ BlameLinesSSR.displayName ||= 'BlameLinesSSR' } catch {}
try{ BlameLinesWithRef.displayName ||= 'BlameLinesWithRef' } catch {}
try{ BlameSegment.displayName ||= 'BlameSegment' } catch {}
try{ BlameSegmentContent.displayName ||= 'BlameSegmentContent' } catch {}
try{ BlameForRange.displayName ||= 'BlameForRange' } catch {}
try{ BlameForRangeUnmemoized.displayName ||= 'BlameForRangeUnmemoized' } catch {}
try{ ReblameButton.displayName ||= 'ReblameButton' } catch {}
try{ BlameAgeIndicator.displayName ||= 'BlameAgeIndicator' } catch {}