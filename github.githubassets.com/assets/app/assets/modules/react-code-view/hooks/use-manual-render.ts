import {useCallback, useState} from 'react'

export function useManualRender() {
  //we don't care about the value of the state, it is purely used to trigger a re-render
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setState] = useState({})
  // Triggers a re-render because the object literal will be a new object every time
  return useCallback(() => setState({}), [])
}
