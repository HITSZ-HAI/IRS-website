import {marketplaceActionPath} from '@github-ui/paths'
import {PlayIcon} from '@primer/octicons-react'
import {Box, Flash, LinkButton, Octicon, Text} from '@primer/react'

import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {linkButtonSx} from '../../../utilities/styles'

export function UseActionBanner({actionSlug, actionId}: {actionSlug: string; actionId: number}) {
  const {sendMarketplaceActionEvent} = useReposAnalytics()
  return (
    <Flash>
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
        <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
          <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Octicon icon={PlayIcon} size="small" />
            <Text sx={{fontWeight: 600}}>Use this GitHub action with your project</Text>
          </Box>
          <Text sx={{fontSize: 0}}>Add this Action to an existing workflow or create a new one</Text>
        </Box>
        <LinkButton
          href={marketplaceActionPath({slug: actionSlug})}
          sx={linkButtonSx}
          onClick={() =>
            sendMarketplaceActionEvent('MARKETPLACE.ACTION.CLICK', {
              // eslint-disable-next-line camelcase
              repository_action_id: actionId,
              // eslint-disable-next-line camelcase
              source_url: `${window.location}`,
              location: 'files#overview',
            })
          }
        >
          View on Marketplace
        </LinkButton>
      </Box>
    </Flash>
  )
}

try{ UseActionBanner.displayName ||= 'UseActionBanner' } catch {}