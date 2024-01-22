import {attr, controller} from '@github/catalyst'
import {GetRepoElement} from './get-repo-element'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

@controller
class RepoCodespacesCountElement extends HTMLElement {
  static attrPrefix = ''
  @attr codespacesCount = 0

  connectedCallback() {
    observe('get-repo', {
      constructor: GetRepoElement,
      add: el => {
        this.handleGetRepoElement(el)
      },
    })
  }

  handleGetRepoElement(getRepoElement: GetRepoElement) {
    if (!getRepoElement.openOrCreateInCodespace) {
      return
    }
    if (this.codespacesCount === 0) {
      getRepoElement.showOpenOrCreateInCodespace()
    } else {
      getRepoElement.removeOpenOrCreateInCodespace()
    }
  }
}
