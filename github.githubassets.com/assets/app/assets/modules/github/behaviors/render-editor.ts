import {type TemplateResult, html, render} from 'lit-html'
import {markdownEnrichmentSuccess, showMarkdownRenderError} from './enrichable-markdown-render'

// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import visible from '../visible'
interface RenderTiming {
  load?: number | null
  helloTimer?: number | null
  hello?: number | null
  loadTimer?: number | null
  untimed?: boolean
}

export function supportsRichExpanding(container: HTMLElement) {
  return !!container.querySelector('.js-render-target[data-type="ipynb"]')
}

// These are the mutable state classes. They are to be wiped between transitions.
const stateClasses = ['is-render-pending', 'is-render-ready', 'is-render-loading', 'is-render-loaded']
// During a soft navigation, we need to clear most of the mutable state classes, but preserve `is-render-pending`.
// We also want to clear out any of the failed state classes, since they prevent the user from viewing content
// which has otherwise rendered correctly
const softNavStateClasses = [
  'is-render-ready',
  'is-render-loading',
  'is-render-loaded',
  'is-render-failed',
  'is-render-failed-fatally',
]
const timingData: WeakMap<Element, RenderTiming> = new WeakMap()
function resetTiming(where: Element) {
  const renderTiming = timingData.get(where)
  if (renderTiming == null) {
    return
  }
  renderTiming.load = renderTiming.hello = null
  if (renderTiming.helloTimer) {
    clearTimeout(renderTiming.helloTimer)
    renderTiming.helloTimer = null
  }
  if (renderTiming.loadTimer) {
    clearTimeout(renderTiming.loadTimer)
    renderTiming.loadTimer = null
  }
}

// Everything is broken, sink with the ship
function renderFailed(where: Element, msg = '') {
  where.classList.remove(...stateClasses)
  where.classList.add('is-render-failed')

  const errElement = renderError(msg)

  // determine if we're rendering a file or a code block
  if (showMarkdownRenderError(where as HTMLElement, errElement) === false) {
    fileRenderError(where as HTMLElement, errElement)
  }

  resetTiming(where)
}

function fileRenderError(parent: HTMLElement, template: TemplateResult) {
  const child = parent.querySelector('.render-viewer-error')
  if (child) {
    child.remove()
    parent.classList.remove('render-container')
    render(template, parent)
  }
}

function renderError(msg: string) {
  let errMsg = html`<p>Unable to render rich display</p>`

  if (msg !== '') {
    const msgLines = msg.split('\n')
    errMsg = html`<p><b>Unable to render rich display</b></p>
      <p>${msgLines.map(line => html`${line}<br />`)}</p>`
  }
  return html`<div class="flash flash-error">${errMsg}</div>`
}

function timeoutWatchdog(where: Element, checkHello = false) {
  if (
    !visible(where as HTMLElement) ||
    where.classList.contains('is-render-ready') ||
    where.classList.contains('is-render-failed') ||
    where.classList.contains('is-render-failed-fatally') ||
    (checkHello && !timingData.get(where)?.hello)
  ) {
    return
  }

  renderFailed(where)
}

// Update each container with a potentially
// changed element every time a refresh or soft nav
// triggers.
observe('.js-render-target', function (el) {
  const htmlEl = el as HTMLElement
  htmlEl.classList.remove(...softNavStateClasses)
  htmlEl.style.height = 'auto'

  if (timingData.get(el)?.load) {
    return
  }

  resetTiming(el)

  if (timingData.get(el)) {
    return
  }

  timingData.set(el, {
    load: Date.now(),
    hello: null,
    helloTimer: window.setTimeout(timeoutWatchdog, 10_000, el, true),
    loadTimer: window.setTimeout(timeoutWatchdog, 45_000, el),
  })

  el.classList.add('is-render-automatic', 'is-render-requested')
})

interface RenderMessage {
  type: string
  body?: unknown
}

function postAsJson(renderWindow: Window | null | undefined, message: RenderMessage) {
  if (renderWindow && renderWindow.postMessage) {
    renderWindow.postMessage(JSON.stringify(message), '*')
    return true
  }
  return false
}

function resolveRenderTargetFromContainer(container: Document | HTMLElement, identity: string) {
  const el = container.querySelector(`.js-render-target[data-identity="${identity}"]`)
  if (el && el instanceof HTMLElement) return el
  return null
}

function withRenderWindow(callback: (renderWindow: Window) => boolean) {
  return (container: HTMLElement) => {
    const target = container.querySelector('.js-render-target')
    if (!target) return

    const iframe = container.querySelector('iframe')
    const renderWindow = iframe?.contentWindow
    if (!renderWindow) return

    return callback(renderWindow)
  }
}

