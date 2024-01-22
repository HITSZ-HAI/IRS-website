import {debounce} from '@github/mini-throttle'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useRef, useState} from 'react'
// useLocation is safe for files not rendered in a partial on the overview.
// eslint-disable-next-line no-restricted-imports
import {useLocation} from 'react-router-dom'

export function useCurrentLineHeight(lineContainerID: string, defaultLineHeight: number = 20) {
  const [lineHeight, setLineHeight] = useState(defaultLineHeight)

  const previousLineHeight = useRef(defaultLineHeight)

  const wrapOption = useCodeViewOptions().codeWrappingOption

  const location = useLocation()

  useLayoutEffect(() => {
    //apologies for this ridiculous hack, but because in firefox there is an option to zoom ONLY text, and not elements
    //themselves, we needed a piece of text which was always going to be present within the DOM, and the title
    //of the current code blob made sense as the thing for us to use. If someone ever changes the ID of that piece
    //of code, however, this will fail.
    const fileNameText = document.getElementById('file-name-id-wide')

    if (!fileNameText) return

    const resizeObserver = new ResizeObserver(
      debounce(() => {
        const detectedLineHeight =
          (document.getElementsByClassName(lineContainerID)[0]?.firstChild as Element)?.getBoundingClientRect()
            .height ?? defaultLineHeight

        //if word wrap is enabled, we don't want to blanket set the heigh for all lines because it will probably be
        //incorrect for the majority of lines. Defaulting to 20 lets the useVirtualDynamic actually figure out what
        //the heights should be.
        if (detectedLineHeight !== 0 && detectedLineHeight !== previousLineHeight.current && !wrapOption.enabled) {
          setLineHeight(detectedLineHeight)
          previousLineHeight.current = detectedLineHeight
        }
      }),
    )
    resizeObserver.observe(fileNameText)

    return () => resizeObserver.disconnect()
  }, [location.key, wrapOption.enabled, lineContainerID, defaultLineHeight])

  return lineHeight
}
