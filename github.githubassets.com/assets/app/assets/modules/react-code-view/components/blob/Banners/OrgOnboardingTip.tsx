import {ownerPath, repositoryPath} from '@github-ui/paths'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {ScreenSize} from '@github-ui/screen-size'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {FileIcon} from '@primer/octicons-react'
import {Box, Breadcrumbs, Link, LinkButton, Octicon, Text} from '@primer/react'
import type {PropsWithChildren} from 'react'

import {linkButtonSx} from '../../../utilities/styles'

interface OrgOnboardingTipProps {
  mediaUrl?: string
  mediaPreviewSrc?: string
  iconSvg: SafeHTMLString
  taskTitle: string
  taskPath: string
  org: string
}

export function OrgOnboardingTip({
  children,
  mediaUrl,
  mediaPreviewSrc,
  iconSvg,
  taskTitle,
  taskPath,
  org,
}: PropsWithChildren<OrgOnboardingTipProps>) {
  return (
    <Box
      as="section"
      sx={{
        position: 'relative',
        display: 'flex',
        borderColor: 'border.muted',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: '6px',
        backgroundColor: 'canvas.subtle',
        p: 3,
        mt: 3,
      }}
    >
      <Box sx={{display: 'flex'}}>
        <SuggestIcon iconSvg={iconSvg} />

        <Box sx={{display: 'flex', flexDirection: 'column', ml: 3}}>
          <Breadcrumbs>
            <Breadcrumbs.Item href={ownerPath({owner: org})}>Tasks</Breadcrumbs.Item>
            <Breadcrumbs.Item href={taskPath} sx={{color: 'fg.default'}}>
              {taskTitle}
            </Breadcrumbs.Item>
          </Breadcrumbs>
          {children}
        </Box>
      </Box>
      <Media mediaPreviewSrc={mediaPreviewSrc} mediaUrl={mediaUrl} />
    </Box>
  )
}

function SuggestIcon({iconSvg}: {iconSvg: SafeHTMLString}) {
  return (
    <Box sx={{position: 'relative', maxHeight: 48}}>
      <SafeHTMLBox
        html={iconSvg}
        sx={{
          width: 48,
          height: 48,
          background:
            'radial-gradient(circle, rgba(141, 123, 255, 1) 0%, rgba(123, 133, 255, 1) 48%, rgba(141, 123, 255, 1) 85%, rgba(141, 123, 255, 1) 98%)',
          borderRadius: 2,
          p: 1,
          '& path': {fill: '#fff'},
        }}
      />
      <Bubble size={6} color="#6c84e9" bottom={-7} left={-7} />
      <Bubble size={4} color="#9e7bff" top={-4} right={4} />
      <Bubble size={6} color="#6c84e9" top={-7} right={-8} />
    </Box>
  )
}

function Bubble({
  size,
  color,
  left,
  right,
  top,
  bottom,
}: {
  size: number
  color: string
  left?: number
  right?: number
  top?: number
  bottom?: number
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        left: `${left}px`,
        right: `${right}px`,
        top: `${top}px`,
        bottom: `${bottom}px`,
        backgroundColor: color,
      }}
    />
  )
}

function Media({mediaUrl, mediaPreviewSrc}: Pick<OrgOnboardingTipProps, 'mediaUrl' | 'mediaPreviewSrc'>) {
  //on the server assume we are on mobile where an image rendering then disappearing would be far more annoying
  //than an image popping in on a desktop browser
  if ((ssrSafeWindow?.innerWidth ?? 0) < ScreenSize.xlarge || !mediaUrl || !mediaPreviewSrc) return null

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        background: 'center / contain no-repeat url(/images/modules/dashboard/onboarding/glow-1.png)',
        minWidth: 500,
      }}
      className={'org-onboarding-tip-media'}
    >
      <Link href={mediaUrl} sx={{display: 'flex', justifyContent: 'center'}}>
        <img src={mediaPreviewSrc} alt="Guidance" loading="lazy" style={{width: '50%', height: '50%'}} />
      </Link>
    </Box>
  )
}

interface ActionsOnboardingPromptProps {
  repo: string
  owner: string
}
export function ActionsOnboardingPrompt({repo, owner}: ActionsOnboardingPromptProps) {
  return (
    <Box>
      <Text as="h3" sx={{mb: 1}}>
        Auto-assign new issue with GitHub Actions
      </Text>
      <Box sx={{color: 'fg.muted'}}>
        <p>
          The <Text sx={{fontWeight: 600, fontFamily: 'monospace'}}>auto-assign.yml</Text> file below lives inside your{' '}
          <Text sx={{fontWeight: 600, fontFamily: 'monospace'}}>demo-repository</Text> and defines when and how it’s
          automatically triggered. This{' '}
          <a href="https://github.com/marketplace/actions/auto-assign-issues-prs" target="_blank" rel="noreferrer">
            “Auto Assign” workflow
          </a>{' '}
          happens to add reviewers and assignees to issues and pull requests when they’re opened in this repository.
        </p>

        <p>
          You can see the results of this workflow in any{' '}
          <a href={repositoryPath({owner, repo, action: 'issues'})}>issue</a> or{' '}
          <a href={repositoryPath({owner, repo, action: 'pulls'})}>pull request</a> that you create in this repository,
          as it’ll assign them to the specified members. And you can see a log of any workflows you run in{' '}
          <a href={repositoryPath({owner, repo, action: 'actions'})}>your repository’s “Actions” tab.</a>
        </p>

        <Box sx={{display: 'flex', alignItems: 'center', mt: 3}}>
          <LinkButton variant="primary" href={repositoryPath({owner, repo, action: 'issues/new'})} sx={linkButtonSx}>
            Create new issue to see results
          </LinkButton>

          <Link sx={{ml: 4}} href="https://docs.github.com/en/actions" target="_blank">
            <Octicon icon={FileIcon} sx={{mr: 1}} />
            Learn how automation works on GitHub
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

try{ OrgOnboardingTip.displayName ||= 'OrgOnboardingTip' } catch {}
try{ SuggestIcon.displayName ||= 'SuggestIcon' } catch {}
try{ Bubble.displayName ||= 'Bubble' } catch {}
try{ Media.displayName ||= 'Media' } catch {}
try{ ActionsOnboardingPrompt.displayName ||= 'ActionsOnboardingPrompt' } catch {}