export function handleMessage(event: MessageEvent) {
  let result = event.data
  if (!result) return

  if (typeof result === 'string') {
    try {
      result = JSON.parse(result) as unknown
    } catch {
      // Ignore parse errors
      return
    }
  }

  // effective way to check for both null and undefined ⤵️
  // eslint-disable-next-line eqeqeq
  if (typeof result !== 'object' && result != undefined) return

  if (result.type !== 'render') return

  if (typeof result.identity !== 'string') return
  const identity = result.identity

  if (typeof result.body !== 'string') return
  const body = result.body

  const container = resolveRenderTargetFromContainer(document, identity)
  if (!container) return

  if (event.origin !== container.getAttribute('data-host')) {
    return
  }

  const payload = result.payload != null ? result.payload : undefined
  const iframe = container.querySelector('iframe')
  const renderWindow = iframe?.contentWindow

  function postData() {
    // force an undefined value into a string so the call to JSON.parse passes the TS compiler.
    const data = iframe?.getAttribute('data-content') ?? ''

    let parsed: Record<string, unknown> | null

    try {
      // Data is generally expected to be a JSON string with a key of `data`,
      // but we are also seeing values like 'null' getting in here.
      parsed = JSON.parse(data)?.data
    } catch {
      parsed = null
    }

    if (!parsed) {
      return
    }

    const msg = {
      type: 'render:cmd',
      body: {
        cmd: 'code_rendering_service:data:ready',
        'code_rendering_service:data:ready': {
          data: parsed,
          width: container?.getBoundingClientRect().width,
        },
      },
    }
    postAsJson(renderWindow, msg)
  }

  switch (body) {
    case 'hello': {
      const renderTiming = timingData.get(container) || {
        untimed: true,
      }

      renderTiming.hello = Date.now()

      const ackmsg = {
        type: 'render:cmd',
        body: {
          cmd: 'ack',
          ack: true,
        },
      }

      const msg = {
        type: 'render:cmd',
        body: {
          cmd: 'branding',
          branding: false,
        },
      }

      if (!renderWindow) return
      postAsJson(renderWindow, ackmsg)
      postAsJson(renderWindow, msg)

      break
    }
    case 'error': {
      renderFailed(container, payload?.error)
      break
    }
    case 'error:fatal': {
      renderFailed(container, payload?.error)
      container.classList.add('is-render-failed-fatal')
      break
    }
    case 'error:invalid':
      renderFailed(container, payload?.error)
      container.classList.add('is-render-failed-invalid')
      break
    case 'loading':
      container.classList.remove(...stateClasses)
      container.classList.add('is-render-loading')
      break
    case 'loaded':
      container.classList.remove(...stateClasses)
      container.classList.add('is-render-loaded')
      break
    case 'ready':
      markdownEnrichmentSuccess(container)
      container.classList.remove(...stateClasses)
      container.classList.add('is-render-ready')

      if (payload && typeof payload.height === 'number') {
        container.style.height = `${payload.height}px`

        // If the URL contains an anchor tag, try not to disrupt the scroll position
        if (location.hash !== '') {
          window.dispatchEvent(new HashChangeEvent('hashchange'))
        }
      }

      if (payload?.ack === true) {
        // The iframe has requested an ack once the ready event has been processed.
        // We need to wait until the container has been drawn on screen before sending
        // the ack. This is used by the mermaid renderer to ensure the container is
        // visible on screen at the correct height before rendering the diagram.
        // See https://github.com/github/viewscreen/issues/471 for more details.
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            postAsJson(renderWindow, {
              type: 'render:cmd',
              body: {
                cmd: 'code_rendering_service:ready:ack',
                'code_rendering_service:ready:ack': {},
              },
            })
          }, 0)
        })
      }

      break
    case 'resize':
      if (payload && typeof payload.height === 'number') {
        container.style.height = `${payload.height}px`
      }

      break
    case 'code_rendering_service:container:get_size':
      postAsJson(renderWindow, {
        type: 'render:cmd',
        body: {
          cmd: 'code_rendering_service:container:size',
          'code_rendering_service:container:size': {
            width: container?.getBoundingClientRect().width,
          },
        },
      })
      break
    case 'code_rendering_service:markdown:get_data':
      if (!renderWindow) return
      postData()
      break
    default:
      break
  }
}

// Handle messages coming from the viewer iframe using `postMessage`.
// We throw away any message that doesn't look like it's coming from the render
// client.
window.addEventListener('message', handleMessage)

export const expandAllInContainer = withRenderWindow(renderWindow =>
  postAsJson(renderWindow, {
    type: 'render:cmd',
    body: {
      cmd: 'code_rendering_service:behaviour:expand_all',
    },
  }),
)

export const collapseAllInContainer = withRenderWindow(renderWindow =>
  postAsJson(renderWindow, {
    type: 'render:cmd',
    body: {
      cmd: 'code_rendering_service:behaviour:collapse_all',
    },
  }),
)
