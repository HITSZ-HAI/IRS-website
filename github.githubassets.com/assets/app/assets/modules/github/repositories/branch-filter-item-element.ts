import {controller, target} from '@github/catalyst'
import type {ModalDialogElement} from '@primer/view-components/app/components/primer/alpha/modal_dialog'
import {announce} from '@github-ui/aria-live'

@controller
class BranchFilterItemElement extends HTMLElement {
  @target destroyButton: HTMLButtonElement | null
  @target restoreButton: HTMLButtonElement | null
  @target spinner: SVGElement

  closeHandler = () => this.handleDialogClose()
  cancelHandler = () => this.handleDialogCancel()

  get branch(): string {
    return this.getAttribute('branch')!
  }

  get branches(): BranchFilterItemElement[] {
    const container = this.closest('branch-filter')!
    const rows = container.querySelectorAll<BranchFilterItemElement>('branch-filter-item')
    return Array.from(rows).filter(el => el.branch === this.branch)
  }

  get dialogBodyPath(): string {
    return this.getAttribute('dialog-body-path')!
  }

  get destroyDialog(): ModalDialogElement {
    const container = this.closest('branch-filter')!
    return container.querySelector<ModalDialogElement>('modal-dialog')!
  }

  loading(load: boolean) {
    for (const el of this.branches) {
      if (load) {
        el.spinner.removeAttribute('hidden')
      } else {
        el.spinner.setAttribute('hidden', 'true')
      }
      if (el.destroyButton) {
        el.destroyButton.hidden = load
      }
    }
  }

  set mode(value: 'restore' | 'destroy') {
    for (const el of this.branches) {
      el.classList.toggle('Details--on', value === 'restore')
    }
  }

  async restore(event: Event) {
    event.preventDefault()
    this.loading(true)
    const form = event.target as HTMLFormElement

    let response
    try {
      response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
    } catch {
      // Ignore network errors
    } finally {
      if (!response || !response.ok) location.reload()
      this.loading(false)
    }

    this.mode = 'destroy'

    setTimeout(() => this.destroyButton?.focus(), 1)
  }

  async destroy(event: Event) {
    event.preventDefault()
    this.loading(true)
    this.disableAllDeleteButtons(true)

    let dialogBodyResponse: Response | undefined
    try {
      dialogBodyResponse = await fetch(this.dialogBodyPath)
    } catch {
      // Ignore network errors
    }

    if (!dialogBodyResponse || !dialogBodyResponse.ok) {
      this.displayServerError(true, dialogBodyResponse?.status === 404)
      this.disableAllDeleteButtons(false)
      this.loading(false)
      return
    }

    this.displayServerError(false)
    const body = await dialogBodyResponse.text()

    if (body) {
      this.setUpDialog(body)
      this.loading(false)
      this.destroyDialog.show()
      this.disableAllDeleteButtons(false)
    } else {
      this.disableAllDeleteButtons(false)
      await this.confirmDeletion()
    }
  }

  async confirmDeletion() {
    this.loading(true)
    this.destroyDialog.close()

    const form = this.destroyButton!.closest('form')!

    let response: Response | undefined
    try {
      response = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: {'X-Requested-With': 'XMLHttpRequest'},
      })
    } catch {
      // Ignore network errors
    }

    if (!response || !response.ok) {
      this.displayServerError(true, response?.status === 404)
      this.loading(false)
      return
    }

    // eslint-disable-next-line i18n-text/no-en
    announce(`Branch ${this.branch} deleted`)
    this.loading(false)
    this.mode = 'restore'

    setTimeout(() => this.restoreButton?.focus(), 1)
  }

  private setUpDialog(body: string) {
    const destroyDialog = this.destroyDialog
    destroyDialog.querySelector('.js-delete-dialog-body')!.innerHTML = body
    destroyDialog.addEventListener('close', this.closeHandler)
    destroyDialog.addEventListener('cancel', this.cancelHandler)
  }

  private handleDialogClose() {
    this.removeDialogEventListeners()
    this.confirmDeletion()
  }

  private handleDialogCancel() {
    this.removeDialogEventListeners()
    setTimeout(() => this.destroyButton?.focus(), 1)
  }

  private removeDialogEventListeners() {
    const destroyDialog = this.destroyDialog
    destroyDialog.removeEventListener('close', this.closeHandler)
    destroyDialog.removeEventListener('cancel', this.cancelHandler)
  }

  disableAllDeleteButtons(disable: boolean) {
    for (const btn of document.querySelectorAll<HTMLButtonElement>('.js-branch-delete-button')) {
      btn.disabled = disable
      if (disable) {
        btn.classList.add('disabled')
      } else {
        btn.classList.remove('disabled')
      }
    }
  }

  private displayServerError(display: boolean, is404 = false) {
    const errorDiv: HTMLElement = document.querySelector('.js-branch-delete-error')!
    const warningDiv: HTMLElement = document.querySelector('.js-branch-delete-warning')!
    if (display) {
      if (is404) {
        warningDiv.querySelector('.js-branch-delete-warning-name')!.textContent = this.branch
        warningDiv.hidden = false
      } else {
        errorDiv.querySelector('.js-branch-delete-error-name')!.textContent = this.branch
        errorDiv.hidden = false
      }
    } else {
      errorDiv.hidden = true
      warningDiv.hidden = true
    }
  }
}
