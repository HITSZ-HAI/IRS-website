import type {Context} from '@github/hydro-analytics-client'
import {sendEvent} from '@github-ui/hydro-analytics'

type EventName = 'menu-activation' | 'menu-deactivation' | 'click' | 'query' | 'search'

let currentEventContext: Context = {}

export function trackSelection(anchor: Element): void {
  const targetType = anchor.getAttribute('data-target-type')!

  if (targetType === 'Search') {
    const form = document.querySelector<HTMLFormElement>('.js-site-search-form')!
    const scopeType = form.getAttribute('data-scope-type')
    const itemType = anchor.getAttribute('data-item-type')

    if (scopeType) {
      updateCurrentEventPayload({
        scope_id: parseInt(form.getAttribute('data-scope-id') || '').toString(),
        scope_type: scopeType,
        target_scope: itemType || '',
      })
    }
    trackJumpToEvent('search')
  } else if (targetType === 'Project' || targetType === 'Repository' || targetType === 'Team') {
    updateCurrentEventPayload({
      target_id: parseInt(anchor.getAttribute('data-target-id') || '').toString(),
      target_type: targetType,
      target_scope: '',
      client_rank: parseInt(anchor.getAttribute('data-client-rank') || '').toString(),
      server_rank: parseInt(anchor.getAttribute('data-server-rank') || '').toString(),
    })
    trackJumpToEvent('click')
  }
}
export function trackJumpToEvent(eventName: EventName): boolean {
  const actorId = parseInt(
    document.head?.querySelector<HTMLMetaElement>('meta[name="octolytics-actor-id"]')?.content || '',
  )
  if (!actorId) {
    // Do not track events for anonymous users.
    return false
  }

  let sessionId = currentEventContext['session_id']

  if (eventName === 'menu-activation' && sessionId) {
    // Do not track duplicate menu activation for this session.
    return false
  }

  if (eventName !== 'menu-activation' && !sessionId) {
    // Do not track any duplicate events after session has ended.
    return false
  }

  if (eventName === 'menu-activation') {
    // Start a new session.
    sessionId = uuidv4()
    updateCurrentEventPayload({session_id: sessionId})
  }

  if (!sessionId) return false
  sendEvent(`jump-to-${eventName}`, currentEventContext)

  if (eventName === 'menu-deactivation' || eventName === 'click' || eventName === 'search') {
    // Reset payload after any event that concludes the session.
    resetCurrentEventPayload()
  }

  return true
}

export function updateCurrentEventPayload(attributes: Context): void {
  Object.assign(currentEventContext, attributes)
}

export function resetCurrentEventPayload(): void {
  currentEventContext = {}
}

export function cloneCurrentEventPayload(): Context {
  // Shallow clone the whole object.
  return {...currentEventContext}
}

// https://stackoverflow.com/a/2117523
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
