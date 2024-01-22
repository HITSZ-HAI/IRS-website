import {ObservableValue} from '@github-ui/observable'
import {useDerivedObservable, useObservableValue, useObservedState} from '@github-ui/react-observable'
import React, {useEffect} from 'react'

// eslint-disable-next-line no-restricted-imports
import type {BlobRange} from '../../../../../github/blob-anchor'

const HighlightedLineContext = React.createContext<ObservableValue<BlobRange | undefined>>(
  new ObservableValue<BlobRange | undefined>(undefined),
)

export function HighlightedLinesProvider({
  highlightedLines,
  children,
}: React.PropsWithChildren<{highlightedLines: BlobRange | undefined}>) {
  const highlight = useObservableValue(highlightedLines)

  useEffect(() => {
    highlight.value = highlightedLines
  }, [highlight, highlightedLines])

  return <HighlightedLineContext.Provider value={highlight}>{children}</HighlightedLineContext.Provider>
}

export function useHighlightedLinesInfo(lineNumber: number) {
  const highlight = React.useContext(HighlightedLineContext)

  const highlightForLine = useDerivedObservable(highlight, h =>
    h && lineNumber >= h.start.line && lineNumber <= h.end.line ? h : undefined,
  )

  return useObservedState(highlightForLine)
}

try{ HighlightedLineContext.displayName ||= 'HighlightedLineContext' } catch {}
try{ HighlightedLinesProvider.displayName ||= 'HighlightedLinesProvider' } catch {}