import type {InteractionLimitBanner} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repoAccessSettingsPath, repoContributorsPath} from '@github-ui/paths'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {CheckIcon, ClockIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, Flash, Label, Link, Octicon, Text} from '@primer/react'

export function InterractionLimitsBanner({interactionLimitBanner}: {interactionLimitBanner: InteractionLimitBanner}) {
  const repo = useCurrentRepository()

  let description

  if (interactionLimitBanner.usersHaveAccess) {
    description = 'Users that have recently created their account will be unable to interact with the repository.'
  } else if (interactionLimitBanner.contributorsHaveAccess) {
    description = (
      <>
        Users that have not previously <Link href={repoContributorsPath(repo)}>committed</Link> to the{' '}
        {repo.defaultBranch} branch of this repository will be unable to interact with the repository.
      </>
    )
  } else {
    description = (
      <>
        Users that are not <Link href={repoAccessSettingsPath(repo)}>collaborators</Link> will not be able to interact
        with the repository.
      </>
    )
  }

  return (
    <Flash>
      <Box>
        <Octicon icon={ClockIcon} sx={{mr: 1}} />
        <Text>{interactionLimitBanner.limitTitle}</Text>
        <Label variant="success" sx={{ml: 2}}>{`${interactionLimitBanner.currentExpiry} remaining`}</Label>
      </Box>
      <Box sx={{mt: 2, fontSize: 0}}>
        <Text>{description}</Text>
      </Box>
      <Box sx={{display: 'flex', my: 2, flexWrap: 'wrap', fontSize: 0}}>
        <RoleInteractionIndicator userRole="New users" access={false} />
        <RoleInteractionIndicator userRole="Users" access={interactionLimitBanner.usersHaveAccess} />
        <RoleInteractionIndicator userRole="Contributors" access={interactionLimitBanner.contributorsHaveAccess} />
        <RoleInteractionIndicator userRole="Collaborators" access={true} />
        {interactionLimitBanner.inOrganization && (
          <RoleInteractionIndicator userRole="Organization members" access={true} />
        )}
      </Box>
      {interactionLimitBanner.adminText && interactionLimitBanner.adminLink && interactionLimitBanner.disablePath && (
        <Box sx={{mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', fontSize: 0}}>
          <Button
            onClick={async () => {
              const formData = new FormData()
              formData.append('interaction_setting', 'NO_LIMIT')
              formData.append('_method', 'put')

              await verifiedFetch(interactionLimitBanner.disablePath!, {
                body: formData,
                method: 'POST',
                redirect: 'manual',
              })

              window.location.reload()
            }}
          >
            Disable
          </Button>
          <Box sx={{whiteSpace: 'pre'}}>
            &nbsp;or view&nbsp;
            <Link href={interactionLimitBanner.adminLink}>{interactionLimitBanner.adminText}</Link>
          </Box>
        </Box>
      )}
    </Flash>
  )
}

function RoleInteractionIndicator({userRole, access}: {userRole: string; access: boolean}) {
  return (
    <Box sx={{mr: 3, whiteSpace: 'pre'}}>
      <Octicon icon={access ? CheckIcon : XIcon} sx={{path: {color: access ? 'success.fg' : 'danger.fg'}}} />
      {userRole}
    </Box>
  )
}

try{ InterractionLimitsBanner.displayName ||= 'InterractionLimitsBanner' } catch {}
try{ RoleInteractionIndicator.displayName ||= 'RoleInteractionIndicator' } catch {}