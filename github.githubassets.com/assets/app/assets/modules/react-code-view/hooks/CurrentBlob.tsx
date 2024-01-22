import type {BlobPayload} from '@github-ui/code-view-types'
import React from 'react'

const CurrentBlobContext = React.createContext({} as BlobPayload)

export function CurrentBlobProvider({blob, children}: React.PropsWithChildren<{blob: BlobPayload}>) {
  return <CurrentBlobContext.Provider value={blob}> {children} </CurrentBlobContext.Provider>
}

export function useCurrentBlob() {
  return React.useContext(CurrentBlobContext)
}

try{ CurrentBlobContext.displayName ||= 'CurrentBlobContext' } catch {}
try{ CurrentBlobProvider.displayName ||= 'CurrentBlobProvider' } catch {}