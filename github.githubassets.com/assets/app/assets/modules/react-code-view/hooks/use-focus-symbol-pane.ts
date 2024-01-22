import {useEffect, useRef} from 'react'

const focusSymbolPaneEvent = 'react_blob_view_focus_symbol_pane'

export function useFocusSymbolPane(callback: (focusSymbolSearch: boolean) => void) {
  const eventHandler = useRef(callback)

  useEffect(() => {
    eventHandler.current = callback
  }, [callback])

  useEffect(() => {
    const handleScrollEvent = (e: Event) => {
      callback((e as CustomEvent).detail?.focusSymbolSearch || false)
    }
    window.addEventListener(focusSymbolPaneEvent, handleScrollEvent)
    return () => {
      window.removeEventListener(focusSymbolPaneEvent, handleScrollEvent)
    }
  }, [callback])
}

export function focusSymbolPane() {
  window.dispatchEvent(new CustomEvent(focusSymbolPaneEvent))
}

export function focusSymbolSearch() {
  window.dispatchEvent(new CustomEvent(focusSymbolPaneEvent, {detail: {focusSymbolSearch: true}}))
}
