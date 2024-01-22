import {Box} from '@primer/react'

import {scrollLineIntoView} from '../../hooks/use-scroll-line-into-view'
import {CodeLine} from '../blob/BlobContent/Code/CodeLine'
import type {CodeLineData} from '../blob/BlobContent/Code/hooks/use-code-lines'
import {LineNumber} from '../blob/BlobContent/Code/LineNumber'

export function StickyLinesHeader({currentStickyLines}: {currentStickyLines: Map<number, CodeLineData>}) {
  const stickyLines = Array.from(currentStickyLines.values())

  return (
    <Box sx={{overflow: 'hidden', display: 'flex'}}>
      <Box className="react-line-numbers" sx={{marginLeft: '2px'}}>
        {stickyLines.map(stickyLine => {
          return <LineNumber key={`sticky-header-line-number-${stickyLine.lineNumber}`} codeLineData={stickyLine} />
        })}
      </Box>
      <div className="react-code-lines">
        {stickyLines.map(stickyLine => {
          return (
            <CodeLine
              key={`sticky-header-line-${stickyLine.lineNumber}`}
              codeLineData={stickyLine}
              codeLineToSectionMap={undefined}
              copilotAccessAllowed={false} // we're not going to show copilot buttons in the sticky lines
              onClick={() => scrollLineIntoView({line: stickyLine.lineNumber})}
            />
          )
        })}
      </div>
    </Box>
  )
}

try{ StickyLinesHeader.displayName ||= 'StickyLinesHeader' } catch {}