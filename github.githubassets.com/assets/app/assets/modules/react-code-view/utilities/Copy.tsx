import {AlertIcon, CheckIcon, CopyIcon} from '@primer/octicons-react'
import {Octicon, Spinner} from '@primer/react'
import type React from 'react'

export enum CopyState {
  Idle,
  Fetching,
  Success,
  Error,
}

export function isClipboardSupported(): boolean {
  const hasClipboardApi = 'clipboard' in navigator
  const hasClipboardItem = typeof ClipboardItem !== 'undefined'

  return hasClipboardApi && hasClipboardItem
}

export async function fetchContent(url: string) {
  const res = await fetch(url, {method: 'get'})

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }

  const text = (await res.text()).replace(/\r?\n$/, '')

  return new Blob([text], {type: 'text/plain'})
}

interface CopyStateUI {
  ariaLabel: string
  content: React.ReactNode
}

/**
 * Get common UI for the button and action item based on the current state.
 */
export function getCopyStateUI(state: CopyState): CopyStateUI {
  let ariaLabel
  let content

  switch (state) {
    case CopyState.Success:
      ariaLabel = 'Copied!'
      content = <Octicon icon={CheckIcon} />
      break
    case CopyState.Fetching:
      ariaLabel = 'Copying'
      content = <Spinner size="small" />
      break
    case CopyState.Error:
      ariaLabel = 'Something went wrong. Try again.'
      content = <Octicon icon={AlertIcon} />
      break
    default:
      ariaLabel = 'Copy'
      content = <Octicon icon={CopyIcon} />
  }

  return {ariaLabel, content}
}
