import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {useCallback, useEffect, useMemo, useRef} from 'react'

import type {CodeLineData} from '../components/blob/BlobContent/Code/hooks/use-code-lines'
import {useAddValueToLineElementMap, useGetValueFromLineElementMap} from './CurrentLineRefMap'
import type {SetStickyLinesType} from './use-sticky-lines'

/***
 * This interface adds two properties to an intersection observer that we need in order to track
 * whether or not we already have started to observe a line and whether or not we have disconnected it previously.
 * We use those values to make sure we don't observe a previously disconnected rogue observer, and so that we don't
 * start observing on the same line multiple times.
 */
interface intersectionObserverWithMetadata extends IntersectionObserver {
  hasBeenDisconnected: boolean
  hasBeenObserved: boolean
}

export function useCodeLineIntersectionObservers(
  codeLineData: CodeLineData,
  canDoStickyLines: boolean,
  stickyHeaderHeight: number,
  onLineStickOrUnstick: SetStickyLinesType,
  numParents: number | undefined,
) {
  const observedElementRef = useRef<Element | null>(null)
  const addValueToMap = useAddValueToLineElementMap()
  const isSSR = !!(typeof ssrSafeDocument === 'undefined')

  const getValueFromMap = useGetValueFromLineElementMap()

  const observer = useMemo(() => {
    const {isEndLine, isStartLine, lineNumber} = codeLineData
    let previousY = 0
    let previousRatio = 1
    const endObserver =
      isEndLine && !isSSR
        ? new IntersectionObserver(
            entries => {
              for (const {target, isIntersecting, intersectionRatio} of entries) {
                if (target) {
                  const {currentY, currentRatio} = endObserverLogic(
                    previousY,
                    previousRatio,
                    target,
                    intersectionRatio,
                    lineNumber,
                    getValueFromMap,
                    isIntersecting,
                    onLineStickOrUnstick,
                  )

                  previousY = currentY
                  previousRatio = currentRatio
                }
              }
            },
            {
              root: null,
              rootMargin: `-${stickyHeaderHeight}px 0px 0px 0px`,
              threshold: 0,
            },
          )
        : undefined
    const startObserver =
      isStartLine && !isSSR
        ? new IntersectionObserver(
            entries => {
              for (const {target, isIntersecting, intersectionRatio} of entries) {
                if (target) {
                  const {currentY, currentRatio} = startObserverLogic(
                    codeLineData,
                    previousY,
                    previousRatio,
                    target,
                    intersectionRatio,
                    isIntersecting,
                    onLineStickOrUnstick,
                  )

                  previousY = currentY
                  previousRatio = currentRatio
                }
              }
            },
            {
              root: null,
              //we need to have the intersection for any line that is contained within a section that already has at least
              //one line stickied be offset by an additional 20px for each parent because that is the height of each sticky line
              rootMargin: `-${stickyHeaderHeight + (numParents ? numParents * 20 : 0)}px 0px 0px 0px`,
              //when the threshold is passed an array of values, it triggers at each intersection threshold value.
              //this allows us to have the intersection observer trigger at the appropriate time no matter how much
              //of the element is hidden behind horizontal scrolling
              threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            },
          )
        : undefined

    const initialObsValue = (
      canDoStickyLines ? (isStartLine ? startObserver : isEndLine ? endObserver : undefined) : undefined
    ) as intersectionObserverWithMetadata | undefined
    if (initialObsValue) {
      initialObsValue.hasBeenDisconnected = false
      initialObsValue.hasBeenObserved = false
    }
    return initialObsValue
  }, [codeLineData, canDoStickyLines, stickyHeaderHeight, getValueFromMap, onLineStickOrUnstick, numParents, isSSR])

  const refObserverCallback = useCallback((ref: HTMLTableRowElement | null) => {
    observedElementRef.current = ref
  }, [])

  /*
    This effect is used because we have no guarantee on the timing of when the ref callback will be called for a given
    code blob line, and as such moving the observe logic to an effect that we can guarantee when it runs allows us to
    consistently observe the correct element and clean up elements that we don't want to observe anymore. Now that
    we are not observing from within every ref callback, there aren't several rogue observers out there observing on
    elements that have completely different contents (but technically still exist because they are never being overwritten,
    just the content within the element is being changed)

  */
  useEffect(() => {
    const {isStartLine, lineNumber, ownedSection} = codeLineData

    if (
      isStartLine &&
      observedElementRef &&
      ownedSection &&
      observer &&
      !observer.hasBeenObserved &&
      !observer.hasBeenDisconnected
    ) {
      addValueToMap(ownedSection.endLine, {
        lineNumber,
      })
    }

    if (observer && observedElementRef.current && !observer.hasBeenObserved) {
      observer.observe(observedElementRef.current)

      observer.hasBeenObserved = true
    }

    return () => {
      if (observer) {
        observer.disconnect()
        observer.hasBeenDisconnected = true
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observer, codeLineData])

  return refObserverCallback
}

function endObserverLogic(
  previousY: number,
  previousRatio: number,
  target: Element,
  intersectionRatio: number,
  lineNumber: number,
  getValueFromMap: (num: number) => CodeLineData[] | undefined,
  isIntersecting: boolean,
  onLineStickOrUnstick: SetStickyLinesType,
) {
  const currentY = target.getBoundingClientRect().y
  const currentRatio = intersectionRatio
  const startLineArray = lineNumber ? getValueFromMap(lineNumber) : undefined
  const lineIsAboveBottomOfScreen = window.innerHeight - target.getBoundingClientRect().bottom > 0
  const lineIsBelowTopOfScreen = target.getBoundingClientRect().bottom > 0
  const lineIsCloseToTopOfScreen = target.getBoundingClientRect().top < 150
  const lineIsOnScreen = lineIsAboveBottomOfScreen && lineIsBelowTopOfScreen
  const isNotNearBottomOfScreen =
    window.innerHeight - target.getBoundingClientRect().bottom > 150 && window.innerHeight > 300
  for (const startLine of startLineArray || []) {
    if (startLine && lineIsOnScreen) {
      if (currentY < previousY && lineIsOnScreen) {
        if (currentRatio > previousRatio && isIntersecting) {
          //scrolling down and entering the screen
          //do nothing
        } else {
          //scrolling down and leaving the screen
          onLineStickOrUnstick(startLine, true)
        }
      } else if (currentY > previousY && isIntersecting) {
        if (currentRatio < previousRatio) {
          //scrolling up and leaving the screen
          //do nothing
        } else if (isNotNearBottomOfScreen && lineIsCloseToTopOfScreen) {
          //scrolling up and entering the screen
          onLineStickOrUnstick(startLine, false)
        }
      }
    }
  }

  return {currentY, currentRatio}
}

function startObserverLogic(
  codeLineData: CodeLineData,
  previousY: number,
  previousRatio: number,
  target: Element,
  intersectionRatio: number,
  isIntersecting: boolean,
  onLineStickOrUnstick: SetStickyLinesType,
) {
  const currentY = target.getBoundingClientRect().y
  const currentRatio = intersectionRatio
  const lineIsAboveBottomOfScreen = window.innerHeight - target.getBoundingClientRect().bottom > 0
  const lineIsBelowTopOfScreen = target.getBoundingClientRect().bottom > 0
  const lineIsCloseToTopOfScreen = target.getBoundingClientRect().top < 150 && target.getBoundingClientRect().top > -300
  const lineIsOnScreen = lineIsAboveBottomOfScreen && lineIsBelowTopOfScreen
  const lineIsNotDisplayed =
    target.getBoundingClientRect().bottom === 0 &&
    target.getBoundingClientRect().top === 0 &&
    target.getBoundingClientRect().height === 0 &&
    target.getBoundingClientRect().width === 0 &&
    target.getBoundingClientRect().x === 0 &&
    target.getBoundingClientRect().y === 0

  if (!codeLineData.ownedSection || codeLineData.ownedSection?.collapsed) {
    return {currentY, currentRatio}
  }
  //we don't want to apply sticky if the start line's owned section is collapsed
  if (currentY <= previousY && (lineIsOnScreen || lineIsCloseToTopOfScreen) && !lineIsNotDisplayed) {
    if (currentRatio > previousRatio && isIntersecting) {
      //scrolling down and entering the screen
      //do nothing
    } else if (lineIsCloseToTopOfScreen) {
      //scrolling down and leaving the screen
      onLineStickOrUnstick(codeLineData, false)
    }
  } else if (currentY > previousY && isIntersecting) {
    if (currentRatio < previousRatio) {
      //scrolling up and leaving the screen
      //do nothing
    } else {
      //scrolling up and entering the screen
      onLineStickOrUnstick(codeLineData, true)
    }
  }

  return {currentY, currentRatio}
}
