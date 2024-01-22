import React from 'react'

const RefreshTreeContext = React.createContext({} as React.MutableRefObject<boolean>)

export function RefreshTreeProvider({
  refreshTree,
  children,
}: React.PropsWithChildren<{refreshTree: React.MutableRefObject<boolean>}>) {
  return <RefreshTreeContext.Provider value={refreshTree}> {children} </RefreshTreeContext.Provider>
}

export function useRefreshTree() {
  return React.useContext(RefreshTreeContext)
}

try{ RefreshTreeContext.displayName ||= 'RefreshTreeContext' } catch {}
try{ RefreshTreeProvider.displayName ||= 'RefreshTreeProvider' } catch {}