// Behaviors complementing dialogs
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'

// Eagerly load an <include-fragment> inside a <modal-dialog> when a user hovers on the button to click it
observe('button[data-show-dialog-id]', button => {
  button?.addEventListener('mouseenter', () => {
    const id = button.getAttribute('data-show-dialog-id')
    const dialog = button.ownerDocument.getElementById(id!)
    dialog?.querySelector('include-fragment[loading=lazy]')?.setAttribute('loading', 'eager')
  })
})

observe('summary[data-show-dialog-id]', button => {
  button?.addEventListener('click', () => {
    const id = button.getAttribute('data-show-dialog-id')
    if (!id) return
    const dialog = button.ownerDocument.getElementById(id) as ModalDialogElement
    dialog?.show()
  })
})
