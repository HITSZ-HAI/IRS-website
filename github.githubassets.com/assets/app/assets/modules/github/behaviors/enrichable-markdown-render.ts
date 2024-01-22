import {type TemplateResult, html, render} from 'lit-html'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

import {getColorMode} from '../color-modes'

interface Api {
  /**
   * Sets the loading state of the js enriched node, true will put it in the loading state, false will remove it
   */
  setLoading(state: boolean): void
  /**
   * Setting true here will put the rendered node into a error state, composing the optional template argument in the output.
   *
   * This method will return true if we did render an error state, false if we did not render an error state — allowing the caller to handle rendering as a fallback.
   */
  setError(state: boolean, template?: TemplateResult): boolean
}

const nodeHandle = new WeakMap<HTMLElement, Api>()

// Enrichable Markdown Rendering:
//
// We use the `markdown-enrichment` to render code blocks in markdown.
// The CodeRenderService is responsible for rendering the code blocks to html and
// this code will find those blocks and enrich them with the code rendering service appropriate
// for the language.
// If we're enriching a raw code block, we need to hide the original
// code block once the iframe has rendered successfully

/**
 * A public api to put a js enriched node into the loading state, note @see enrichMarkdownRenderer to have ran ono this node before
 */
export function markdownEnrichmentSuccess(where: Element) {
  const parent = where.closest('.js-render-needs-enrichment') as HTMLElement
  if (!parent) {
    return
  }

  parent.classList.remove('render-error')

  nodeHandle.get(parent)?.setLoading(false)
}

/**
 * A public api to put a js enriched node into an error state
 */
export function showMarkdownRenderError(where: HTMLElement, template: TemplateResult) {
  const parent = where.closest('.js-render-needs-enrichment') as HTMLElement
  if (!parent) {
    return false
  }

  parent.classList.add('render-error')

  return nodeHandle.get(parent)?.setError(true, template)
}

function makeIframe(
  baseUrl: string,
  params: Record<string, string | number | boolean | null>,
  config: {
    type: string
    contentJson: string
    identifier?: string
  },
) {
  const identifier = config.identifier ?? ''
  const iframeUrl = new URL(baseUrl, window.location.origin)

  for (const [key, value] of Object.entries(params)) {
    iframeUrl.searchParams.append(key, `${value}`)
  }

  iframeUrl.hash = identifier

  return html`
    <div
      class="render-container color-bg-transparent js-render-target p-0"
      data-identity="${identifier}"
      data-host="${iframeUrl.origin}"
      data-type="${config.type}"
    >
      <iframe
        role="presentation"
        class="render-viewer"
        src="${String(iframeUrl)}"
        name="${identifier}"
        data-content="${config.contentJson}"
        sandbox="allow-scripts allow-same-origin allow-top-navigation allow-popups"
      >
      </iframe>
    </div>
  `
}

function makeEnhancedBlockActions(
  rawCode: string,
  onModalOpen: (event: MouseEvent) => void,
  config: {
    type: string
  },
) {
  const copyButton = html`<clipboard-copy
    aria-label="Copy ${config.type} code"
    .value=${rawCode}
    class="btn my-2 js-clipboard-copy p-0 d-inline-flex tooltipped-no-delay"
    role="button"
    data-copy-feedback="Copied!"
    data-tooltip-direction="s"
  >
    <svg
      aria-hidden="true"
      height="16"
      viewBox="0 0 16 16"
      version="1.1"
      width="16"
      class="octicon octicon-copy js-clipboard-copy-icon m-2"
    >
      <path
        fill-rule="evenodd"
        d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"
      ></path>
      <path
        fill-rule="evenodd"
        d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"
      ></path>
    </svg>
    <svg
      aria-hidden="true"
      height="16"
      viewBox="0 0 16 16"
      version="1.1"
      width="16"
      class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none m-2"
    >
      <path
        fill-rule="evenodd"
        d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
      ></path>
    </svg>
  </clipboard-copy>`

  const modal = html`
    <details class="details-reset details-overlay details-overlay-dark" style="display: contents">
      <summary
        role="button"
        aria-label="Open dialog"
        class="btn my-2 mr-2 p-0 d-inline-flex"
        aria-haspopup="dialog"
        @click="${onModalOpen}"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="octicon m-2">
          <path
            fill-rule="evenodd"
            d="M3.72 3.72a.75.75 0 011.06 1.06L2.56 7h10.88l-2.22-2.22a.75.75 0 011.06-1.06l3.5 3.5a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 11-1.06-1.06l2.22-2.22H2.56l2.22 2.22a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5z"
          ></path>
        </svg>
      </summary>
      <details-dialog
        class="Box Box--overlay render-full-screen d-flex flex-column anim-fade-in fast"
        aria-label="${config.type} rendered container"
      >
        <div>
          <button
            aria-label="Close dialog"
            data-close-dialog=""
            type="button"
            data-view-component="true"
            class="Link--muted btn-link position-absolute render-full-screen-close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="display:inline-block;vertical-align:text-bottom"
              class="octicon octicon-x"
            >
              <path
                fill-rule="evenodd"
                d="M5.72 5.72a.75.75 0 011.06 0L12 10.94l5.22-5.22a.75.75 0 111.06 1.06L13.06 12l5.22 5.22a.75.75 0 11-1.06 1.06L12 13.06l-5.22 5.22a.75.75 0 01-1.06-1.06L10.94 12 5.72 6.78a.75.75 0 010-1.06z"
              ></path>
            </svg>
          </button>
          <div class="Box-body border-0" role="presentation"></div>
        </div>
      </details-dialog>
    </details>
  `

  return html`<div class="position-absolute top-0 pr-2 width-full d-flex flex-justify-end flex-items-center">
    ${modal}${copyButton}
  </div>`
}

