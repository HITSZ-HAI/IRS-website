import type {
  NotificationsDialogLabelItemElement,
  NotificationsDialogLabelToggledEvent,
} from './notifications-subscriptions-dialog-label-item'
import {controller, target, targets} from '@github/catalyst'
import {hideGlobalError, showGlobalError} from '../behaviors/ajax-error'
import type DetailsDialogElement from '@github/details-dialog-element'
import type DetailsMenuElement from '@github/details-menu-element'
import {changeValue} from '@github-ui/form-utils'

@controller
class NotificationsListSubscriptionFormElement extends HTMLElement {
  @target details: HTMLDetailsElement
  @target menu: DetailsMenuElement
  @target customButton: HTMLButtonElement
  @target customDialog: DetailsDialogElement
  @target filterLabelsDialog: DetailsDialogElement
  @targets subscriptionButtons: HTMLButtonElement[]
  @targets subscriptionsLabels: HTMLElement[]
  @target labelInputs: HTMLElement
  @target subscriptionsSubtitle: HTMLElement
  @target socialCount: HTMLElement
  @target unwatchButtonCopy: HTMLElement
  @target stopIgnoringButtonCopy: HTMLElement
  @target watchButtonCopy: HTMLElement
  @targets threadTypeCheckboxes: HTMLInputElement[]
  @target customSubmit: HTMLButtonElement
  @target subscriptionsContainer: HTMLElement
  @targets dialogLabelItems: NotificationsDialogLabelItemElement[]

  lastAppliedLabels: {[labelId: string]: Node} = {}

  connectedCallback() {
    /* eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback */
    const el = this.querySelector<HTMLElement>('.js-label-subscriptions-load')

    el?.addEventListener('loadend', () => {
      if (this.subscriptionsLabels.length > 0) {
        this.updateCheckedState('custom')
        this.updateMenuButtonCopy('custom')
      }
    })
  }

  async submitCustomForm(e: Event) {
    await this.submitForm(e)
    this.closeMenu()
  }

  async submitForm(e: Event) {
    e.preventDefault()

    hideGlobalError()

    const form = e.currentTarget as HTMLFormElement
    const body = new FormData(form)

    const response = await self.fetch(form.action, {
      method: form.method,
      body,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      showGlobalError()
      return
    }
    const json = await response.json()

    const doParam = body.get('do')
    if (typeof doParam === 'string') this.updateCheckedState(doParam)
    if (typeof doParam === 'string') this.updateMenuButtonCopy(doParam)
    this.updateSocialCount(json.count)
    this.applyInputsCheckedPropertiesToAttributesForNextFormReset()
    this.closeMenu()
  }

  updateMenuButtonCopy(subscription: string) {
    this.unwatchButtonCopy.hidden = !(subscription === 'subscribed' || subscription === 'custom')
    this.stopIgnoringButtonCopy.hidden = !(subscription === 'ignore')
    this.watchButtonCopy.hidden = !(
      subscription !== 'subscribed' &&
      subscription !== 'custom' &&
      subscription !== 'ignore'
    )
  }

  // form.reset() will reset the form back to the values in it's html attributes, not to it's current JS properties
  // therefore, after successfully saving the form to the server, we transfer value of the `.checked` properties
  // of the inputs in the form into the `[checked]` attribute. This means that if the user reopens the form and
  // edits it again, cancelling will reset the form to it's last saved state, not the original state on page load
  applyInputsCheckedPropertiesToAttributesForNextFormReset() {
    for (const input of [...this.threadTypeCheckboxes]) {
      input.toggleAttribute('checked', input.checked)
    }
  }

  updateCheckedState(doParam: string) {
    for (const button of this.subscriptionButtons) {
      button.setAttribute('aria-checked', button.value === doParam ? 'true' : 'false')
    }

    if (doParam === 'custom') {
      this.customButton.setAttribute('aria-checked', 'true')
    } else {
      this.customButton.setAttribute('aria-checked', 'false')

      for (const input of [...this.threadTypeCheckboxes]) {
        changeValue(input, false)
      }
      // Clean up labels
      if (this.subscriptionsContainer !== undefined) {
        for (let i = 0; i < this.subscriptionsLabels.length; i++) {
          this.subscriptionsLabels[i]!.remove()
        }

        if (this.subscriptionsSubtitle !== undefined) {
          this.subscriptionsSubtitle.toggleAttribute('hidden', false)
        }

        this.subscriptionsContainer.textContent = ''
      }
    }
  }

  updateSocialCount(count: string) {
    if (this.socialCount) {
      this.socialCount.textContent = count
      this.socialCount.setAttribute('aria-label', `${this.pluralizeUsers(count)} watching this repository`)
    }
  }

  pluralizeUsers(userCount: string) {
    return parseInt(userCount) === 1 ? '1 user is' : `${userCount} users are`
  }

  handleDialogLabelToggle(e: CustomEvent<NotificationsDialogLabelToggledEvent>) {
    // change aria-checked attribute for the selected label
    // to make item appear selected/unselected depending on the current state
    const wasChecked = e.detail.wasChecked
    const labelId = e.detail.toggledLabelId
    const templateLabelElementClone = e.detail.templateLabelElementClone

    // add/remove selected label from the list of selected labels
    if (wasChecked) {
      // if label was checked previously and is now unchecked, remove label from subscribed labels list
      for (let i = 0; i < this.subscriptionsLabels.length; i++) {
        if (this.subscriptionsLabels[i]!.getAttribute('data-label-id') === labelId) {
          this.subscriptionsLabels[i]!.remove()
          break
        }
      }
    } else {
      templateLabelElementClone.removeAttribute('hidden')
      templateLabelElementClone.setAttribute('data-targets', 'notifications-list-subscription-form.subscriptionsLabels')

      this.subscriptionsContainer.appendChild(templateLabelElementClone)
    }
  }

  openCustomDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    this.menu.toggleAttribute('hidden', true)
    this.enableApplyButtonAndCheckbox()
    this.saveCurrentLabelsState()
    this.customDialog.toggleAttribute('hidden', false)
    setTimeout(() => {
      this.customDialog.querySelector<HTMLInputElement>('input[type=checkbox][autofocus]')?.focus()
    }, 0)
  }

