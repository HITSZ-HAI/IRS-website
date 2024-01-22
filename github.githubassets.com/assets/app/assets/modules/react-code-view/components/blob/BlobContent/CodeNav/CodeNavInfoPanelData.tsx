import type {CodeReference, CodeSymbol, DefinitionOrReference} from '@github-ui/code-nav'
import {Box} from '@primer/react'
import {useMemo} from 'react'

import {CodeNavFileInformation, type CodeNavFileInformationProps} from './CodeNavFileInformation'

export function CodeNavInfoPanelData({
  definitions,
  references,
  highlightedIndex,
  initiallyExpanded,
  enableExpandCollapse,
  onClick,
  symbol,
  setFocusOnFile,
}: {
  definitions?: CodeSymbol[]
  references?: CodeReference[]
  highlightedIndex?: CodeNavFileInformationProps['highlightedIndex']
  isDefinition?: boolean
  initiallyExpanded: CodeNavFileInformationProps['initiallyExpanded']
  enableExpandCollapse: CodeNavFileInformationProps['enableExpandCollapse']
  onClick?: CodeNavFileInformationProps['onClick']
  symbol: CodeNavFileInformationProps['symbol']
  setFocusOnFile?: CodeNavFileInformationProps['setFocusOnFile']
}) {
  const pathGrouped = useMemo(() => {
    const grouped: {[key: string]: DefinitionOrReference[]} = {}

    if (definitions) {
      for (const def of definitions) {
        const key = def.pathKey()
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key]!.push(def)
      }
    } else if (references) {
      for (const ref of references) {
        const key = ref.pathKey()
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key]!.push(ref)
      }
    }

    return grouped
  }, [definitions, references])

  let offset = 0

  return (
    <Box>
      {Object.keys(pathGrouped).map((key, i) => {
        const results = pathGrouped[key]!
        const info = (
          <CodeNavFileInformation
            repo={results[0]!.repo}
            filePath={results[0]!.path}
            results={results}
            key={key}
            highlightedIndex={highlightedIndex}
            isDefinition={definitions !== undefined && definitions.length > 0}
            onClick={onClick}
            offset={offset}
            initiallyExpanded={initiallyExpanded}
            enableExpandCollapse={enableExpandCollapse}
            symbol={symbol}
            setFocusOnFile={i === 0 && setFocusOnFile}
          />
        )
        offset += results.length
        return info
      })}
    </Box>
  )
}

try{ CodeNavInfoPanelData.displayName ||= 'CodeNavInfoPanelData' } catch {}