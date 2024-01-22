import {controller} from '@github/catalyst'
import {openDialog} from '../codespaces/dropdown-list'

@controller
class ConcurrencyLimitElement extends HTMLElement {
  async connectedCallback() {
    openDialog('concurrency-error')
  }
}
