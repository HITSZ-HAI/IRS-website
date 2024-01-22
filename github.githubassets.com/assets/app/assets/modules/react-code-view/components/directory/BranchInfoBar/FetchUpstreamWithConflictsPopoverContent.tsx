import type {RefComparison} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {newPullRequestPath} from '@github-ui/paths'
import {AlertIcon} from '@primer/octicons-react'
import {Button, Link, Text} from '@primer/react'

import {useDisabledWithLabel} from '../../../hooks/use-disabled-with-label'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {linkButtonSx} from '../../../utilities/styles'
import {syncForkButtonEventPayload} from './generate-button-event-payload'
import {getCommitsCountText} from './get-commits-count-text'
import {PopoverActions, PopoverContent, PopoverIcon} from './InfobarPopover'

interface Props {
  comparison: RefComparison
  discard: () => Promise<void>
}

export function FetchUpstreamWithConflictsPopoverContent({comparison, discard}: Props) {
  const repo = useCurrentRepository()
  const {sendRepoClickEvent} = useReposAnalytics()
  const createPullRequestPath = newPullRequestPath({repo, refName: comparison.currentRef})
  const commitsCountText = getCommitsCountText(comparison.ahead)

  const discardButton = useDisabledWithLabel(`Discard ${commitsCountText}`, 'Discarding changes...', discard)

  return (
    <>
      <PopoverContent
        icon={<PopoverIcon icon={AlertIcon} bg="neutral.emphasis" />}
        header="This branch has conflicts that must be resolved"
        content={
          <>
            <Text as="p">
              Discard {commitsCountText} to make this branch match the upstream repository. {commitsCountText} will be
              removed from this branch.
            </Text>
            <Text as="p">You can resolve merge conflicts using the command line and a text editor.</Text>
          </>
        }
      />
      <PopoverActions>
        <Button
          sx={{flex: 1}}
          onClick={discardButton.action}
          disabled={discardButton.disabled}
          data-testid="discard-button"
          variant="danger"
        >
          {discardButton.label}
        </Button>
        <Button
          as={Link}
          sx={{flex: 1, ...linkButtonSx}}
          href={createPullRequestPath}
          variant="primary"
          data-testid="open-pr-button"
          onClick={() =>
            sendRepoClickEvent('SYNC_FORK.OPEN_PR', {...syncForkButtonEventPayload, action: 'Open pull request'})
          }
        >
          Open pull request
        </Button>
      </PopoverActions>
    </>
  )
}

try{ FetchUpstreamWithConflictsPopoverContent.displayName ||= 'FetchUpstreamWithConflictsPopoverContent' } catch {}