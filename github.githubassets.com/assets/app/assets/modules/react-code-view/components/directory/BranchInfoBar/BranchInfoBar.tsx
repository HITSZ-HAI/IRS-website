import {useCurrentRepository} from '@github-ui/current-repository'
import {Box, type SxProp} from '@primer/react'
import type React from 'react'

import {SkeletonText} from '../../../../react-shared/Skeleton'
import {useBranchInfoBar} from '../../../hooks/use-branch-infobar'
import {ContributeButton} from './ContributeButton'
import {FetchUpstreamButton} from './FetchUpstreamButton'
import {PullRequestLink} from './PullRequestLink'
import {RefComparisonText} from './RefComparisonText'

export function BranchInfoBar({sx}: SxProp) {
  const [infoBar, error] = useBranchInfoBar()
  const repo = useCurrentRepository()

  let content

  if (error === 'timeout') {
    content = <>Sorry, getting ahead/behind information for this branch is taking too long.</>
  } else if (!infoBar) {
    content = (
      <>
        <SkeletonText width="40%" />
        <SkeletonText width="30%" />
      </>
    )
  } else if (!infoBar.refComparison) {
    content = <>Cannot retrieve ahead/behind information for this branch.</>
  } else {
    content = (
      <>
        <RefComparisonText linkify repo={repo} comparison={infoBar.refComparison} />
        <Box sx={{display: 'flex', gap: 2}}>
          {infoBar.pullRequestNumber ? (
            <PullRequestLink repo={repo} pullRequestNumber={infoBar.pullRequestNumber} />
          ) : (
            <>
              {repo.currentUserCanPush && <ContributeButton comparison={infoBar.refComparison} />}
              {repo.isFork && repo.currentUserCanPush && <FetchUpstreamButton comparison={infoBar.refComparison} />}
            </>
          )}
        </Box>
      </>
    )
  }
  return (
    <BranchInfoBarContainer
      sx={{
        flexDirection: ['column', 'row'],
        alignItems: ['start', 'center'],
        justifyContent: 'space-between',
        border: 'solid 1px',
        borderColor: 'border.default',
        borderRadius: '6px',
        pl: 3,
        pr: 2,
        py: 2,
        mb: 3,
        ...sx,
      }}
    >
      {content}
    </BranchInfoBarContainer>
  )
}

function BranchInfoBarContainer({children, sx}: React.PropsWithChildren & SxProp) {
  return (
    <Box
      data-testid="branch-info-bar"
      aria-live="polite"
      sx={{
        display: 'flex',
        gap: 2,
        bg: 'canvas.subtle',
        fontSize: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

try{ BranchInfoBar.displayName ||= 'BranchInfoBar' } catch {}
try{ BranchInfoBarContainer.displayName ||= 'BranchInfoBarContainer' } catch {}