  enableApplyButtonAndCheckbox() {
    const visibleLabels = this.customDialog.querySelectorAll<HTMLElement>('[data-type="label"]:not([hidden])')

    if (visibleLabels.length > 0) {
      this.customSubmit.removeAttribute('disabled')
      this.threadTypeCheckboxes[0]!.checked = true
    }
  }

  closeCustomDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    this.menu.toggleAttribute('hidden', false)
    this.customDialog.toggleAttribute('hidden', true)
    setTimeout(() => {
      this.customButton.focus()
    }, 0)
  }

  // Apply the previous state of labels selected
  resetFilterLabelsDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    // remove checkboxes from the dialog
    for (let idx = 0; idx < this.subscriptionsLabels.length; idx++) {
      const labelId = this.subscriptionsLabels[idx]!.getAttribute('data-label-id')

      // this is up to O(n^2) but is an im memorty alternative for dom queries, which should be faster
      for (let i = 0; i < this.dialogLabelItems.length; i++) {
        if (this.dialogLabelItems[i]!.labelId === labelId) {
          this.dialogLabelItems[i]!.setCheckedForDropdownLabel(false)
          break
        }
      }
    }

    // add checkboxes to dialog based on last applied labels
    for (let idx = 0; idx < Object.keys(this.lastAppliedLabels).length; idx++) {
      const labelId = Object.keys(this.lastAppliedLabels)[idx]

      // this is up to O(n^2) but is an im memorty alternative for dom queries, which should be faster
      for (let i = 0; i < this.dialogLabelItems.length; i++) {
        if (this.dialogLabelItems[i]!.labelId === labelId) {
          this.dialogLabelItems[i]!.setCheckedForDropdownLabel(true)
          break
        }
      }
    }

    this.subscriptionsContainer.replaceChildren(...Object.values(this.lastAppliedLabels))
    this.closeFilterLabelsDialog(e)
  }

  openFilterLabelsDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    this.saveCurrentLabelsState()
    this.customDialog.toggleAttribute('hidden', true)
    this.filterLabelsDialog.toggleAttribute('hidden', false)
    setTimeout(() => {
      this.filterLabelsDialog.querySelector<HTMLInputElement>('input[type=checkbox][autofocus]')?.focus()
    }, 0)
  }

  closeFilterLabelsDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    this.menu.toggleAttribute('hidden', true)
    this.customDialog.toggleAttribute('hidden', false)
    this.filterLabelsDialog.toggleAttribute('hidden', true)
  }

  // Apply changes from labels filter
  applyFilterLabelsDialog(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    this.saveCurrentLabelsState()

    this.hideFilterSubtitle()
    this.enableIssuesCheckbox()
    this.closeFilterLabelsDialog(e)
  }

  enableIssuesCheckbox() {
    const enableCheckbox = Object.keys(this.lastAppliedLabels).length > 0

    if (enableCheckbox && this.threadTypeCheckboxes.length > 0) {
      this.threadTypeCheckboxes[0]!.checked = enableCheckbox
    }

    this.threadTypeCheckboxesUpdated()
  }

  hideFilterSubtitle() {
    const hideSubtitle = Object.keys(this.lastAppliedLabels).length > 0
    this.subscriptionsSubtitle.toggleAttribute('hidden', hideSubtitle)
  }

  // Save the selected labels and save label ids in inputs
  saveCurrentLabelsState() {
    this.lastAppliedLabels = {}
    this.labelInputs.textContent = ''

    for (let i = 0; i < this.subscriptionsLabels.length; i++) {
      const labelId = this.subscriptionsLabels[i]!.getAttribute('data-label-id')
      if (labelId) {
        this.lastAppliedLabels[labelId] = this.subscriptionsLabels[i]!.cloneNode(true)
        this.appendLabelToFormInput(labelId)
      }
    }
  }

  appendLabelToFormInput(value: string) {
    // create input in memory to append it to the form element
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', 'labels[]')
    input.setAttribute('value', value)

    this.labelInputs.appendChild(input)
  }

  detailsToggled() {
    this.menu.toggleAttribute('hidden', false)
    this.customDialog.toggleAttribute('hidden', true)
  }

  submitCustom(e: Event) {
    e.preventDefault()
    this.details.toggleAttribute('open', false)
  }

  threadTypeCheckboxesUpdated() {
    const noneSelected = !this.threadTypeCheckboxes.some(input => input.checked)

    this.customSubmit.disabled = noneSelected
  }

  closeMenu() {
    this.details.toggleAttribute('open', false)
  }
}
