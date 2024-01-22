import {controller} from '@github/catalyst'
import {getReactPartial} from './react-partial-registry'
import type {EmbeddedPartialData} from './embedded-data-types'
import {ReactBaseElement} from './ReactBaseElement'
import {PartialEntry} from './PartialEntry'

// What is this silliness? Is it react or a web component?!
// It's a web component we use to bootstrap react partials within the monolith.
@controller
class ReactPartialElement extends ReactBaseElement<EmbeddedPartialData> {
  nameAttribute = 'partial-name'

  async getReactNode(embeddedData: EmbeddedPartialData) {
    const {Component} = await getReactPartial(this.name)

    return (
      <PartialEntry
        partialName={this.name}
        embeddedData={embeddedData}
        Component={Component}
        wasServerRendered={this.hasSSRContent}
        ssrError={Boolean(this.ssrError)}
      />
    )
  }
}
