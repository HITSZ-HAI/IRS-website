import {Box} from '@primer/react'

import {useDeferredMetadata} from '../../../contexts/DeferredMetadataContext'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {SpoofedCommitWarning} from '../../headers/SpoofedCommitWarning'
import {BlobLicenseBanner} from './BlobLicenseBanner'
import {InvalidCitationWarning} from './InvalidCitationWarning'
import {OverridingGlobalFundingFileWarning} from './OverridingGlobalFundingFileWarning'

export default function BlobMidBanners() {
  const {
    topBannersInfo: {
      overridingGlobalFundingFile,
      globalPreferredFundingPath,
      showInvalidCitationWarning,
      citationHelpUrl,
    },
  } = useCurrentBlob()

  const {showLicenseMeta} = useDeferredMetadata()

  return (
    <Box>
      {showLicenseMeta && <BlobLicenseBanner />}
      {showInvalidCitationWarning && <InvalidCitationWarning citationHelpUrl={citationHelpUrl} />}
      <SpoofedCommitWarning />
      {overridingGlobalFundingFile && (
        <OverridingGlobalFundingFileWarning globalPreferredFundingPath={globalPreferredFundingPath} />
      )}
    </Box>
  )
}

try{ BlobMidBanners.displayName ||= 'BlobMidBanners' } catch {}