import type {CodeEditor} from './editor/code-editor'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

const codeEditors: WeakMap<HTMLElement, CodeEditor> = new WeakMap()

export function getCodeEditor(el: HTMLElement): CodeEditor | undefined {
  return codeEditors.get(el)
}

export async function getAsyncCodeEditor(el: HTMLElement): Promise<CodeEditor> {
  return codeEditors.get(el) || onEditorFromEvent(await nextEvent(el, 'codeEditor:ready'))
}

function onEditorFromEvent(event: Event): CodeEditor {
  if (!(event instanceof CustomEvent)) throw new Error('assert: event is not a CustomEvent')
  const editor: CodeEditor = event.detail.editor
  if (!event.target) throw new Error('assert: event.target is null')
  codeEditors.set(event.target as HTMLElement, editor)
  return editor
}

on('codeEditor:ready', '.js-code-editor', onEditorFromEvent)

function nextEvent(target: EventTarget, event: string): Promise<Event> {
  return new Promise(resolve => {
    target.addEventListener(event, resolve, {once: true})
  })
}
