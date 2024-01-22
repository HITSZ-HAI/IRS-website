import type {PlanSupportInfo} from '@github-ui/code-view-types'
import {Box, Button, Flash, Text} from '@primer/react'

export interface PlanSupportBannerProps extends PlanSupportInfo {
  feature?: string
  featureName?: string
}

export function PlanSupportBanner({
  feature,
  featureName,
  repoIsFork,
  repoOwnedByCurrentUser,
  requestFullPath,
  showFreeOrgGatedFeatureMessage,
  showPlanSupportBanner,
  upgradeDataAttributes,
  upgradePath,
}: PlanSupportBannerProps) {
  const dataAttributes: {[key: string]: string} = {}
  if (upgradeDataAttributes) {
    for (const key in upgradeDataAttributes) {
      dataAttributes[`data-${key}`] = upgradeDataAttributes[key]!
    }
  }
  return showPlanSupportBanner ? (
    <Flash variant="warning" sx={{mt: 3}}>
      {repoOwnedByCurrentUser ? (
        repoIsFork ? (
          `This repository is a fork, and inherits the features of the parent repository. Contact the owner of the root repository to enable ${
            featureName || 'this feature'
          }`
        ) : (
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Text sx={{flexGrow: 1}}>{`Upgrade to GitHub Pro or make this repository public to enable ${
              featureName || 'this feature'
            }.`}</Text>
            <UpgradeButton
              dataAttributes={dataAttributes}
              individual={true}
              requestFullPath={requestFullPath}
              feature={feature}
              upgradePath={upgradePath}
            />
          </Box>
        )
      ) : showFreeOrgGatedFeatureMessage ? (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Text sx={{flexGrow: 1}}>{`Upgrade to GitHub Team or make this repository public to enable ${
            featureName || 'this feature'
          }.`}</Text>
          <UpgradeButton
            dataAttributes={dataAttributes}
            individual={false}
            requestFullPath={requestFullPath}
            feature={feature}
            upgradePath={upgradePath}
          />
        </Box>
      ) : (
        `Contact the owner of the repository to enable ${featureName || 'this feature'}.`
      )}
    </Flash>
  ) : null
}

function UpgradeButton({
  dataAttributes,
  individual,
  requestFullPath,
  feature,
  upgradePath,
}: {
  dataAttributes: {[key: string]: string}
  individual: boolean
  requestFullPath: string
  feature?: string
  upgradePath: string
}) {
  return (
    <Button
      {...dataAttributes}
      data-ga-click={`Change ${
        individual ? 'individual' : 'organization'
      }, click to upgrade, ref_page:${requestFullPath};ref_cta:Upgrade now;ref_loc:${feature};location:${feature};text:Upgrade now`}
      onClick={() => {
        location.href = upgradePath
      }}
    >
      Upgrade now
    </Button>
  )
}

try{ PlanSupportBanner.displayName ||= 'PlanSupportBanner' } catch {}
try{ UpgradeButton.displayName ||= 'UpgradeButton' } catch {}