import {useCallback, useState} from 'react'

import type {CodeLineData} from '../components/blob/BlobContent/Code/hooks/use-code-lines'

export const DELETE_STICKY_LINES_VALUE = null

export type SetStickyLinesType = (codeLineData: CodeLineData | null, removeStickyLine: boolean) => void

export function useStickyLines() {
  const [currentStickyLines, setCurrentStickyLines] = useState<Map<number, CodeLineData>>(new Map())
  const setStickyLines = useCallback(
    (codeLineData: CodeLineData | null, removeStickyLine: boolean) => {
      let modifiedLines = false

      //if current sticky lines are already empty and we are trying to delete, no work to do
      if (codeLineData === DELETE_STICKY_LINES_VALUE && currentStickyLines.size === 0) {
        return
      }

      //if lineNumber is -1, that's the signal to clear out the entire map
      if (codeLineData === DELETE_STICKY_LINES_VALUE && removeStickyLine) {
        currentStickyLines.clear()
        setCurrentStickyLines(new Map(currentStickyLines))
        return
      }

      if (!codeLineData) return

      const lineNumber = codeLineData.lineNumber

      if (removeStickyLine && currentStickyLines.has(lineNumber)) {
        //remove the line from the map
        currentStickyLines.delete(lineNumber)
        modifiedLines = true
      } else if (!removeStickyLine && !currentStickyLines.has(lineNumber)) {
        //add the line to the map
        currentStickyLines.set(lineNumber, codeLineData)
        modifiedLines = true
      }

      if (currentStickyLines.has(lineNumber)) {
        for (const [otherStickyLineNumber] of currentStickyLines) {
          const otherStickyLine = currentStickyLines.get(otherStickyLineNumber)!
          if (
            !otherStickyLine.ownedSection ||
            otherStickyLine.ownedSection.endLine < lineNumber ||
            lineNumber < otherStickyLine.lineNumber
          ) {
            currentStickyLines.delete(otherStickyLineNumber)
            modifiedLines = true
          }
        }
      }

      if (modifiedLines) {
        setCurrentStickyLines(new Map(currentStickyLines))
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return {currentStickyLines, setStickyLines}
}
