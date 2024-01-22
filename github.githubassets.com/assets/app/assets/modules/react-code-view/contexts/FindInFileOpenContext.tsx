import type React from 'react'
import {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react'

import {useIsCursorEnabled} from '../hooks/use-cursor-navigation'

type FindInFileOpenContextType = {
  findInFileOpen: boolean
  setFindInFileOpen: (open: boolean) => void
}

const FindInFileOpenContext = createContext<FindInFileOpenContextType>({
  findInFileOpen: false,
  setFindInFileOpen: () => undefined,
})

/**
 * This is equivalent to a simple setState, except we save the search state of the find in file panel when it's closed
 * so we can reopen with the last used value
 */
export function FindInFileOpenProvider({
  children,
  searchTerm,
  setSearchTerm,
  isBlame,
}: {
  children: React.ReactNode
  searchTerm: string
  setSearchTerm: (term: string) => void
  isBlame: boolean
}) {
  const cursorEnabled = useIsCursorEnabled(isBlame)
  const lastSearchTerm = useRef<string>('')
  const [findInFileOpen, setRawFindInFileOpen] = useState<boolean>(false)
  const setFindInFileOpen = useCallback(
    (open: boolean) => {
      if (open && searchTerm === '' && lastSearchTerm.current !== '') {
        setSearchTerm(lastSearchTerm.current)
      } else if (!open && searchTerm !== '') {
        lastSearchTerm.current = searchTerm
        setSearchTerm('')
      }

      setRawFindInFileOpen(open)
    },
    [searchTerm, setSearchTerm],
  )

  const contextValue: FindInFileOpenContextType = useMemo(() => {
    return {
      findInFileOpen: cursorEnabled ? false : findInFileOpen,
      setFindInFileOpen,
    }
  }, [findInFileOpen, setFindInFileOpen, cursorEnabled])

  return <FindInFileOpenContext.Provider value={contextValue}>{children}</FindInFileOpenContext.Provider>
}

export function useFindInFileOpen() {
  return useContext(FindInFileOpenContext)
}

try{ FindInFileOpenContext.displayName ||= 'FindInFileOpenContext' } catch {}
try{ FindInFileOpenProvider.displayName ||= 'FindInFileOpenProvider' } catch {}