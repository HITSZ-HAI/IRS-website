import {useCurrentRepository} from '@github-ui/current-repository'
import {blobPath} from '@github-ui/paths'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Link, Octicon, PointerBox, Text} from '@primer/react'
import {useCallback} from 'react'

import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'

export function DependabotConfigurationBanner() {
  const {defaultBranch} = useCurrentRepository()
  const {
    refInfo: {name: currentRef},
  } = useFilesPageInfo()
  const {
    dependabotInfo: {showConfigurationBanner},
  } = useCurrentBlob()

  if (!showConfigurationBanner) return null

  const isDefaultBranch = defaultBranch === currentRef

  return isDefaultBranch ? <DefaultBranchDependabotConfigurationBanner /> : <DirectionsForNonDefaultBranch />
}

function DefaultBranchDependabotConfigurationBanner() {
  const {
    dependabotInfo: {
      configFilePath,
      networkDependabotPath,
      dismissConfigurationNoticePath,
      configurationNoticeDismissed,
    },
  } = useCurrentBlob()

  const dismissNotice = useCallback(
    () => verifiedFetch(dismissConfigurationNoticePath, {method: 'POST'}),
    [dismissConfigurationNoticePath],
  )

  if (configurationNoticeDismissed) return null

  return (
    <Box sx={{position: 'absolute', zIndex: 2, left: '50%', transform: 'translate(-50%, 0)'}}>
      <PointerBox caret="top" sx={{backgroundColor: 'canvas.overlay', width: 300, p: 3}}>
        <Text as="h5" sx={{mb: 1}}>
          Dependabot
        </Text>
        <Text as="p" sx={{mb: 3}}>
          Dependabot creates pull requests to keep your dependencies secure and up-to-date.
        </Text>
        <Text as="p" sx={{mb: 3}}>
          You can opt out at any time by removing the <code>{configFilePath}</code> config file.
        </Text>
        <Box sx={{display: 'flex'}}>
          <Button as="a" href={networkDependabotPath}>
            View update status
          </Button>
          <Button variant="invisible" sx={{color: 'fg.muted', ml: 2}} onClick={dismissNotice}>
            Dismiss
          </Button>
        </Box>
      </PointerBox>
    </Box>
  )
}

function DirectionsForNonDefaultBranch() {
  const {defaultBranch, name, ownerLogin} = useCurrentRepository()
  const {path} = useFilesPageInfo()
  const defaultBranchPath = blobPath({owner: ownerLogin, repo: name, commitish: defaultBranch, filePath: path})
  return (
    <Flash variant="warning">
      <Text as="h5">
        <Octicon icon={AlertIcon} />
        Cannot configure Dependabot
      </Text>
      <Text as="p">
        To configure Dependabot, you must use{' '}
        <Link href={defaultBranchPath}>this repository&apos;s default branch</Link>
      </Text>
    </Flash>
  )
}

try{ DependabotConfigurationBanner.displayName ||= 'DependabotConfigurationBanner' } catch {}
try{ DefaultBranchDependabotConfigurationBanner.displayName ||= 'DefaultBranchDependabotConfigurationBanner' } catch {}
try{ DirectionsForNonDefaultBranch.displayName ||= 'DirectionsForNonDefaultBranch' } catch {}