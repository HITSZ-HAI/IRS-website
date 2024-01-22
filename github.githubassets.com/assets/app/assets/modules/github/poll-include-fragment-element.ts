/* eslint eslint-comments/no-use: off */

import './include-fragment-element-hacks'
import IncludeFragmentElement from '@github/include-fragment-element'
import {controller, target} from '@github/catalyst'

@controller
class PollIncludeFragmentElement extends IncludeFragmentElement {
  @target retryButton: HTMLButtonElement | null

  override async fetch(request: Request, ms = 1000): Promise<Response> {
    const response = await super.fetch(request)

    if (response.status === 202) {
      await new Promise(resolve => setTimeout(resolve, ms))
      return this.fetch(request, ms * 1.5)
    } else {
      return response
    }
  }

  override connectedCallback() {
    super.connectedCallback()

    if (this.retryButton) {
      this.retryButton.addEventListener('click', () => {
        this.refetch()
      })
    }
  }
}
