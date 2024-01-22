import type {DefinitionOrReference} from '@github-ui/code-nav'
import {ObservableMap, ObservableValue} from '@github-ui/observable'
import {useDerivedObservable, useObservableMap, useObservableValue, useObservedState} from '@github-ui/react-observable'
import type React from 'react'
import {createContext, useContext, useEffect, useMemo} from 'react'

const SearchResultsContext = createContext<{
  resultsByLineNumber: ObservableMap<number, DefinitionOrReference[]>
  focusedResult: ObservableValue<DefinitionOrReference | undefined>
}>({
  resultsByLineNumber: new ObservableMap(),
  focusedResult: new ObservableValue<DefinitionOrReference | undefined>(undefined),
})

export function SearchResultsProvider({
  searchResults,
  focusedSearchResult,
  children,
}: React.PropsWithChildren<{
  searchResults: DefinitionOrReference[]
  focusedSearchResult: number | undefined
}>) {
  const resultsByLineNumber = useObservableMap<number, DefinitionOrReference[]>()
  const focusedResult = useObservableValue(
    focusedSearchResult !== undefined ? searchResults[focusedSearchResult] : undefined,
  )

  useEffect(() => {
    // Build up the new map separately so that we don't fire too many updates
    const newMap = new Map<number, DefinitionOrReference[]>()
    for (const searchResult of searchResults) {
      const lineNumber = searchResult.lineNumber

      if (newMap.has(lineNumber)) {
        newMap.get(lineNumber)!.push(searchResult)
      } else {
        newMap.set(lineNumber, [searchResult])
      }
    }

    // Update the observable map
    resultsByLineNumber.clear()
    for (const [lineNumber, resultsForLine] of newMap) {
      resultsByLineNumber.set(lineNumber, resultsForLine)
    }
  }, [resultsByLineNumber, searchResults])

  useEffect(() => {
    focusedResult.value = focusedSearchResult !== undefined ? searchResults[focusedSearchResult] : undefined
  }, [searchResults, focusedResult, focusedSearchResult])

  const contextValue = useMemo(() => ({resultsByLineNumber, focusedResult}), [resultsByLineNumber, focusedResult])

  return <SearchResultsContext.Provider value={contextValue}>{children}</SearchResultsContext.Provider>
}

export function useSearchResults(lineNumber: number): DefinitionOrReference[] | undefined {
  const {resultsByLineNumber} = useContext(SearchResultsContext)
  return useObservedState(resultsByLineNumber.get(lineNumber))
}

export function useFocusedSearchResult(lineNumber: number): DefinitionOrReference | undefined {
  const {focusedResult} = useContext(SearchResultsContext)
  const focusedResultForLine = useDerivedObservable(focusedResult, result =>
    result?.lineNumber === lineNumber ? result : undefined,
  )
  return useObservedState(focusedResultForLine)
}

export function useFocusedSearchResultWithoutLineCheck(): DefinitionOrReference | undefined {
  const {focusedResult} = useContext(SearchResultsContext)
  return useObservedState(focusedResult)
}

try{ SearchResultsProvider.displayName ||= 'SearchResultsProvider' } catch {}