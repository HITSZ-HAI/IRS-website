import {useCurrentRepository} from '@github-ui/current-repository'
import {Box} from '@primer/react'

import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {DependabotConfigurationBanner} from './DependabotConfigurationBanner'
import {ActionsOnboardingPrompt, OrgOnboardingTip} from './OrgOnboardingTip'
import {PlanSupportBanner} from './PlanSupportBanner'

export default function BlobTopBanners() {
  const {planSupportInfo, topBannersInfo} = useCurrentBlob()
  const {actionsOnboardingTip} = topBannersInfo
  const repo = useCurrentRepository()

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <PlanSupportBanner {...planSupportInfo} feature="codeowners" featureName="CODEOWNERS" />
      <DependabotConfigurationBanner />
      {actionsOnboardingTip && (
        <OrgOnboardingTip
          iconSvg={actionsOnboardingTip.iconSvg}
          mediaPreviewSrc={actionsOnboardingTip.mediaPreviewSrc}
          mediaUrl={actionsOnboardingTip.mediaUrl}
          taskTitle={actionsOnboardingTip.taskTitle}
          taskPath={actionsOnboardingTip.taskPath}
          org={actionsOnboardingTip.orgName}
        >
          <ActionsOnboardingPrompt owner={repo.ownerLogin} repo={repo.name} />
        </OrgOnboardingTip>
      )}
    </Box>
  )
}

try{ BlobTopBanners.displayName ||= 'BlobTopBanners' } catch {}