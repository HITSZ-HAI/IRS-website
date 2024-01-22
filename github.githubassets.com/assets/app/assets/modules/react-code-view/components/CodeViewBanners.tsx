import {
  type BlobPayload,
  type FilePagePayload,
  isBlobPayload,
  isFileOverviewPayload,
  isTreePayload,
  type OverviewPayload,
  type TreePayload,
} from '@github-ui/code-view-types'
import {Box, Flash} from '@primer/react'

import {useCodeViewBanners} from '../contexts/CodeViewBannersContext'
import {CurrentBlobProvider} from '../hooks/CurrentBlob'
import {CurrentTreeProvider, useCurrentTree} from '../hooks/CurrentTree'
import {forceAnnouncementToScreenReaders} from '../utilities/lines'
import {BlameBanners} from './blob/Banners/BlameBanners'
import BlobLowerBanners from './blob/Banners/BlobLowerBanners'
import BlobMidBanners from './blob/Banners/BlobMidBanners'
import BlobTopBanners from './blob/Banners/BlobTopBanners'
import {SpoofedCommitWarning} from './headers/SpoofedCommitWarning'
import {InterractionLimitsBanner} from './overview/banners/InterractionLimitsBanner'
import PendingInvitationBanner from './overview/banners/PendingInvitationBanner'
import {ProtectBranchBanner} from './overview/banners/ProtectBranchBanner'
import PublishBanners from './overview/banners/PublishBanners'
import {UseActionBanner} from './overview/banners/UseActionBanner'

export default function CodeViewBanners({payload}: {payload: FilePagePayload}) {
  if (isFileOverviewPayload(payload)) {
    return <OverviewBanners overview={payload.overview} />
  } else if (isTreePayload(payload)) {
    return <TreeBanners tree={payload.tree} />
  } else if (isBlobPayload(payload)) {
    return <BlobBanners blob={payload.blob} />
  }

  return null
}

function OverviewBanners({overview}: {overview: OverviewPayload}) {
  const {
    showUseActionBanner,
    showProtectBranchBanner,
    actionId,
    actionSlug,
    publishBannersInfo: {
      dismissActionNoticePath,
      dismissStackNoticePath,
      releasePath,
      showPublishActionBanner,
      showPublishStackBanner,
    },
    interactionLimitBanner,
    showInvitationBanner,
    inviterName,
  } = overview.banners
  const {helpUrl} = overview

  const hasBanners =
    interactionLimitBanner ||
    (showInvitationBanner && inviterName) ||
    showPublishActionBanner ||
    showPublishStackBanner ||
    (showUseActionBanner && actionSlug && actionId) ||
    showProtectBranchBanner

  return (
    <Box sx={{mb: hasBanners ? 3 : 0, display: 'flex', flexDirection: 'column', rowGap: 3}}>
      {interactionLimitBanner && <InterractionLimitsBanner interactionLimitBanner={interactionLimitBanner} />}
      {showInvitationBanner && inviterName && <PendingInvitationBanner inviterName={inviterName} />}
      <PublishBanners
        showPublishActionBanner={showPublishActionBanner}
        showPublishStackBanner={showPublishStackBanner}
        releasePath={releasePath}
        dismissActionNoticePath={dismissActionNoticePath}
        dismissStackNoticePath={dismissStackNoticePath}
        sx={{mt: 0}}
      />
      {showUseActionBanner && actionSlug && actionId && <UseActionBanner actionSlug={actionSlug} actionId={actionId} />}
      {showProtectBranchBanner && <ProtectBranchBanner helpUrl={helpUrl} rulesetsUpsell={overview.rulesetsUpsell} />}
    </Box>
  )
}

function TreeBanners({tree}: {tree: TreePayload}) {
  return (
    <CurrentTreeProvider payload={tree}>
      <SpoofedCommitWarning />
      <TruncatedTreeBanner />
      <CodeViewContextBanners />
    </CurrentTreeProvider>
  )
}

function BlobBanners({blob}: {blob: BlobPayload}) {
  return (
    <CurrentBlobProvider blob={blob}>
      <BlobTopBanners />
      <BlobMidBanners />
      <BlobLowerBanners />
      <BlameBanners />
      <CodeViewContextBanners />
    </CurrentBlobProvider>
  )
}

function TruncatedTreeBanner() {
  const {items, totalCount} = useCurrentTree()
  const omittedCount = totalCount - items.length
  return omittedCount > 0 ? (
    <Flash variant="warning" data-testid="repo-truncation-warning" sx={{mt: 3}}>
      Sorry, we had to truncate this directory to {items.length.toLocaleString()} files. {omittedCount.toLocaleString()}{' '}
      {omittedCount === 1 ? 'entry was' : 'entries were'} omitted from the list. Latest commit info may be omitted.
    </Flash>
  ) : null
}

function CodeViewContextBanners() {
  const banners = useCodeViewBanners()
  let messageToAnnounce = ''
  for (const b of banners) {
    messageToAnnounce += b.message
  }
  forceAnnouncementToScreenReaders(messageToAnnounce)
  return (
    <>
      {banners.map((b, i) => (
        <Flash key={i} variant={b.variant} sx={{mt: 3}}>
          {b.message}
        </Flash>
      ))}
    </>
  )
}

try{ CodeViewBanners.displayName ||= 'CodeViewBanners' } catch {}
try{ OverviewBanners.displayName ||= 'OverviewBanners' } catch {}
try{ TreeBanners.displayName ||= 'TreeBanners' } catch {}
try{ BlobBanners.displayName ||= 'BlobBanners' } catch {}
try{ TruncatedTreeBanner.displayName ||= 'TruncatedTreeBanner' } catch {}
try{ CodeViewContextBanners.displayName ||= 'CodeViewContextBanners' } catch {}