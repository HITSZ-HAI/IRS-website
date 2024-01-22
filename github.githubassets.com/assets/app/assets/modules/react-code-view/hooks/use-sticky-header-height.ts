import {useEffect, useState} from 'react'

export const stickyHeaderId = 'repos-sticky-header'

// Approximate starting guesses for the sticky header height
const stickyHeaderHeightGuess = 102

const updateStickyHeaderHeightEvent = 'code_view_update_sticky_header_height_event'

let stickyHeaderObserver: ResizeObserver | null = null
let lastTrackedStickyHeader: HTMLDivElement | null = null
let lastTrackedStickyHeaderHeight: number | null = null

// This is a hack to track the height of the sticky header once it loads. This function is called
// when the sticky header is put into the DOM, so we can track its height and send that information
// to other components.
export function trackStickyHeader(stickyHeader: HTMLDivElement | null) {
  if (!stickyHeader || lastTrackedStickyHeader === stickyHeader) {
    return
  }

  lastTrackedStickyHeader = stickyHeader

  if (stickyHeaderObserver === null) {
    stickyHeaderObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.height !== lastTrackedStickyHeaderHeight) {
          lastTrackedStickyHeaderHeight = entry.contentRect.height
          window.dispatchEvent(new CustomEvent(updateStickyHeaderHeightEvent, {detail: entry.contentRect.height}))
        }
      }
    })
  } else {
    stickyHeaderObserver.disconnect()
  }

  stickyHeaderObserver.observe(stickyHeader)
}

export function useStickyHeaderHeight(): number {
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    function handleUpdateStickyHeaderHeight(event: Event) {
      setStickyHeaderHeight((event as CustomEvent).detail)
    }

    window.addEventListener(updateStickyHeaderHeightEvent, handleUpdateStickyHeaderHeight)

    if (lastTrackedStickyHeader) {
      trackStickyHeader(lastTrackedStickyHeader)
    }

    return () => {
      window.removeEventListener(updateStickyHeaderHeightEvent, handleUpdateStickyHeaderHeight)
    }
  }, [])

  if (stickyHeaderHeight !== undefined) {
    return stickyHeaderHeight
  }

  return stickyHeaderHeightGuess
}
