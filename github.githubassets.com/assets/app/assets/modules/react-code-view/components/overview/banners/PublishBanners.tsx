import {verifiedFetch} from '@github-ui/verified-fetch'
import {StackIcon, XIcon} from '@primer/octicons-react'
import {Box, Flash, IconButton, LinkButton, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useState} from 'react'

import {linkButtonSx} from '../../../utilities/styles'

export default function PublishBanners({
  showPublishActionBanner,
  showPublishStackBanner,
  releasePath,
  dismissActionNoticePath,
  dismissStackNoticePath,
  sx,
}: {
  showPublishActionBanner: boolean
  showPublishStackBanner: boolean
  releasePath: string
  dismissActionNoticePath: string
  dismissStackNoticePath: string
  sx?: BetterSystemStyleObject
}) {
  const [hidden, setHidden] = useState(false)

  const onDismissPublishAction = () => {
    verifiedFetch(dismissActionNoticePath, {method: 'POST'})
    setHidden(true)
  }

  const onDismissPublishStack = () => {
    verifiedFetch(dismissStackNoticePath, {method: 'POST'})
    setHidden(true)
  }

  return showPublishActionBanner || showPublishStackBanner ? (
    <Flash sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 3, ...sx}} hidden={hidden}>
      {showPublishActionBanner ? (
        <Box sx={{flexGrow: 1}}>You can publish this Action to the GitHub Marketplace</Box>
      ) : (
        <Box sx={{flexGrow: 1}}>
          <Box as="h5">
            <Octicon icon={StackIcon} />
            Publish this stack as a release
          </Box>
          <Box sx={{fontSize: 0}}>
            Make your stack discoverable in releases and the GitHub Marketplace. People will use it to create new
            repositories.
          </Box>
        </Box>
      )}
      <LinkButton href={releasePath} sx={{fontSize: 0, mr: 2, ...linkButtonSx}}>
        Draft a release
      </LinkButton>
      <IconButton
        icon={XIcon}
        aria-label="Dismiss"
        onClick={showPublishActionBanner ? onDismissPublishAction : onDismissPublishStack}
        sx={{backgroundColor: 'transparent', border: 0, pr: 0}}
        title="Dismiss"
      />
    </Flash>
  ) : null
}

try{ PublishBanners.displayName ||= 'PublishBanners' } catch {}