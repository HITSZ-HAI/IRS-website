import {debounce} from '@github/mini-throttle'
import {getCurrentSize, ScreenSize} from '@github-ui/screen-size'
import type React from 'react'
import {createContext, useContext, useEffect, useState} from 'react'

const ContentSizeContext = createContext<ScreenSize>(ScreenSize.small)

export function ContentSizeProvider({
  children,
  initialValue,
  contentRef,
}: {
  children: React.ReactNode
  contentRef: HTMLElement | null
  initialValue?: ScreenSize
}) {
  const [size, setSize] = useState(initialValue || ScreenSize.large)

  useEffect(() => {
    if (!contentRef) {
      return
    }

    setSize(getCurrentSize(contentRef.offsetWidth))

    const resizeObserver = new ResizeObserver(
      debounce(() => {
        setSize(getCurrentSize(contentRef.offsetWidth))
      }),
    )
    resizeObserver.observe(contentRef)

    return () => resizeObserver.disconnect()
  }, [setSize, contentRef])

  return <ContentSizeContext.Provider value={size}>{children}</ContentSizeContext.Provider>
}

export function useContentSize() {
  return useContext(ContentSizeContext)
}

try{ ContentSizeContext.displayName ||= 'ContentSizeContext' } catch {}
try{ ContentSizeProvider.displayName ||= 'ContentSizeProvider' } catch {}