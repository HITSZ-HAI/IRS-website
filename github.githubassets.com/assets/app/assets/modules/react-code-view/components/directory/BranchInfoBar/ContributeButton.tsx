import type {RefComparison} from '@github-ui/code-view-types'
import {GitPullRequestIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionMenu, Button} from '@primer/react'

import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {ContributePopoverContent} from './ContributePopoverContent'
import {PopoverContainer} from './InfobarPopover'

interface Props {
  comparison: RefComparison
}

export function ContributeButton({comparison}: Props) {
  const {sendRepoClickEvent} = useReposAnalytics()

  return (
    <ActionMenu
      onOpenChange={open =>
        open &&
        sendRepoClickEvent('CONTRIBUTE_BUTTON', {
          category: 'Branch Infobar',
          action: 'Open Contribute dropdown',
          label: 'ref_loc:contribute_dropdown',
        })
      }
    >
      <ActionMenu.Anchor>
        <Button leadingVisual={GitPullRequestIcon} trailingVisual={TriangleDownIcon}>
          Contribute
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay align="end" sx={{marginTop: 2}}>
        <PopoverContainer>
          <ContributePopoverContent comparison={comparison} />
        </PopoverContainer>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

try{ ContributeButton.displayName ||= 'ContributeButton' } catch {}