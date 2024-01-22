import {useEffect, useRef} from 'react'

const scrollLineIntoViewEvent = 'react_blob_view_scroll_line_into_view'

export function useScrollLineIntoView(callback: (payload: ScrollRequestPayload) => void) {
  const eventHandler = useRef(callback)

  useEffect(() => {
    eventHandler.current = callback
  }, [callback])

  useEffect(() => {
    const handleScrollEvent = (event: CustomEvent<ScrollRequestPayload>) => eventHandler.current(event.detail)
    window.addEventListener(scrollLineIntoViewEvent, handleScrollEvent as unknown as EventListener)
    return () => {
      window.removeEventListener(scrollLineIntoViewEvent, handleScrollEvent as unknown as EventListener)
    }
  }, [])
}

export interface ScrollRequestPayload {
  line: number
  column?: number
}
export function scrollLineIntoView(payload: ScrollRequestPayload) {
  window.dispatchEvent(new CustomEvent<ScrollRequestPayload>(scrollLineIntoViewEvent, {detail: payload}))
}
