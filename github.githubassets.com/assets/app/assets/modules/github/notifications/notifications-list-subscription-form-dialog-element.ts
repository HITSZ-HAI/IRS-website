import {controller, target, targets} from '@github/catalyst'

@controller
class NotificationsListSubscriptionFormDialogElement extends HTMLElement {
  @targets threadTypeCheckboxes: HTMLInputElement[]
  @targets labelCheckboxes: HTMLInputElement[]

  @target customDialog: HTMLElement
  @target labelFilterField: HTMLInputElement
  @target applyButton: HTMLButtonElement

  openCustomDialog() {
    this.enableApplyButtonAndCheckbox()

    // Continue event propagation
    return false
  }

  enableApplyButtonAndCheckbox() {
    const checkedLabels = this.customDialog.querySelectorAll<HTMLInputElement>('[data-type="label"]:checked')

    if (checkedLabels.length > 0) {
      this.applyButton.removeAttribute('disabled')
      this.threadTypeCheckboxes[0]!.checked = true
    }
  }

  threadTypeCheckboxesUpdated() {
    const noneSelected = !this.threadTypeCheckboxes.some(input => input.checked)

    this.applyButton.disabled = noneSelected
  }

  labelCheckboxesUpdated() {
    const noneSelected = !this.labelCheckboxes.some(input => input.checked)

    if (!noneSelected) {
      this.threadTypeCheckboxes[0]!.checked = true
    }
    this.threadTypeCheckboxesUpdated()
  }

  labelFilterUpdated() {
    const newSearchValue = this.labelFilterField.value.toLowerCase()

    for (const checkbox of this.labelCheckboxes) {
      const labelName = checkbox.getAttribute('data-name')!.toLowerCase()
      const labelDescription = checkbox.getAttribute('data-desc')!.toLowerCase()

      if (labelName.includes(newSearchValue) || labelDescription.includes(newSearchValue)) {
        checkbox.closest('li')!.toggleAttribute('hidden', false)
      } else {
        checkbox.closest('li')!.toggleAttribute('hidden', true)
      }
    }
  }
}
