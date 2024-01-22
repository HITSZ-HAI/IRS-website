import {eventToHotkeyString} from '@github-ui/hotkey'
import {insertText} from '@github-ui/text'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {onKey} from '../onfocus'
import {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'
import {ready} from '@github-ui/document-ready'

on(
  'click',
  '.js-saved-reply-menu.ActionListWrap',
  function (event: Event) {
    if (!(event.target instanceof Element)) return
    const body = event.target
      .closest<HTMLButtonElement>('button[role="menuitem"]')
      ?.querySelector('.js-saved-reply-body')

    // Since this details-menu-select can hold options which arent saved
    // replies, we guard to ensure that only saved replies are handled here.
    if (!body) return

    const text = (body.textContent || '').trim()
    const container = event.target.closest<HTMLElement>('.js-previewable-comment-form')!

    const comment = container.querySelector<HTMLTextAreaElement>('textarea.js-comment-field')!
    insertText(comment, text)
    event.target.closest('modal-dialog')?.close()
    setTimeout(() => comment.focus(), 0)
  },
  {capture: true},
)

on(
  'details-menu-select',
  '.js-saved-reply-menu',
  function (event) {
    if (!(event.target instanceof Element)) return

    const body = event.detail.relatedTarget.querySelector('.js-saved-reply-body')

    // Since this details-menu-select can hold options which arent saved
    // replies, we guard to ensure that only saved replies are handled here.
    if (!body) return

    const text = (body.textContent || '').trim()
    const container = event.target.closest<HTMLElement>('.js-previewable-comment-form')!

    const comment = container.querySelector<HTMLTextAreaElement>('textarea.js-comment-field')!
    insertText(comment, text)
    setTimeout(() => comment.focus(), 0)
  },
  {capture: true},
)

onKey('keydown', '.js-saved-reply-shortcut-comment-field', function (event) {
  if (eventToHotkeyString(event) === 'Control+.') {
    const container = (event.target as Element).closest<HTMLElement>('.js-previewable-comment-form')!
    const menu = container.querySelector<HTMLElement>('.js-saved-reply-container')!
    if (menu instanceof ModalDialogElement) {
      menu.show()
    } else {
      menu.setAttribute('open', '')
    }
    event.preventDefault()
  }
})

onKey('keydown', '.js-saved-reply-filter-input', function (event: KeyboardEvent) {
  // TODO: Refactor to use data-hotkey
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (/^Control\+[1-9]$/.test(eventToHotkeyString(event))) {
    const container = (event.target as Element).closest<HTMLElement>('.js-saved-reply-container')!
    const savedReplyNumber = Number(event.key)
    const reply = container.querySelectorAll(`[role="menuitem"][data-shortcut="${savedReplyNumber}"]`)[0]
    if (reply instanceof HTMLElement) {
      reply.click()
      event.preventDefault()
    }
  } else if (event.key === 'Enter') {
    const container = (event.target as Element).closest<HTMLElement>('.js-saved-reply-container')!
    const replies = container.querySelectorAll('[role="menuitem"]')

    if (replies.length > 0 && replies[0] instanceof HTMLButtonElement) {
      replies[0].click()
    }

    event.preventDefault()
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
})

// ensure the filter text box receives focus after the <include-fragment> is done loading
;(async () => {
  await ready
  const fragments = document.querySelectorAll('.js-saved-reply-include-fragment')

  for (const fragment of fragments) {
    // grab container before adding listener because the <include-fragment> is removed from
    // the DOM before the load event is fired
    const container = fragment.closest<HTMLElement>('.js-saved-reply-container')

    // cannot use on() for this - the load handler is never called
    fragment.addEventListener('load', () => {
      if (container) {
        const input = container.querySelector<HTMLElement>('.js-saved-reply-filter-input')
        if (input) input.focus()
      }
    })
  }
})()
