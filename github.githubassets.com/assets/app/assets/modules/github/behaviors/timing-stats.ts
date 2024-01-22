import {onCLS, onFCP, onFID, onLCP, onTTFB, onINP} from 'web-vitals'
import type {Metric} from 'web-vitals'
import {loaded} from '@github-ui/document-ready'
import {wasServerRendered} from '@github-ui/ssr-utils'
import {sendStats} from '@github-ui/stats'
import type {HPCTimingEvent} from './hpc/timing-event'
import {sendStatToHydro} from './hydro-stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {getCurrentReactAppName} from '@github-ui/soft-nav/utils'
import {MECHANISM_MAPPING} from '@github-ui/soft-nav/stats'

type MetricOrHPC = Metric | HPCTimingEvent
const initialRenderIsSSR = wasServerRendered()
const initialRenderIsLazy = isReactLazyPayload()
const initialRenderIsAlternate = isReactAlternate()

interface NetworkInformation extends EventTarget {
  readonly effectiveType: string
}

export function isReactLazyPayload() {
  return Boolean(document.querySelector('react-app[data-lazy="true"]'))
}

export function isReactAlternate() {
  return Boolean(document.querySelector('react-app[data-alternate="true"]'))
}

export function isHeaderRedesign() {
  return Boolean(document.querySelector('header.AppHeader'))
}

export function hasFetchedGQL(): boolean {
  return performance.getEntriesByType('resource').some(e => e.initiatorType === 'fetch' && e.name.includes('_graphql?'))
}

export function hasFetchedJS(): boolean {
  return performance.getEntriesByType('resource').some(e => e.initiatorType === 'script')
}

export function sendVitals(metric: MetricOrHPC) {
  const {name, value} = metric
  const stat: PlatformBrowserPerformanceWebVitalTiming = {
    name: window.location.href,
    app: getCurrentReactAppName() || 'rails',
  }
  stat[name.toLowerCase() as Lowercase<typeof name>] = value

  if (isFeatureEnabled('SAMPLE_NETWORK_CONN_TYPE')) {
    stat.networkConnType = getConnectionType()
  }

  if (name === 'HPC') {
    stat.soft = metric.soft
    stat.ssr = metric.ssr
    stat.mechanism = MECHANISM_MAPPING[metric.mechanism]
    stat.lazy = metric.lazy
    stat.alternate = metric.alternate
    stat.hpcFound = metric.found
    stat.hpcGqlFetched = metric.gqlFetched
    stat.hpcJsFetched = metric.jsFetched
    stat.headerRedesign = isHeaderRedesign()
  } else {
    stat.ssr = initialRenderIsSSR
    stat.lazy = initialRenderIsLazy
    stat.alternate = initialRenderIsAlternate
  }

  const syntheticTest = document.querySelector('meta[name="synthetic-test"]')
  if (syntheticTest) {
    stat.synthetic = true
  }

  sendStats({webVitalTimings: [stat]})

  sendStatToHydro(stat)

  updateStaffBar(name, value)
}

function updateStaffBar(name: string, value: number) {
  const staffBarContainer = document.querySelector('#staff-bar-web-vitals')
  const metricContainer = staffBarContainer?.querySelector(`[data-metric=${name.toLowerCase()}]`)

  if (!metricContainer) {
    return
  }

  metricContainer.textContent = value.toPrecision(6)
}

function isTimingSuppported(): boolean {
  return !!(window.performance && window.performance.timing && window.performance.getEntriesByType)
}

function getConnectionType() {
  if ('connection' in navigator) {
    return (navigator.connection as NetworkInformation).effectiveType
  }

  return 'N/A'
}

async function sendTimingResults() {
  if (!isTimingSuppported()) return

  await loaded
  await new Promise(resolve => setTimeout(resolve))

  sendResourceTimings()
  sendNavigationTimings()
}

const sendResourceTimings = () => {
  const resourceTimings = window.performance
    .getEntriesByType('resource')

    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (timing: any): PlatformBrowserPerformanceNavigationTiming => ({
        name: timing.name,
        entryType: timing.entryType,
        startTime: timing.startTime,
        duration: timing.duration,
        initiatorType: timing.initiatorType,
        nextHopProtocol: timing.nextHopProtocol,
        workerStart: timing.workerStart,

        workerTiming: (timing.workerTiming || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (workerTiming: any): PlatformBrowserPerformanceWorkerTiming => ({
            duration: workerTiming.duration,
            startTime: workerTiming.startTime,
            name: workerTiming.name,
            entryType: workerTiming.entryType,
          }),
        ),

        serverTiming: (timing.serverTiming || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (serverTiming: any): PlatformBrowserPerformanceServerTiming => ({
            duration: serverTiming.duration,
            description: serverTiming.description,
            name: serverTiming.name,
          }),
        ),
        redirectStart: timing.redirectStart,
        redirectEnd: timing.redirectEnd,
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        transferSize: timing.transferSize,
        encodedBodySize: timing.encodedBodySize,
        decodedBodySize: timing.decodedBodySize,
      }),
    )

  if (resourceTimings.length) {
    sendStats({resourceTimings})
  }
}

const sendNavigationTimings = () => {
  const navigationTimings = window.performance
    .getEntriesByType('navigation')

    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (timing: any): PlatformBrowserPerformanceNavigationTiming => ({
        activationStart: timing.activationStart,
        name: timing.name,
        entryType: timing.entryType,
        startTime: timing.startTime,
        duration: timing.duration,
        initiatorType: timing.initiatorType,
        nextHopProtocol: timing.nextHopProtocol,
        workerStart: timing.workerStart,
        workerTiming: (timing.workerTiming || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (workerTiming: any): PlatformBrowserPerformanceWorkerTiming => ({
            duration: workerTiming.duration,
            startTime: workerTiming.startTime,
            name: workerTiming.name,
            entryType: workerTiming.entryType,
          }),
        ),

        serverTiming: (timing.serverTiming || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (serverTiming: any): PlatformBrowserPerformanceServerTiming => ({
            duration: serverTiming.duration,
            description: serverTiming.description,
            name: serverTiming.name,
          }),
        ),
        redirectStart: timing.redirectStart,
        redirectEnd: timing.redirectEnd,
        fetchStart: timing.fetchStart,
        domainLookupStart: timing.domainLookupStart,
        domainLookupEnd: timing.domainLookupEnd,
        connectStart: timing.connectStart,
        connectEnd: timing.connectEnd,
        secureConnectionStart: timing.secureConnectionStart,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        transferSize: timing.transferSize,
        encodedBodySize: timing.encodedBodySize,
        decodedBodySize: timing.decodedBodySize,
        unloadEventStart: timing.unloadEventStart,
        unloadEventEnd: timing.unloadEventEnd,
        domInteractive: timing.domInteractive,
        domContentLoadedEventStart: timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        domComplete: timing.domComplete,
        loadEventStart: timing.loadEventStart,
        loadEventEnd: timing.loadEventEnd,
        type: timing.type,
        redirectCount: timing.redirectCount,
      }),
    )

  if (navigationTimings.length) {
    sendStats({navigationTimings})
  }
}

sendTimingResults()
onCLS(sendVitals)
onFCP(sendVitals)
onFID(sendVitals)
onLCP(sendVitals)
onTTFB(sendVitals)
onINP(sendVitals)
