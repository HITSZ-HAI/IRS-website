import type {Blame} from '@github-ui/code-view-types'
import React from 'react'

const CurrentBlameContext = React.createContext<Blame | undefined>(undefined)

export function CurrentBlameProvider({blame, children}: React.PropsWithChildren<{blame: Blame | undefined}>) {
  return <CurrentBlameContext.Provider value={blame}> {children} </CurrentBlameContext.Provider>
}

export function useCurrentBlame(): Blame | undefined {
  return React.useContext(CurrentBlameContext)
}

try{ CurrentBlameContext.displayName ||= 'CurrentBlameContext' } catch {}
try{ CurrentBlameProvider.displayName ||= 'CurrentBlameProvider' } catch {}