// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const hiddenTimePeriodOnScrollInMs = 1000

const abortControllers = new WeakMap()

const snippetClipboardCopyTemplate = document.querySelector<HTMLTemplateElement>('#snippet-clipboard-copy-button')
const snippetClipboardCopyTemplateUnpositioned = document.querySelector<HTMLTemplateElement>(
  '#snippet-clipboard-copy-button-unpositioned',
)

async function insertSnippetClipboardCopyButton(el: HTMLElement, signal: AbortSignal): Promise<void> {
  const clipboardContent = el.getAttribute('data-snippet-clipboard-copy-content')
  if (clipboardContent === null) return

  // Remove this attribute so that we don't add a second button.
  el.removeAttribute('data-snippet-clipboard-copy-content')

  const useUnpositioned = !!el.closest('.js-snippet-clipboard-copy-unpositioned')
  const template = useUnpositioned ? snippetClipboardCopyTemplateUnpositioned : snippetClipboardCopyTemplate

  if (!(template instanceof HTMLTemplateElement)) return

  const documentFragment = template.content.cloneNode(true) as DocumentFragment

  const clonedZeroClipboardContainer = documentFragment.children[0]
  if (!(clonedZeroClipboardContainer instanceof HTMLElement)) return

  const clipboardCopyElement = clonedZeroClipboardContainer.children[0]
  if (!(clipboardCopyElement instanceof HTMLElement)) return

  clipboardCopyElement.setAttribute('value', clipboardContent)

  if (!useUnpositioned) {
    document.addEventListener(
      'selectionchange',
      () => {
        const selection = document.getSelection()
        if (selection && el.contains(selection.anchorNode)) {
          const selectedText = selection?.toString()
          clipboardCopyElement.style.display = selectedText.trim() === '' ? 'inherit' : 'none'
        }
      },
      {signal},
    )

    const scrollableElement = el.querySelector('pre')
    if (scrollableElement !== null) {
      let timer: ReturnType<typeof setTimeout> | undefined

      /* eslint-disable-next-line github/prefer-observers */
      scrollableElement.addEventListener(
        'scroll',
        () => {
          if (timer) clearTimeout(timer)

          clipboardCopyElement.style.display = 'none'
          timer = setTimeout(() => {
            clipboardCopyElement.style.display = 'inherit'
          }, hiddenTimePeriodOnScrollInMs)
        },
        {signal},
      )
    }
  }

  el.appendChild(clonedZeroClipboardContainer)
}

observe('[data-snippet-clipboard-copy-content]', {
  constructor: HTMLElement,
  add(el) {
    const abortController = new AbortController()
    abortControllers.set(el, abortController)

    insertSnippetClipboardCopyButton(el, abortController.signal)
  },
})

observe('.snippet-clipboard-content clipboard-copy', {
  constructor: HTMLElement,
  remove(el) {
    const controller = abortControllers.get(el)
    if (controller) {
      controller.abort()
    }
  },
})
