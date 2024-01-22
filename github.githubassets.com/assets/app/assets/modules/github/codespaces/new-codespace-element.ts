import {controller, target} from '@github/catalyst'
import {requestSubmit} from '@github-ui/form-utils'
import {decode, encode, encrypt} from '../behaviors/encrypt'

@controller
class NewCodespaceElement extends HTMLElement {
  @target declarativeSecretsHash: HTMLInputElement
  @target vscsTargetUrl: HTMLInputElement
  @target loadingVscode: HTMLElement
  @target vscodePoller: HTMLElement
  @target advancedOptionsForm: HTMLFormElement | undefined
  @target skuNameInput: HTMLInputElement | undefined

  secrets_hash = new Map() as Map<string, string>

  async connectedCallback() {
    // If we just force-reloaded the page because of an error, drop the param so the flash doesn't stick.
    const url = new URL(document.location.href, window.location.origin)
    const urlParams = new URLSearchParams(url.search)

    if (urlParams.has('response_error')) {
      urlParams.delete('response_error')
      window.history.replaceState({}, '', `?${urlParams.toString()}`)
    }
  }

  toggleLoadingVscode() {
    const isHidden = this.loadingVscode.hidden
    const children = this.children
    for (let i = 0; i < children.length; i++) {
      ;(children[i] as HTMLElement).hidden = isHidden
    }
    this.loadingVscode.hidden = !isHidden
  }

  machineTypeSelected(event: Event) {
    const button = event.currentTarget as HTMLInputElement
    const skuName = button.getAttribute('data-sku-name')
    if (this.skuNameInput && skuName) this.skuNameInput.value = skuName
    if (this.advancedOptionsForm) {
      requestSubmit(this.advancedOptionsForm)
    }
  }

  pollForVscode(event: CustomEvent) {
    this.toggleLoadingVscode()
    const pollingUrl = (event.currentTarget as HTMLElement).getAttribute('data-src')
    if (pollingUrl) this.vscodePoller.setAttribute('src', pollingUrl)
  }

  vscsTargetUrlUpdated(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    this.vscsTargetUrl.value = element.value
  }

  async declarativeSecretsHashUpdated(event: Event) {
    const form = event.currentTarget as HTMLInputElement

    const secretName = form.getAttribute('data-name')
    if (!secretName) return

    let secretPlainText = form.value
    const publicKey = decode(form.getAttribute('data-public-key')!)

    // For existing secrets, unsets the secret value if the box is unchecked
    if (form.getAttribute('type') === 'checkbox' && !form.checked) {
      secretPlainText = ''
    }

    // Update the hash with the encrypted secret or delete if no value is provided
    if (!secretPlainText) {
      this.secrets_hash.delete(secretName)
    } else {
      this.secrets_hash.set(secretName, encode(await encrypt(publicKey, secretPlainText)))
    }

    this.declarativeSecretsHash.value = JSON.stringify(Object.fromEntries(this.secrets_hash))
  }
}
