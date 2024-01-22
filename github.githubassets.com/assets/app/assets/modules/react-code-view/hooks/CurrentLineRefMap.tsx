import React, {useCallback} from 'react'

import type {CodeLineData} from '../components/blob/BlobContent/Code/hooks/use-code-lines'
import {useCurrentBlame} from './CurrentBlame'
import {useCurrentBlob} from './CurrentBlob'

const CurrentLineRefMapContext = React.createContext<Map<number, CodeLineData[]> | null>(null)

export function CurrentLineRefMapProvider({children}: React.PropsWithChildren<unknown>) {
  const blob = useCurrentBlob()
  const blame = useCurrentBlame()
  //We only want to refresh the map to an empty map whenever we have a new blob or blame being loaded, hence the
  //blob/blame only dep array
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const map = React.useMemo(() => (blame ? null : new Map<number, CodeLineData[]>()), [blob, blame])
  return <CurrentLineRefMapContext.Provider value={map}> {children} </CurrentLineRefMapContext.Provider>
}

export function useLineElementMap() {
  return React.useContext(CurrentLineRefMapContext)
}

export function useGetValueFromLineElementMap() {
  const map = React.useContext(CurrentLineRefMapContext)
  return useCallback((num: number) => map?.get(num), [map])
}

export function useAddValueToLineElementMap() {
  const map = React.useContext(CurrentLineRefMapContext)
  return useCallback(
    (num: number, elem: CodeLineData) => {
      if (!map) return
      if (map.has(num)) {
        map.get(num)?.push(elem)
      } else {
        map.set(num, [elem])
      }
    },
    [map],
  )
}

try{ CurrentLineRefMapContext.displayName ||= 'CurrentLineRefMapContext' } catch {}
try{ CurrentLineRefMapProvider.displayName ||= 'CurrentLineRefMapProvider' } catch {}