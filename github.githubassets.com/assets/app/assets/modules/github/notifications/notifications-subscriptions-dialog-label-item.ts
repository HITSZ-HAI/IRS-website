import {attr, controller, target} from '@github/catalyst'

export interface NotificationsDialogLabelToggledEvent {
  wasChecked: boolean
  toggledLabelId: string
  templateLabelElementClone: HTMLElement
}

@controller
export class NotificationsDialogLabelItemElement extends HTMLElement {
  @target label: HTMLElement
  @target hiddenLabelTemplate: HTMLElement
  @target hiddenCheckboxInput: HTMLInputElement

  static attrPrefix = ''
  @attr labelId: string

  toggleDropdownLabel(e: Event) {
    e.preventDefault()
    e.stopPropagation()

    if (this.label) {
      // change aria-checked attribute for the selected label
      const wasChecked = this.label.getAttribute('aria-checked') === 'true'

      this.setCheckedForDropdownLabel(!wasChecked)

      this.dispatchEvent(
        new CustomEvent<NotificationsDialogLabelToggledEvent>('notifications-dialog-label-toggled', {
          detail: {
            wasChecked,
            toggledLabelId: this.labelId,
            templateLabelElementClone: this.hiddenLabelTemplate.cloneNode(true) as HTMLElement,
          },
          bubbles: true,
        }),
      )
    }
  }

  setCheckedForDropdownLabel(checked: boolean) {
    this.label.setAttribute('aria-checked', checked.toString())
  }
}
