import type {CodeNavigationInfo, CodeSymbol, DefinitionOrReference} from '@github-ui/code-nav'
import {Box} from '@primer/react'
import {useEffect, useState} from 'react'

import {useFocusSymbolPane} from '../../../../hooks/use-focus-symbol-pane'
import {CodeNavSymbolDetails} from './CodeNavSymbolDetails'
import {CodeNavSymbolNavigation} from './CodeNavSymbolNavigation'

export function CodeNavInfoPanel({
  selectedText,
  showCodeNavWithSymbol,
  lineNumber,
  offset,
  onClose,
  onClear,
  codeNavInfo,
  isLoading,
  setSearchResults,
  setFocusedSearchResult,
  autoFocusSearch,
}: {
  selectedText: string
  lineNumber: number
  offset: number
  onClose: () => void
  onClear: () => void
  showCodeNavWithSymbol: (symbolData: CodeSymbol) => void
  codeNavInfo: CodeNavigationInfo
  isLoading: boolean
  setSearchTerm: (term: string) => void
  setSearchResults: (results: DefinitionOrReference[]) => void
  setFocusedSearchResult: (idx: number | undefined) => void
  autoFocusSearch: boolean
}) {
  function onSymbolSelect(sym: CodeSymbol) {
    showCodeNavWithSymbol(sym)
    setShowSymbolTree(false)
  }

  const [showSymbolTree, setShowSymbolTree] = useState(selectedText ? false : true)
  useFocusSymbolPane(focusSymbolSearch => {
    if (focusSymbolSearch) {
      onClear()
      setShowSymbolTree(true)
      setSearchResults([])
    }
  })

  useEffect(() => {
    if (selectedText) {
      setShowSymbolTree(false)
    } else if (!showSymbolTree) {
      setShowSymbolTree(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedText, codeNavInfo])

  return (
    <Box id="symbols-pane">
      {showSymbolTree ? (
        codeNavInfo ? (
          <CodeNavSymbolNavigation
            treeSymbols={codeNavInfo.symbolTree}
            onSymbolSelect={onSymbolSelect}
            codeSymbols={codeNavInfo.symbols}
            onClose={onClose}
            autoFocusSearch={autoFocusSearch}
          />
        ) : (
          // TODO: Add zero state for when there is no code nav
          <Box>Click on a symbol to see code navigation data</Box>
        )
      ) : (
        <CodeNavSymbolDetails
          codeNavInfo={codeNavInfo}
          selectedText={selectedText}
          lineNumber={lineNumber}
          offset={offset}
          onBackToSymbol={() => {
            onClear()
            setShowSymbolTree(true)
            setSearchResults([])
          }}
          onClose={() => {
            onClose()
            onClear()
            setSearchResults([])
          }}
          onSymbolSelect={onSymbolSelect}
          isLoading={isLoading}
          setSearchResults={setSearchResults}
          setFocusedSearchResult={setFocusedSearchResult}
        />
      )}
    </Box>
  )
}

try{ CodeNavInfoPanel.displayName ||= 'CodeNavInfoPanel' } catch {}