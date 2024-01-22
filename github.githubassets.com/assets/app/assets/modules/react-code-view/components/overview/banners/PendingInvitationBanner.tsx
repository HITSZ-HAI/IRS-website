import {useCurrentRepository} from '@github-ui/current-repository'
import {invitationsPath, ownerPath, userHovercardPath} from '@github-ui/paths'
import {Box, Flash, Link, LinkButton} from '@primer/react'

import {linkButtonSx} from '../../../utilities/styles'

export default function PendingInvitationBanner({inviterName}: {inviterName: string}) {
  const {ownerLogin, name} = useCurrentRepository()

  return (
    <Flash>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <Box sx={{flexGrow: 1, alignItems: 'center'}}>
          <Link
            href={ownerPath({owner: inviterName})}
            data-hovercard-url={userHovercardPath({owner: inviterName})}
            sx={{color: 'fg.default', fontWeight: 'bold'}}
          >
            @{inviterName}
          </Link>
          &nbsp;has invited you to collaborate on this repository
        </Box>
        <>
          <LinkButton href={invitationsPath({owner: ownerLogin, repo: name})} sx={linkButtonSx}>
            View invitation
          </LinkButton>
        </>
      </Box>
    </Flash>
  )
}

try{ PendingInvitationBanner.displayName ||= 'PendingInvitationBanner' } catch {}