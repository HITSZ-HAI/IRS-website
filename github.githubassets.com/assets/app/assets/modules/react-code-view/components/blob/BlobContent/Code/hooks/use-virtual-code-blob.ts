import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useVirtualDynamic, useVirtualWindow, type Virtualizer} from '@github-ui/use-virtual'
import type React from 'react'
import {useMemo} from 'react'
import {defaultRangeExtractor, type Range} from 'react-virtual'

import {useCurrentLineHeight} from '../../../../../hooks/use-current-line-height'

interface VirtualCodeBlobOptions {
  parentRef: React.RefObject<HTMLDivElement>
  lineCount: number
  materializeAllLines: boolean
}

const defaultOverscanAmount = 100
const defaultHeadAndTailLength = 75

export function useVirtualCodeBlob({parentRef, lineCount, materializeAllLines}: VirtualCodeBlobOptions): Virtualizer {
  const currentLineHeight = useCurrentLineHeight('react-code-lines')
  const estimateSize = useMemo(() => () => currentLineHeight, [currentLineHeight])
  const wrapOptionEnabled = useCodeViewOptions().codeWrappingOption.enabled
  const rangeExtractor = useMemo(() => getRangeExtractor(lineCount), [lineCount])

  return useVirtualWindow({
    parentRef,
    size: lineCount,
    overscan: materializeAllLines ? Number.MAX_SAFE_INTEGER : defaultOverscanAmount,
    scrollToFn,
    estimateSize,
    rangeExtractor,
    // We cannot be completely sure of the height of the lines, since some
    // browsers can zoom text in a way that alters it, so always meassure it.
    measureSize: !wrapOptionEnabled ? estimateSize : undefined,
    // Need to use dynamic here because the height of lines can change
    // when 'wrap lines' setting is turned on or when users zoom the text on their page (and only text)
    useVirtualImpl: useVirtualDynamic,
  })
}

function scrollToFn(offset: number) {
  window.scroll({top: offset, left: 0})
}

export function getRangeExtractor(lineCount: number): (range: Range) => number[] {
  return function customRangeExtractor(range: Range) {
    if (lineCount < 2 * defaultHeadAndTailLength) {
      // Render all lines if the total length of the head and tail
      // together would be longer than the length of the file.
      return rangeArray(0, lineCount)
    }

    const indicesInWindow = defaultRangeExtractor(range)
    if (indicesInWindow.length === 0) {
      // This happens sometimes on the first render pass.
      // Just let the virtualization library do its thing on the next render.
      return indicesInWindow
    }

    const minIndexInWindow = indicesInWindow[0]!
    const maxIndexInWindow = indicesInWindow[indicesInWindow.length - 1]!

    const headLength = Math.min(defaultHeadAndTailLength, minIndexInWindow)
    const tailLength = Math.min(defaultHeadAndTailLength, lineCount - maxIndexInWindow)

    const head = rangeArray(0, headLength)
    const tail = rangeArray(lineCount + 1 - tailLength, lineCount)

    return head.concat(indicesInWindow, tail)
  }
}

function rangeArray(min: number, max: number) {
  return new Array(max - min).fill(null).map((_, i) => i + min)
}
