import {controller, target} from '@github/catalyst'

@controller
class ExportBranchElement extends HTMLElement {
  @target form: HTMLFormElement
  @target loadingIndicator: HTMLElement
  @target viewBranchLink: HTMLAnchorElement
  abortPoll: AbortController | null = null

  connectedCallback() {
    this.abortPoll = new AbortController()
    if (!this.loadingIndicator.hidden) {
      this.startPoll()
    }
  }

  disconnectedCallback(): void {
    this.abortPoll?.abort()
  }

  applyPublishParams() {
    const codespaceId = this.form.getAttribute('data-codespace-id')
    const publishForm = document.querySelector<HTMLFormElement>(
      `[data-codespace-id='${codespaceId}'][data-class="publish-codespace-form"]`,
    )
    if (publishForm) {
      const publishFormData = Object.fromEntries(new FormData(publishForm).entries())
      if (this.form) {
        const queryString = `?name=${publishFormData.name}&visibility=${publishFormData.visibility}`
        const updatedUrl = (this.form.getAttribute('action') || '').split('?')[0] + queryString
        this.form.setAttribute('action', updatedUrl)
      }
    }
  }

  async exportBranch(event: Event) {
    event.preventDefault()

    // Show the loading indicator immediately on click, which behaves more
    // like all the buttons throughout the app using data-disable-with.
    this.form.hidden = true
    this.loadingIndicator.hidden = false

    const response = await fetch(this.form.action, {
      method: this.form.method,
      body: new FormData(this.form),
      headers: {
        // We're passing *both* the Accept header and the XHR header. Ideally
        // we'd *only* pass Accept but currently the SAML filter only returns a
        // 401 for XHR requests. So we need to pass both headers to get the
        // behavior we want here.
        Accept: 'text/fragment+html',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    if (response.ok) {
      this.startPoll()
    } else {
      this.form.hidden = false
      this.loadingIndicator.hidden = true
    }
  }

  private async startPoll() {
    const url = this.getAttribute('data-exported-codespace-url') || ''
    const response = await this.poll(url)
    if (response) {
      if (response.ok) {
        this.loadingIndicator.hidden = true
        this.viewBranchLink.hidden = false
      } else {
        const errorRedirectUrl = this.getAttribute('data-export-error-redirect-url') || ''
        window.location.href = encodeURI(errorRedirectUrl)
      }
    }
  }

  private async poll(url: string, wait = 1000): Promise<Response | undefined> {
    // The AbortController will be aborted if the component is disconnected (i.e. removed from the DOM)
    if (this.abortPoll?.signal.aborted) {
      return undefined
    }
    const response = await fetch(url, {signal: this.abortPoll?.signal})
    if (response.status === 202 || response.status === 404) {
      await new Promise(resolve => setTimeout(resolve, wait))
      return this.poll(url, wait * 1.5)
    }
    return response
  }
}
