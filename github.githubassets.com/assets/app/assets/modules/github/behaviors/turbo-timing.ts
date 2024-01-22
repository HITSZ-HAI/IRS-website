import {microtask} from '@github-ui/eventloop-tasks'
import {sendStats} from '@github-ui/stats'

let lastTurboRequestUrl: string | null = null

// Collect User Timing metrics so we can track time-to-load on turbo actions
const turboMeasure = 'last_turbo_request'
const turboStartMark = 'turbo_start'
const turboEndMark = 'turbo_end'

// Mark turbo start on performance timeline and save url for last turbo request.
function markTurboStart(event: Event) {
  if (!(event instanceof CustomEvent)) return
  if (!event.detail?.url || event.defaultPrevented) return

  window.performance.mark(turboStartMark)
  lastTurboRequestUrl = event.detail.url
}

// Mark turbo end on performance timeline and report results.
async function trackTurboTiming() {
  await microtask()

  if (!window.performance.getEntriesByName(turboStartMark).length) return

  window.performance.mark(turboEndMark)
  window.performance.measure(turboMeasure, turboStartMark, turboEndMark)
  const measures = window.performance.getEntriesByName(turboMeasure)

  const measure = measures.pop()
  const duration = measure ? measure.duration : null
  if (!duration) return

  if (lastTurboRequestUrl) {
    sendStats({
      requestUrl: lastTurboRequestUrl,
      turboDuration: Math.round(duration),
    })
  }
  clearTurboMarks()
}

// Clear turbo marks from performance timeline.
function clearTurboMarks() {
  window.performance.clearMarks(turboStartMark)
  window.performance.clearMarks(turboEndMark)
  window.performance.clearMeasures(turboMeasure)
}

if ('getEntriesByName' in window.performance) {
  document.addEventListener('turbo:before-fetch-request', markTurboStart)
  document.addEventListener('turbo:render', trackTurboTiming)
}
