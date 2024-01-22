import {onLCP} from 'web-vitals'
import {wasServerRendered} from '@github-ui/ssr-utils'
import {hasFetchedGQL, hasFetchedJS, isReactAlternate, isReactLazyPayload, sendVitals} from './timing-stats'
import {HPCTimingEvent} from './hpc/timing-event'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import type {SoftNavMechanism} from '@github-ui/soft-nav/events'

interface HPCEventTarget extends EventTarget {
  addEventListener(
    type: 'hpc:timing',
    listener: (event: HPCTimingEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions): void
}

// We use an AbortController to cleanup event listeners when we soft navigate.
let abortController = new AbortController()
const INSERTION_TIMEOUT = 10000

function isVisible(element: HTMLElement) {
  // Safari doesn't support `checkVisibility` yet.
  if (typeof element.checkVisibility === 'function') return element.checkVisibility()

  return Boolean(element.offsetParent || element.offsetWidth || element.offsetHeight)
}

function setLCPasHPC(soft: boolean, found: boolean) {
  onLCP(({value}) => {
    window.performance.measure('HPC', {start: 'navigationStart', end: value})
    sendVitals({
      name: 'HPC',
      value,
      soft,
      found,
      gqlFetched: hasFetchedGQL(),
      jsFetched: hasFetchedJS(),
      ssr: wasServerRendered(),
      lazy: isReactLazyPayload(),
      alternate: isReactAlternate(),
      mechanism: 'hard',
    } as HPCTimingEvent)
  })
}

// Restart HPC measurement. This will stop any ongoing HPC calls and start a new timer.
function resetHPC({soft = false, mechanism = 'hard'}: {soft: boolean; mechanism?: SoftNavMechanism | 'hard'}) {
  abortController.abort()
  abortController = new AbortController()

  // Initialize HPC
  const hpcStart = soft ? performance.now() : 0
  const hpc: HPCEventTarget = new EventTarget() as HPCEventTarget
  let tabHidden = false
  let animationFrame: number
  let dataHPCanimationFrame: number

  // Observer to listen to ALL mutations to the DOM. We need to check all added nodes
  // for the `data-hpc` attribue. If none are found, we keep listening until all mutations are done.
  const hpcDOMInsertionObserver = new MutationObserver(mutations => {
    let hasDataHPC = false
    let visibleElement = false

    // if the mutation didn't add any nodes, we don't track its HPC
    if (mutations.every(mutation => mutation.addedNodes.length === 0)) return

    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue

      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue

        if (node.hasAttribute('data-hpc') || node.querySelector('[data-hpc]')) {
          cancelAnimationFrame(animationFrame)
          hasDataHPC = true
          break
        }

        // we only care about visible elements
        if (isVisible(node as HTMLElement)) {
          cancelAnimationFrame(animationFrame)
          visibleElement = true
        }
      }

      if (hasDataHPC) break
    }

    if (hasDataHPC) {
      window.performance.measure('HPC', 'navigationStart')
      // data-hpc found, we can stop listening to mutations.
      hpcDOMInsertionObserver.disconnect()
      // only cancel the animation frame if the controller aborts.
      dataHPCanimationFrame = requestAnimationFrame(() => {
        hpc.dispatchEvent(
          new HPCTimingEvent(
            soft,
            wasServerRendered(),
            isReactLazyPayload(),
            isReactAlternate(),
            mechanism,
            true,
            hasFetchedGQL(),
            hasFetchedJS(),
            hpcStart,
          ),
        )
      })
    } else if (visibleElement) {
      animationFrame = requestAnimationFrame(() => {
        hpc.dispatchEvent(new Event('hpc:dom-insertion'))
      })
    }
  })
  hpcDOMInsertionObserver.observe(document, {childList: true, subtree: true})

  // Stop listening for HPC events if the user has interacted, as interactions
  // can cause DOM mutations, which we want to avoid capturing for HPC.
  const listenerOpts = {capture: true, passive: true, once: true, signal: abortController.signal}
  const stop = () => abortController.abort()

  // eslint-disable-next-line github/require-passive-events
  document.addEventListener('touchstart', stop, listenerOpts)
  document.addEventListener('mousedown', stop, listenerOpts)
  document.addEventListener('keydown', stop, listenerOpts)
  document.addEventListener('pointerdown', stop, listenerOpts)

  let emulatedHPCTimer: ReturnType<typeof setTimeout>
  let insertionFound = false
  hpc.addEventListener(
    'hpc:dom-insertion',
    () => {
      insertionFound = true
      clearTimeout(emulatedHPCTimer)
      // Whenever we see a DOM insertion, we keep track of when it happened.
      const event = new HPCTimingEvent(
        soft,
        wasServerRendered(),
        isReactLazyPayload(),
        isReactAlternate(),
        mechanism,
        false,
        hasFetchedGQL(),
        hasFetchedJS(),
        hpcStart,
      )

      // If no mutations happen after the timeout, we assume that the DOM is fully loaded, so we send the
      // last seen mutation values.
      emulatedHPCTimer = setTimeout(() => hpc.dispatchEvent(event), INSERTION_TIMEOUT)
    },
    {signal: abortController.signal},
  )

  hpc.addEventListener(
    'hpc:timing',
    (e: HPCTimingEvent) => {
      if (!tabHidden && e.value < 60_000) sendVitals(e)

      abortController.abort()
    },
    {signal: abortController.signal},
  )

  // If the stop event is triggered, we want to stop listening to DOM mutations.
  abortController.signal.addEventListener('abort', () => {
    cancelAnimationFrame(dataHPCanimationFrame)
    cancelAnimationFrame(animationFrame)
    clearTimeout(emulatedHPCTimer)
    hpcDOMInsertionObserver.disconnect()
  })

  // If the user changes tab, we don't want to send the recorded metrics since it may send garbage data.
  document.addEventListener(
    'visibilitychange',
    () => {
      tabHidden = true
      abortController.abort()
    },
    {signal: abortController.signal},
  )

  if (!soft) {
    setTimeout(() => {
      if (!insertionFound) setLCPasHPC(soft, false)
    }, INSERTION_TIMEOUT)
  }

  // In a hard-load, if the script is evaluated after the `data-hpc` element is rendered,
  // we default the HPC value to LCP.
  if (!soft && document.querySelector('[data-hpc]')) {
    setLCPasHPC(soft, true)
    abortController.abort()
  }
}

// Any time we trigger a new soft navigation, we want to reset HPC.
document.addEventListener(SOFT_NAV_STATE.START, ({mechanism}) => {
  resetHPC({soft: true, mechanism})
})

// Start HPC at page load.
resetHPC({soft: false})
