import type {CopilotChatEventPayload, CopilotChatReference} from './copilot-chat-types'

export class OpenCopilotChatEvent extends Event {
  declare payload: CopilotChatEventPayload
  constructor(payload: CopilotChatEventPayload) {
    super('open-copilot-chat', {
      bubbles: false,
      cancelable: true,
    })

    this.payload = payload
  }
}

export class SearchCopilotEvent extends Event {
  declare content: string
  declare repoNwo: string
  constructor(content: string, repoNwo: string) {
    super('search-copilot-chat', {
      bubbles: false,
      cancelable: true,
    })

    this.content = content
    this.repoNwo = repoNwo
  }
}

export class AddCopilotChatReferenceEvent extends Event {
  declare reference: CopilotChatReference
  declare openPanel?: boolean
  constructor(reference: CopilotChatReference, openPanel: boolean = false) {
    super('add-copilot-chat-reference', {
      bubbles: false,
      cancelable: true,
    })
    this.reference = reference
    this.openPanel = openPanel
  }
}

declare global {
  interface WindowEventMap {
    'open-copilot-chat': OpenCopilotChatEvent
    'add-copilot-chat-reference': AddCopilotChatReferenceEvent
    'search-copilot-chat': SearchCopilotEvent
  }
}

export function publishOpenCopilotChat(payload: CopilotChatEventPayload): void {
  window.dispatchEvent(new OpenCopilotChatEvent(payload))
}

export function publishAddCopilotChatReference(payload: CopilotChatReference, openPanel: boolean = false): void {
  window.dispatchEvent(new AddCopilotChatReferenceEvent(payload, openPanel))
}

export function subscribeOpenCopilotChat(listener: (e: OpenCopilotChatEvent) => void): () => void {
  window.addEventListener('open-copilot-chat', listener)

  return () => {
    window.removeEventListener('open-copilot-chat', listener)
  }
}

export function subscribeAddCopilotChatReference(listener: (e: AddCopilotChatReferenceEvent) => void): () => void {
  window.addEventListener('add-copilot-chat-reference', listener)
  return () => {
    window.removeEventListener('add-copilot-chat-reference', listener)
  }
}

export function subscribeSearchCopilot(listener: (e: SearchCopilotEvent) => void): () => void {
  window.addEventListener('search-copilot-chat', listener)
  return () => {
    window.removeEventListener('search-copilot-chat', listener)
  }
}
