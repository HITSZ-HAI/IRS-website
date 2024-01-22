import type React from 'react'
import {useCallback, useEffect, useRef} from 'react'

import {useShortcut} from '../hooks/shortcuts'
import {useCopyRawBlobContents} from '../hooks/use-copy-raw-blob-contents'

interface SelectAllShortcutButtonProps {
  containerRef: React.RefObject<HTMLElement> | undefined
  shouldNotOverrideCopy?: boolean
}

/**
 * This component intercepts the select-all shortcut and selects the contents
 * of the given container instead of the contents of the entire document.
 *
 * In addition, it also intercepts the copy shortcut. If the current selection
 * was created through select-all, it will copy the raw blob contents instead
 * of the current selection. This is because when the code blob is virtualized,
 * the current selection will only contain the visible lines.
 */
export default function SelectAllShortcutButton({containerRef, shouldNotOverrideCopy}: SelectAllShortcutButtonProps) {
  const {selectAllShortcut} = useShortcut()
  const allSelected = useRef(false)
  const copyRawBlobContents = useCopyRawBlobContents()

  // If the selection changes while we are listening for this event, then that means the selection is no longer the result of Control+A
  const onSelectionChange = useCallback(() => {
    allSelected.current = false

    document.removeEventListener('selectionchange', onSelectionChange)
  }, [])

  // Clean up the event listener on unmount
  useEffect(() => () => document.removeEventListener('selectionchange', onSelectionChange), [onSelectionChange])

  const selectAll = useCallback(
    (event: React.MouseEvent) => {
      if (containerRef) {
        // If we're not given a container, just let the browser handle the event
        if (!containerRef.current) return

        // Restrict select all to the code blob
        selectAllContentInElement(containerRef.current)
        event.preventDefault()

        allSelected.current = true

        // Any changes to the selection now mean that the selection was not the result of Control+A
        setTimeout(() => document.addEventListener('selectionchange', onSelectionChange), 0)
      }
    },
    [containerRef, onSelectionChange],
  )

  const copyFullFileContents = useCallback(
    (event: Event) => {
      // If the selection didn't come from select-all, let the browser handle the event
      if (!allSelected.current) return

      event.preventDefault()
      copyRawBlobContents()
    },
    [copyRawBlobContents],
  )

  // We cannot use data-hotkey for this. If we do, then regular copy events will not work properly.
  useEffect(() => {
    if (shouldNotOverrideCopy) return
    window.addEventListener('copy', copyFullFileContents)
    return () => window.removeEventListener('copy', copyFullFileContents)
  }, [copyFullFileContents, shouldNotOverrideCopy])

  return <button hidden={true} data-hotkey={selectAllShortcut.hotkey} onClick={selectAll} />
}

function selectAllContentInElement(element: HTMLElement) {
  const range = document.createRange()
  range.selectNode(element)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

try{ SelectAllShortcutButton.displayName ||= 'SelectAllShortcutButton' } catch {}