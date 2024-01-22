import React, {useCallback, useEffect, useState} from 'react'

export function useStickyObserver(elementRef: React.RefObject<HTMLDivElement>): boolean {
  const [isStickied, setIsStickied] = useState(false)
  const stickyCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // There can be multiple entries if the user scrolled down and up quickly.
      // Just respond to the last one.
      const e = entries[entries.length - 1]
      // Less than 1 means some portion of the element is scrolled out of view
      // With top: -1px we expect this to be < 1 when the element is stuck.
      const isIntersecting = e!.intersectionRatio < 1
      if (isIntersecting !== isStickied) {
        setIsStickied(isIntersecting)
      }
    },
    [isStickied, setIsStickied],
  )

  useEffect(() => {
    const element = elementRef.current
    const options = {threshold: [1], rootMargin: '-1px 0px 0px 0px'}

    const observer = new IntersectionObserver(stickyCallback, options)

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [elementRef, stickyCallback])

  return isStickied
}

export function useStickyHeaderSx(): Record<string, unknown> | undefined {
  // TODO: set this to be a setting in the more file options menu
  const shouldUseStickyHeaders = true
  const stickySx = React.useMemo(() => {
    return shouldUseStickyHeaders
      ? {
          top: '0px',
          zIndex: 1,
          background: 'var(--bgColor-default, var(--color-canvas-default))',
          position: shouldUseStickyHeaders ? 'sticky' : undefined,
        }
      : undefined
  }, [shouldUseStickyHeaders])

  return stickySx
}
