import {SafeHTMLBox} from '@github-ui/safe-html'
import {CheckIcon, type Icon, InfoIcon, LawIcon, XIcon} from '@primer/octicons-react'
import {Box, Link, Octicon} from '@primer/react'

import {useDeferredMetadata} from '../../../contexts/DeferredMetadataContext'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'

export function BlobLicenseBanner() {
  const {
    topBannersInfo: {repoName, repoOwner},
  } = useCurrentBlob()
  const {license} = useDeferredMetadata()

  const iconMap: {[group: string]: {icon: Icon; color: string}} = {
    permissions: {icon: CheckIcon, color: 'success.fg'},
    limitations: {icon: XIcon, color: 'danger.fg'},
    conditions: {icon: InfoIcon, color: 'accent.fg'},
  }

  if (!license) return null

  return (
    <Box sx={{borderColor: 'border.default', borderStyle: 'solid', borderWidth: 1, borderRadius: '6px', mt: 3}}>
      <Box
        sx={{
          display: 'grid',
          px: 3,
          py: 1,
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 2,
        }}
        className={'blob-license-banner-outer'}
      >
        <Box sx={{display: 'flex', flex: '1', flexDirection: 'column', pr: 3}}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Octicon icon={LawIcon} size={32} />
            <Box sx={{display: 'flex', flexDirection: 'column', ml: 2}}>
              <Box sx={{fontSize: 0, color: 'fg.muted'}}>
                {`${repoOwner}/${repoName} is licensed under`}{' '}
                {license.name.toLowerCase().startsWith('the ') ? `` : ` the`}
              </Box>
              <Box as="h3">{license.name}</Box>
            </Box>
          </Box>
          <SafeHTMLBox html={license.description} sx={{fontSize: 0, color: 'fg.muted', mt: 2, flexWrap: 'wrap'}} />
        </Box>
        <Box sx={{display: 'flex', flex: '1'}}>
          {Object.keys(license.rules).map((group, index) => {
            return (
              <Box sx={{display: 'flex', flexDirection: 'column', flex: '1', pb: 3}} key={index}>
                <Box sx={{display: 'flex', mb: 2}} as="h5">
                  {group.charAt(0).toUpperCase() + group.substring(1)}
                </Box>
                {license.rules[group]!.map(rule => (
                  <Box key={rule.tag} sx={{fontSize: 0}}>
                    <Octicon icon={iconMap[group]!.icon} size={13} sx={{color: iconMap[group]!.color, mr: 1}} />
                    {rule.label}
                  </Box>
                ))}
              </Box>
            )
          })}
        </Box>
      </Box>
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'border.default',
          fontSize: 0,
          px: 3,
          py: 2,
        }}
      >
        This is not legal advice.&nbsp;
        <Link href={license.helpUrl}>Learn more about repository licenses</Link>
      </Box>
    </Box>
  )
}

try{ BlobLicenseBanner.displayName ||= 'BlobLicenseBanner' } catch {}