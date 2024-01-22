import {useToastContext} from '@github-ui/toast'
import {useCallback} from 'react'

export function useRefCreateErrorHandling() {
  const {addToast} = useToastContext()

  return useCallback((error: string) => addToast({type: 'error', message: error}), [addToast])
}
