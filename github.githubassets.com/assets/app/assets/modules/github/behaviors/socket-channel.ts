import {getSession, type Dispatchable} from '@github-ui/alive'
import type {Metadata, MetadataUpdate, Subscription} from '@github/alive-client'
import {IDLE_METADATA_KEY, Topic, isPresenceChannel} from '@github/alive-client'
import {compose, fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {taskQueue} from '@github-ui/eventloop-tasks'
import {addIdleStateListener} from '../alive/idle-state'

function isPresent(value: Topic | null): value is Topic {
  return value != null
}

function subscriptions(el: Element): Array<Subscription<Dispatchable>> {
  return channels(el).map((topic: Topic) => ({subscriber: el, topic}))
}

function channels(el: Element): Topic[] {
  const names = (el.getAttribute('data-channel') || '').trim().split(/\s+/)
  return names.map(Topic.parse).filter(isPresent)
}

async function watchSocketChannels() {
  const session = await getSession()

  if (!session) {
    return
  }

  type Subs = Array<Subscription<Dispatchable>>
  const queueSubscribe = taskQueue<Subs>(subs => session.subscribe(subs.flat()))
  const queueUnsubscribe = taskQueue<Dispatchable>(els => session.unsubscribeAll(...els))
  const queueMetadata = taskQueue<MetadataUpdate<Dispatchable>>(updates => session.updatePresenceMetadata(updates))

  observe('.js-socket-channel[data-channel]', {
    subscribe: el => {
      const elementSubscriptions = subscriptions(el)
      const presenceChannels = elementSubscriptions
        .map(subscription => subscription.topic.name)
        .filter(channelName => isPresenceChannel(channelName))

      let listenerSubscription = {
        unsubscribe() {
          // nothing to clean up by default.  This will be overridden if there are presence channels
        },
      }

      if (presenceChannels.length) {
        let latestMetadata: Metadata | undefined = undefined
        let latestIdle: boolean | undefined
        const queueMetadataOrIdleChange = () => {
          const metadata: Metadata[] = []

          // combine metadata and idle values
          if (latestMetadata) {
            metadata.push(latestMetadata)
          }
          if (latestIdle !== undefined) {
            metadata.push({[IDLE_METADATA_KEY]: latestIdle ? 1 : 0})
          }

          // Send the metadata to all presence channels on this element
          for (const channelName of presenceChannels) {
            queueMetadata({subscriber: el, channelName, metadata})
          }
        }

        listenerSubscription = compose(
          // listen for metadata updates emitted on the element
          fromEvent(el, 'socket:set-presence-metadata', (e: Event) => {
            const {detail} = e as CustomEvent
            latestMetadata = detail
            queueMetadataOrIdleChange()
          }),
          // listen for idle changes, which will cause us to send a metadata update
          addIdleStateListener(idle => {
            latestIdle = idle
            queueMetadataOrIdleChange()
          }),
        )
      }

      // Process normal subscriptions after setting up metadata listeners
      // This needs to come second so that idle state is ready when we subscribe
      queueSubscribe(elementSubscriptions)

      return listenerSubscription
    },
    remove: el => queueUnsubscribe(el),
  })
}

watchSocketChannels()
