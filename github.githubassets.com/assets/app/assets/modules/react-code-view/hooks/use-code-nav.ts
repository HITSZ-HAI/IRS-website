import type {CodeNavigationInfo, DefinitionsResult, ReferencesResult} from '@github-ui/code-nav'
import {useEffect, useState} from 'react'

interface CodeNavResults {
  definitions: DefinitionsResult | undefined
  localReferences: ReferencesResult | undefined
  crossReferences: ReferencesResult | undefined
  error: boolean | undefined
}

const emptyResults: CodeNavResults = {
  definitions: undefined,
  localReferences: undefined,
  crossReferences: undefined,
  error: false,
}

export function useCodeNav(codeNavInfo: CodeNavigationInfo, text: string, row: number, column: number): CodeNavResults {
  const [results, setResults] = useState<CodeNavResults>(emptyResults)

  useEffect(() => {
    ;(async () => {
      // Do not send a request if we are not pointing to a valid location
      if (row < 0 || column < 0) return

      // Fetch defs, local refs, and cross refs in parallel.
      // Don't mark loading complete until all 3 have returned.
      const {definitions, localReferences, crossReferences, setLoading} = codeNavInfo.getDefinitionsAndReferences(
        text,
        row,
        column,
      )

      setResults(emptyResults)
      try {
        // Load and show defs first
        const defs = await definitions
        setResults({definitions: defs, localReferences: undefined, crossReferences: undefined, error: false})
        setLoading(false)

        // Then await the others
        const [localRefs, crossRefs] = await Promise.all([localReferences, crossReferences])
        setResults({definitions: defs, localReferences: localRefs, crossReferences: crossRefs, error: false})
      } catch (e) {
        setResults({...emptyResults, error: true})
      } finally {
        setLoading(false)
      }
    })()
  }, [codeNavInfo, text, row, column])

  return results
}
