// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {debounce} from '@github/mini-throttle'
import {showGlobalError} from '../behaviors/ajax-error'
import {parseHTML} from '@github-ui/parse-html'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    // The reaction buttons are 26 +/- 0.1px depending on :shrug:. If the menu overflows it'll go to 2 rows, and be closer to 52px than 26px
    if (entry.contentRect.height > 40) {
      hideReactionOverflow(entry.target as HTMLElement)
    }
  }
})

observe('.js-reactions-container', function (el) {
  resizeObserver.observe(el)
})

function hideReactionOverflow(reactionContainer: HTMLElement) {
  const availableWidth = reactionContainer.offsetWidth * 0.7
  const reactionButtons = reactionContainer.querySelectorAll<HTMLElement>('.js-reaction-group-button')
  const allReactionsPopover = reactionContainer.querySelector<HTMLElement>('.js-all-reactions-popover')

  let totalButtonWidth = 0
  for (const button of reactionButtons) {
    totalButtonWidth += button.clientWidth
  }
  totalButtonWidth += allReactionsPopover?.clientWidth || 0

  if (availableWidth < totalButtonWidth) {
    let remainingWidth = availableWidth

    if (allReactionsPopover) {
      allReactionsPopover.removeAttribute('hidden')
      remainingWidth -= allReactionsPopover.offsetWidth
    }

    for (const button of reactionButtons) {
      const buttonWidth = button.offsetWidth
      if (buttonWidth > remainingWidth) {
        button.setAttribute('hidden', 'hidden')
      } else {
        button.removeAttribute('hidden')
      }
      remainingWidth -= buttonWidth
    }
  }
}

const debouncedPickReaction = debounce(async (e: Event) => {
  const form = e.target as HTMLFormElement

  let response
  try {
    response = await fetch(form.action, {
      method: form.method,
      headers: new Headers({
        'X-Requested-With': 'XMLHttpRequest',
      }),
      body: new FormData(form),
    })
  } catch {
    showGlobalError()
  }
  if (response && !response.ok) {
    showGlobalError()
  }

  if (response && response.status === 200) {
    const json = await response.json()

    const comment = form.closest<HTMLElement>('.js-comment')
    const reactionsContainer = comment?.querySelector<HTMLElement>('.js-reactions-container')
    const reactionsHeader = comment?.querySelector<HTMLElement>('.js-comment-header-reaction-button')
    if (json && reactionsContainer && reactionsHeader) {
      const newReactions = parseHTML(document, json['reactions_container'].trim())
      const newReactionButton = parseHTML(document, json['comment_header_reaction_button'].trim())
      reactionsContainer.replaceWith(newReactions)
      reactionsHeader.replaceWith(newReactionButton)
    }
    const elementToFocus = comment?.querySelector<HTMLElement>('.js-reactions-focus')
    if (elementToFocus) elementToFocus.focus()
  }
}, 1000)

on('submit', '.js-pick-reaction', e => {
  e.preventDefault()
  debouncedPickReaction(e)
})

function showReactionContent(event: MouseEvent) {
  const target = event.target as HTMLElement

  const label = target.getAttribute('data-reaction-label')!
  const container = target.closest<HTMLElement>('.js-add-reaction-popover')!
  const description = container.querySelector<HTMLElement>('.js-reaction-description')!

  if (!description.hasAttribute('data-default-text')) {
    description.setAttribute('data-default-text', description.textContent || '')
  }

  description.textContent = label
}

function hideReactionContent(event: MouseEvent) {
  const container = (event.target as HTMLElement).closest<HTMLElement>('.js-add-reaction-popover')!
  const description = container.querySelector<HTMLElement>('.js-reaction-description')!

  const defaultText = description.getAttribute('data-default-text')
  if (defaultText) {
    description.textContent = defaultText
  }
}

on(
  'toggle',
  '.js-reaction-popover-container',
  function (event) {
    const isOpen = event.currentTarget.hasAttribute('open')
    for (const item of (event.target as Element).querySelectorAll<HTMLElement>('.js-reaction-option-item')) {
      if (isOpen) {
        item.addEventListener('mouseenter', showReactionContent)
        item.addEventListener('mouseleave', hideReactionContent)
      } else {
        item.removeEventListener('mouseenter', showReactionContent)
        item.removeEventListener('mouseleave', hideReactionContent)
      }
    }
  },
  {capture: true},
)
