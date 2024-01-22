import type {RefComparison} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {comparePath, newPullRequestPath} from '@github-ui/paths'
import {GitPullRequestIcon} from '@primer/octicons-react'
import {BranchName, Button, Link, Text} from '@primer/react'

import {linkButtonSx} from '../../../utilities/styles'
import {PopoverActions, PopoverContent, PopoverIcon} from './InfobarPopover'
import {RefComparisonText} from './RefComparisonText'

interface Props {
  comparison: RefComparison
}

export function ContributePopoverContent({comparison}: Props) {
  const repo = useCurrentRepository()

  const isAhead = comparison.ahead > 0
  const aheadLink = comparePath({repo, base: comparison.baseBranchRange, head: comparison.currentRef})
  const createPullRequestPath = newPullRequestPath({repo, refName: comparison.currentRef})

  return (
    <>
      <PopoverContent
        icon={<PopoverIcon bg="neutral.emphasis" icon={GitPullRequestIcon} />}
        header={
          isAhead ? (
            <RefComparisonText repo={repo} comparison={{...comparison, behind: 0}} />
          ) : (
            <Text>
              This branch is not ahead of the upstream <BranchName as="span">{comparison.baseBranch}</BranchName>.
            </Text>
          )
        }
        content={
          <Text as="p">
            {isAhead
              ? 'Open a pull request to contribute your changes upstream.'
              : 'No new commits yet. Enjoy your day!'}
          </Text>
        }
      />
      {isAhead && (
        <PopoverActions>
          {!repo.isFork && (
            <Button as={Link} sx={{flex: 1, ...linkButtonSx}} href={aheadLink} data-testid="compare-button">
              Compare
            </Button>
          )}
          <Button
            as={Link}
            sx={{flex: 1, ...linkButtonSx}}
            href={createPullRequestPath}
            variant="primary"
            data-testid="open-pr-button"
          >
            Open pull request
          </Button>
        </PopoverActions>
      )}
    </>
  )
}

try{ ContributePopoverContent.displayName ||= 'ContributePopoverContent' } catch {}