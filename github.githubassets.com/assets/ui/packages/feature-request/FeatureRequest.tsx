import {Link, Button, Octicon} from '@primer/react'
import {CheckIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'

import type {FeatureRequestInfo} from './types'
import {useFeatureRequest} from './hooks/use-feature-request'

export {useFeatureRequest} from './hooks/use-feature-request'

interface FeatureRequestOptionalProps {
  learnMorePath?: string
  requestMessage?: string
  requestedMessage?: string
}

export interface FeatureRequestProps extends FeatureRequestOptionalProps {
  featureRequestInfo: FeatureRequestInfo
}

export function FeatureRequest({
  featureRequestInfo,
  learnMorePath,
  requestMessage,
  requestedMessage,
}: FeatureRequestProps) {
  const {inProgress, requested, toggleFeatureRequest} = useFeatureRequest(featureRequestInfo)

  if (!featureRequestInfo.showFeatureRequest) {
    return null
  }

  return requested ? (
    <CancelFeatureRequest
      inProgress={inProgress}
      toggleFeatureRequest={toggleFeatureRequest}
      requestedMessage={requestedMessage}
    />
  ) : (
    <RequestFeature
      inProgress={inProgress}
      toggleFeatureRequest={toggleFeatureRequest}
      featureName={featureRequestInfo.featureName}
      learnMorePath={learnMorePath}
      requestMessage={requestMessage}
    />
  )
}

interface RequestCTAProps extends FeatureRequestOptionalProps {
  inProgress: boolean
  toggleFeatureRequest: () => void
  featureName?: string
}

export const RequestFeature = ({
  inProgress,
  toggleFeatureRequest: submit,
  featureName,
  learnMorePath,
  requestMessage,
}: RequestCTAProps) => {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const submitAndSendAnalytics = () => {
    submit()
    sendClickAnalyticsEvent({
      category: 'member_feature_request',
      action: `action.${featureName}`,
      label: `ref_cta:ask_admin_for_access;ref_loc:${featureName};`,
    })
  }

  const learnMoreAndSendAnalytics = () => {
    sendClickAnalyticsEvent({
      category: 'suggestion',
      action: `click_to_read_docs`,
      label: `ref_cta:learn_more;ref_loc:${featureName};`,
    })
  }

  return (
    <>
      <RequestCTA onClick={submitAndSendAnalytics} inProgress={inProgress} />
      {requestMessage && <RequestMessage message={requestMessage} />}
      {learnMorePath && <LearnMore onClick={learnMoreAndSendAnalytics} path={learnMorePath} />}
    </>
  )
}

export const CancelFeatureRequest = ({inProgress, toggleFeatureRequest: cancel, requestedMessage}: RequestCTAProps) => {
  return (
    <>
      {requestedMessage && <RequestedMessage message={requestedMessage} />}
      <RemoveRequestCTA onClick={cancel} inProgress={inProgress} />
    </>
  )
}

const RequestCTA = ({onClick, inProgress}: {onClick: () => void; inProgress: boolean}) => {
  return (
    <Button onClick={onClick} disabled={inProgress} {...testIdProps('feature-request-request-button')}>
      {inProgress ? 'Requesting...' : 'Ask admin for access'}
    </Button>
  )
}

const LearnMore = ({onClick, path}: {onClick: () => void; path: string}) => {
  return (
    <Link href={path} onClick={onClick} {...testIdProps('feature-request-learn-more-link')}>
      Learn more
    </Link>
  )
}

const RequestMessage = ({message}: {message: string}) => <span>{message}</span>

const RequestedMessage = ({message}: {message: string}) => {
  return (
    <span className="d-inline-block color-fg-subtle mr-1">
      <Octicon icon={CheckIcon} />
      {message}
    </span>
  )
}

const RemoveRequestCTA = ({onClick, inProgress}: {onClick: () => void; inProgress: boolean}) => {
  return (
    <Link
      className="color-fg-danger text-semibold"
      as="button"
      onClick={onClick}
      disabled={inProgress}
      {...testIdProps('feature-request-cancel-link')}
    >
      {inProgress ? 'Cancelling...' : 'Remove request'}
    </Link>
  )
}

try{ FeatureRequest.displayName ||= 'FeatureRequest' } catch {}
try{ RequestFeature.displayName ||= 'RequestFeature' } catch {}
try{ CancelFeatureRequest.displayName ||= 'CancelFeatureRequest' } catch {}
try{ RequestCTA.displayName ||= 'RequestCTA' } catch {}
try{ LearnMore.displayName ||= 'LearnMore' } catch {}
try{ RequestMessage.displayName ||= 'RequestMessage' } catch {}
try{ RequestedMessage.displayName ||= 'RequestedMessage' } catch {}
try{ RemoveRequestCTA.displayName ||= 'RemoveRequestCTA' } catch {}