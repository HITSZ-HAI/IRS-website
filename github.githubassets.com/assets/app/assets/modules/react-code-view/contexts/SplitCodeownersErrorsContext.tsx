import type {SplitCodeownersError} from '@github-ui/code-view-types'
import {createContext, useContext} from 'react'

const SplitCodeownersErrorsContext = createContext<SplitCodeownersError[]>([])

export default SplitCodeownersErrorsContext

export function useSplitCodeownersErrorsContext() {
  return useContext(SplitCodeownersErrorsContext)
}

try{ SplitCodeownersErrorsContext.displayName ||= 'SplitCodeownersErrorsContext' } catch {}