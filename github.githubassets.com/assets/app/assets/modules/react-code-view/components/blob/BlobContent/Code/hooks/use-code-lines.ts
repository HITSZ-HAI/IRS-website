import type {CodeSection} from '@github-ui/code-nav'
import type {SplitCodeownersError, StylingDirectivesDocument, StylingDirectivesLine} from '@github-ui/code-view-types'
import {useClientValue} from '@github-ui/use-client-value'
import {useMemo, useRef} from 'react'

import {buildRowClass, useLinesSubscription} from '../../../../../utilities/lines'
import {hasBidiCharacters, isBidiShown, showBidiCharactersRaw} from '../../../Banners/Bidi'

export interface CodeLineData {
  stylingDirectivesLine?: StylingDirectivesLine
  rawText?: string
  lineNumber: number
  codeLineClassName?: string
  isStartLine?: boolean
  isEndLine?: boolean
  ownedSection?: CodeSection
  bidi?: boolean
  codeownersLineError?: SplitCodeownersError
}
interface CodeLines {
  lines: CodeLineData[]
  plainTextLinesAsString: string
}

export function useCodeLines(
  rawLines: string[],
  stylingDirectives: StylingDirectivesDocument | null,
  codeSections: Map<number, CodeSection[]> | null,
  splitCodeownersErrors: SplitCodeownersError[],
  codeLineToSectionMap: Map<number, CodeSection[]> | undefined,
): CodeLines {
  const linesData = useLinesData(rawLines, stylingDirectives, codeSections, splitCodeownersErrors, codeLineToSectionMap)
  const exposeBIDICharacters = isBidiShown()

  const collapsedLinesDependancy = useRef('')
  useLinesSubscription(
    collapsedSections => (collapsedLinesDependancy.current = createCollapsedLinesString(collapsedSections)),
  )

  const lines = useMemo(
    () => getLinesDataWithCollapsedSectionsExcluded(linesData, codeSections),
    //we only want to re-run this function if the set of collapsed lines changes, which the ref will track
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [linesData, codeSections, collapsedLinesDependancy.current],
  )

  //need to build the plain text lines as a singular string to be able to use the textArea
  const plainTextLinesAsString = lines
    .map(line => (exposeBIDICharacters && line.rawText ? showBidiCharactersRaw(line.rawText) : line.rawText))
    .join('\n')
  return {lines, plainTextLinesAsString}
}

function useLinesData(
  rawLines: string[],
  stylingDirectives: StylingDirectivesDocument | null,
  codeSections: Map<number, CodeSection[]> | null,
  splitCodeownersErrors: SplitCodeownersError[],
  codeLineToSectionMap: Map<number, CodeSection[]> | undefined,
): CodeLineData[] {
  const [linesToRender] = useClientValue(() => rawLines.length, Math.min(rawLines.length, 1000), [rawLines])
  return useMemo(() => {
    const lineNumbers = new Array(linesToRender).fill(null).map((_, i) => i + 1)
    return lineNumbers.map(lineNumber => {
      const stylingDirectivesLine = stylingDirectives?.[lineNumber - 1]

      let ownedSection = undefined

      let isStartLine = false
      let isEndLine = false
      for (const section of codeSections?.get(lineNumber) ?? []) {
        if (section.startLine === lineNumber) {
          isStartLine = true
          ownedSection = section
        }
        if (section.endLine === lineNumber) {
          isEndLine = true
        }
      }

      //we want to remove any newlines from the raw text so it doesn't throw off the character count
      const rawText: string = rawLines[lineNumber - 1]?.replace(/[\n\r]/g, '') ?? ''
      const codeSectionArray = codeLineToSectionMap ? codeLineToSectionMap.get(lineNumber) || [] : []
      const codeLineClassName = buildRowClass(codeSectionArray, lineNumber, isEndLine, codeSections)

      return {
        stylingDirectivesLine,
        lineNumber,
        codeLineClassName,
        isStartLine,
        isEndLine,
        ownedSection,
        rawText,
        bidi: hasBidiCharacters(rawText),
        codeownersLineError: splitCodeownersErrors?.find(error => error.line === lineNumber),
      }
    })
  }, [linesToRender, stylingDirectives, rawLines, codeLineToSectionMap, codeSections, splitCodeownersErrors])
}

// This function is more performant operating under the assumption that the start line of a collapsed code section
// will be the first line encountered of a given collapsed section every time, which since it is looking at the lines
// from top down I believe is a safe assumption. If there is some scenario where this is not true, it will still
// work, but it will be less performant.
export function getLinesDataWithCollapsedSectionsExcluded(
  fullLinesData: CodeLineData[],
  codeSections: Map<number, CodeSection[]> | null,
): CodeLineData[] {
  const excludedLines = new Set<number>()
  for (let i = 0; i < fullLinesData.length; i++) {
    //if we already are excluding this line, there is no need to do any additional work because that means it is
    //a child of a collapsed section. Even if it is the start of a different collapsed section, because it is a
    //child of an already collapsed/excluded section there is no need to keep doing that work
    if (excludedLines.has(i)) continue
    const sections = codeSections?.get(i) ?? []
    for (let j = 0; j < sections.length; j++) {
      if (sections[j]!.collapsed) {
        //startline + 1 because we don't want to remove the start line itself
        for (let k = sections[j]!.startLine + 1; k <= sections[j]!.endLine; k++) {
          excludedLines.add(k)
        }
        //skip the work of iterating over the rest of the lines in the section which was just collapsed
        if (sections[j]!.startLine === i) {
          i = sections[j]!.endLine
        }
        //for this line specifically there is no need to keep iterating through the sections
        break
      }
    }
  }

  return fullLinesData.filter(lineData => !excludedLines.has(lineData.lineNumber))
}

function createCollapsedLinesString(collapsedLines: Set<number>): string {
  const setArray = [...collapsedLines]
  setArray.sort()
  return setArray.join(',')
}