function enrichMarkdownRenderer(el: HTMLElement) {
  const iframeParams = {
    color_mode: getColorMode(), // TODO: Should viewscreen support color themes?
  }

  // ==> setup some state

  const type = el.getAttribute('data-type')!
  const src = el.getAttribute('data-src')!
  const identifier = el.getAttribute('data-identity')!

  const target = el.getElementsByClassName('js-render-enrichment-target')[0] as HTMLElement

  const loadingHandle = el.getElementsByClassName('js-render-enrichment-loader')[0] as HTMLElement

  // => get the fallback, errors states correctly

  const fallbackHandle = document.createElement('div')
  fallbackHandle.classList.add('js-render-enrichment-fallback')
  el.appendChild(fallbackHandle)

  const fallbackContentNode = target.firstElementChild!
  fallbackHandle.appendChild(fallbackContentNode)

  const api: Api = {
    setLoading(state) {
      loadingHandle.hidden = !state
    },
    setError(state, template) {
      api.setLoading(false) // always remove loading state
      if (state === false) return false // we did not render an error state

      fallbackContentNode.classList.toggle('render-plaintext-hidden', !state)

      if (template) {
        render([template, fallbackContentNode], fallbackHandle)
        return true
      }

      return false
    },
  }

  nodeHandle.set(el, api)

  // ==> real constructor

  const plainText = target.getAttribute('data-plain')
  const contentJson = target.getAttribute('data-json')

  if (contentJson == null || plainText == null) {
    api.setError(true, html`<p class="flash flash-error">Unable to render rich display</p>`)
    throw new Error(`Expected to see input data for type: ${type}`)
  }

  const iframe = makeIframe(src, iframeParams, {
    type,
    identifier,
    contentJson,
  })

  const fullScreenIframe = makeIframe(src, iframeParams, {
    type,
    identifier: `${identifier}-fullscreen`,
    contentJson,
  })

  const buttons = makeEnhancedBlockActions(
    plainText,
    () => {
      // Beware hacks, we need to add the iframe to the nearest box body of the modal
      render(fullScreenIframe, target.getElementsByClassName('Box-body')[0]!)
    },
    {
      type,
    },
  )

  render([buttons, iframe], target)
}

observe('.js-render-needs-enrichment', {
  constructor: HTMLElement,
  initialize: enrichMarkdownRenderer,
})

/**
 * Toggling back and forth between the `preview` and `write` tabs produces jank in
 * the form of an occasionally visible fully rendered chart. This is because we leave the
 * chart on the page until a request to regenerate the chart can be made.
 *
 * So, we add an event in `preview.ts` we can hook into,
 * and clear out the previously rendered chart before requesting a new one from viewscreen
 */
on('preview:toggle:off', '.js-previewable-comment-form', function (event) {
  const target = event.currentTarget
  const htmlEl = target.querySelector<HTMLElement>('.js-render-needs-enrichment')
  const enrichTarget = htmlEl?.querySelector('.js-render-enrichment-target')

  if (!enrichTarget) {
    return
  }

  enrichTarget.textContent = ''
})

on('preview:rendered', '.js-previewable-comment-form', function (event) {
  const target = event.currentTarget
  const htmlEl = target.querySelector<HTMLElement>('.js-render-needs-enrichment')
  if (htmlEl) {
    nodeHandle.get(htmlEl)?.setLoading(false)
  }
})
