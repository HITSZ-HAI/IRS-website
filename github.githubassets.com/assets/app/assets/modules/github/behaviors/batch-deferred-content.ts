// Batch Deferred Content Behavior
//
// Automatically fetches content for multiple placeholders with a single request.
// Placeholders are represented as <batch-deferred-content>'s so that per-placeholder arguments can be
// passed along to the backend for rendering. Once the response is received, each placeholder
// will be replaced with it's relevant content.
//
// Batching is handled by an autoflushing queue. Once an upper limit (default 30) of placeholders
// are found, or new placeholders stop being added to the queue, after a timeout (default 50ms),
// a single request will be made to fetch the content for those items.
//
// Example Markup
//
//   <batch-deferred-content data-url="/my/batched/content/endpoint">
//     <input data-targets="batch-deferred-content.inputs" type="hidden" name="repo_id" value="42">
//     <input data-targets="batch-deferred-content.inputs" type="hidden" name="commit_oid" value="abcdef0">
//   </batch-deferred-content>
//   …
//   <batch-deferred-content data-url="/my/batched/content/endpoint">
//     <input data-targets="batch-deferred-content.inputs" type="hidden" name="repo_id" value="88">
//     <input data-targets="batch-deferred-content.inputs" type="hidden" name="commit_oid" value="f000001">
//   </batch-deferred-content>
//
// Example Request
//
//   POST /my/batched/content/endpoint
//   BODY {
//     items: {
//       item-0: {repo_id: 42, commit_oid: "abcdef0"},
//       item-1: {repo_id: 88, commit_oid: "f000001"},
//     }
//   }
//
// Example Response
//
//   Content-Type: application/json
//   BODY {
//     item-0: "<div>Some markup</div>",
//     item-1: "<div>More markup</div>",
//   }

import {controller, targets} from '@github/catalyst'
import {parseHTML} from '@github-ui/parse-html'
import {BatchLoader} from './batch-deferred-content/batch-loader'

export abstract class BaseBatchDeferredContentElement<ResponseType> extends HTMLElement {
  inputs: HTMLInputElement[]
  batchLoaders: Map<string, BatchLoader<ResponseType>>

  abstract update(content: ResponseType): void
  abstract validate(value: unknown): asserts value is ResponseType

  async connectedCallback() {
    const content = await this.batchLoader.loadInBatch(this)
    this.update(content)
  }

  get batchLoader(): BatchLoader<ResponseType> {
    const url = this.getAttribute('data-url')

    if (!url) {
      throw new Error(`${this.tagName} element requires a data-url attribute`)
    }

    let loader = this.batchLoaders.get(url)
    if (!loader) {
      loader = new BatchLoader(url, (value: unknown) => this.validate(value))
      this.batchLoaders.set(url, loader)
    }
    return loader
  }
}

const batchDeferredContentLoaders: Map<string, BatchLoader<string>> = new Map()

@controller
class BatchDeferredContentElement extends BaseBatchDeferredContentElement<string> {
  @targets override inputs: HTMLInputElement[]

  override batchLoaders = batchDeferredContentLoaders

  validate(value: unknown): asserts value is string {
    if (typeof value !== 'string') {
      throw new Error('Batch deferred content was not a string')
    }
  }

  update(content: string): void {
    const docFragment = parseHTML(document, content)
    this.replaceWith(docFragment)
  }
}
