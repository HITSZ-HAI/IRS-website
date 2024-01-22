import {useToastContext} from '@github-ui/toast'
import {useEffect} from 'react'

export function SSRErrorToast() {
  const {addToast} = useToastContext()

  useEffect(() => {
    addToast({
      type: 'error',
      message: 'SSR failed, see console for error details',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

try{ SSRErrorToast.displayName ||= 'SSRErrorToast' } catch {}