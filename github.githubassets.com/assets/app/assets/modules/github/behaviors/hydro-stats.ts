import {sendEvent} from '@github-ui/hydro-analytics'
import {loaded} from '@github-ui/document-ready'

const vitalsToHydro = ['fcp', 'lcp', 'fid', 'inp', 'cls', 'hpc', 'ttfb'] as const

interface HydroStat {
  react?: boolean
  reactApp?: string | null
  reactPartials?: string[]
  hpcMechanism?: PlatformBrowserSoftNavigationMechanism
  ssr?: boolean
  hpcSoft?: boolean
  hpc?: string
  ttfb?: string
  fcp?: string
  lcp?: string
  fid?: string
  inp?: string
  cls?: string
}

let queued: HydroStat | undefined

/**
 * Batched report of vital to hydro
 */
export function sendStatToHydro(stat: PlatformBrowserPerformanceWebVitalTiming) {
  let hydroStat: HydroStat | undefined

  if (!document.querySelector('[data-hydrostats="publish"]')) return

  for (const vital of vitalsToHydro) {
    if (stat[vital] !== undefined && stat[vital]! < 60_000) {
      if (!hydroStat) {
        const reactApp = document.querySelector('react-app')
        hydroStat = queueStat()
        hydroStat.react = !!reactApp
        hydroStat.reactApp = reactApp?.getAttribute('app-name')
        // Convert to Set and back to Array to remove duplicates.
        hydroStat.reactPartials = [
          ...new Set(
            Array.from(document.querySelectorAll('react-partial')).map(
              partial => partial.getAttribute('partial-name') || '',
            ),
          ),
        ]
        hydroStat.ssr = stat.ssr
      }
      hydroStat[vital] = stat[vital]!.toPrecision(6)
      if (vital === 'hpc') {
        hydroStat.hpcMechanism = stat.mechanism
        hydroStat.hpcSoft = stat.soft
      }
      break
    }
  }
}

/**
 * Create a new stat object and schedule it to be sent to hydro
 */
function queueStat(): HydroStat {
  if (!queued) {
    queued = {}
    scheduleSend()
  }
  return queued
}

/**
 * Schedule a send to hydro
 */
async function scheduleSend() {
  await loaded
  // eslint-disable-next-line compat/compat
  window.requestIdleCallback(send)
}

/**
 * Send the queued event to hydro
 */
function send() {
  sendEvent('web-vital', queued as Record<string, string | number | boolean | null | undefined>)
  queued = undefined
}
