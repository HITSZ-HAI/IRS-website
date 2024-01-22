import {useCallback, useEffect, useRef} from 'react'

// eslint-disable-next-line no-restricted-imports
import {copyText} from '../../github/command-palette/copy'
import {CopyState, fetchContent, isClipboardSupported} from '../utilities/Copy'
import {useCurrentBlob} from './CurrentBlob'
import {useReposAnalytics} from './use-repos-analytics'

export function useCopyRawBlobContents() {
  const {sendRepoClickEvent} = useReposAnalytics()
  const {rawBlobUrl} = useCurrentBlob()

  const isFirefox = useRef(false)

  useEffect(() => {
    isFirefox.current = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
  }, [])

  return useCallback(async () => {
    sendRepoClickEvent('BLOB_RAW_DROPDOWN.COPY')
    try {
      const blobPromise = fetchContent(rawBlobUrl)
      // Firefox does not support clipboard.write with promises by default (can be overriden by users)
      // But we can use clipboard.writeText instead in the fallback
      // Note: May 2 2023 - Firefox now has a setting that adds the ClipboardItem API
      // Which makes it pass the `isClipboardSupported` check. However, it doesn't support
      // Passing a promise so let's fall back to using copyText instead
      if (
        isClipboardSupported() &&
        navigator &&
        navigator.clipboard &&
        'write' in navigator.clipboard &&
        !isFirefox.current
      ) {
        await navigator.clipboard.write([new ClipboardItem({'text/plain': blobPromise})])
      } else {
        const blob = await blobPromise
        if (!blob) {
          return CopyState.Error
        }
        await copyText(await blob.text())
      }
    } catch (e) {
      return CopyState.Error
    }

    return CopyState.Success
  }, [isFirefox, sendRepoClickEvent, rawBlobUrl])
}
