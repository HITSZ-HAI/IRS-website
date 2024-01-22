import type {CodeSection} from '@github-ui/code-nav'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {Box, Link} from '@primer/react'
import React from 'react'

import {useCurrentBlob} from '../../../../hooks/CurrentBlob'
import type {SetStickyLinesType} from '../../../../hooks/use-sticky-lines'
import {CodeLine} from './CodeLine'
import type {CodeLineData} from './hooks/use-code-lines'
import {LineNumber} from './LineNumber'

interface CodeLinesSSRProps {
  linesData: CodeLineData[]
  tabSize: number
  onCollapseToggle: () => void

  codeSections?: Map<number, CodeSection[]>
  codeLineToSectionMap?: Map<number, CodeSection[]>
  contentWidth?: number
  copilotAccessAllowed: boolean
  onLineNumberClick?: React.MouseEventHandler<HTMLDivElement>
  onLineStickOrUnstick?: SetStickyLinesType
}

export const CodeLinesSSR = React.memo(CodeLinesSSRUnmemoized)

function CodeLinesSSRUnmemoized({
  linesData,
  onLineNumberClick,
  codeSections,
  codeLineToSectionMap,
  onLineStickOrUnstick,
  tabSize,
  contentWidth,
  copilotAccessAllowed,
  onCollapseToggle,
}: CodeLinesSSRProps) {
  const wrapOptionEnabled = useCodeViewOptions().codeWrappingOption.enabled
  const {rawBlobUrl} = useCurrentBlob()

  return (
    <>
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
          overflow: 'auto',
          maxWidth: wrapOptionEnabled ? '100%' : 'unset',
        }}
        data-hpc
      >
        <div className="react-line-numbers" style={{pointerEvents: 'auto'}}>
          {linesData.map(lineData => {
            return (
              <LineNumber
                codeLineData={lineData}
                key={`line-number-${lineData.lineNumber}`}
                onClick={onLineNumberClick}
                ownedCodeSections={codeSections}
                onLineStickOrUnstick={onLineStickOrUnstick}
                onCollapseToggle={onCollapseToggle}
              />
            )
          })}
        </div>
        <div className="react-code-lines">
          {linesData.map(lineData => {
            return (
              <CodeLine
                codeLineData={lineData}
                codeLineClassName={lineData.codeLineClassName}
                key={`line-number-${lineData.lineNumber}-content:${lineData.rawText}`}
                id={`LC${lineData.lineNumber}`}
                onLineStickOrUnstick={onLineStickOrUnstick}
                setIsCollapsed={onCollapseToggle}
                codeLineToSectionMap={codeLineToSectionMap}
                copilotAccessAllowed={copilotAccessAllowed}
                measureRef={undefined}
              />
            )
          })}
        </div>
      </Box>
      {linesData.length === 1000 && (
        <Box sx={{justifyContent: 'center', display: 'flex'}}>
          <Link href={rawBlobUrl}>View remainder of file in raw view</Link>
        </Box>
      )}
    </>
  )
}

try{ CodeLinesSSR.displayName ||= 'CodeLinesSSR' } catch {}
try{ CodeLinesSSRUnmemoized.displayName ||= 'CodeLinesSSRUnmemoized' } catch {}