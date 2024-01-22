import {useCurrentRepository} from '@github-ui/current-repository'
import {dismissRepositoryNoticePathPath, repositoryPath} from '@github-ui/paths'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {BranchName, Button, Heading, Link, Popover, Text} from '@primer/react'
import {useState} from 'react'

import {useCurrentUser} from '../../../../react-shared/Repos/CurrentUser'

export default function ParentBranchRenamePopover({
  branchName,
  nameWithOwner,
}: {
  branchName: string
  nameWithOwner: string
}) {
  const [hidden, setHidden] = useState(false)
  const currentUser = useCurrentUser()
  const repo = useCurrentRepository()

  const onDismissPopover = () => {
    if (!currentUser) return
    const dismissPath = dismissRepositoryNoticePathPath({login: currentUser.login})
    const form = new FormData()
    form.append('_method', 'delete')
    form.append('repository_id', repo.id.toString())
    form.append('notice_name', 'repo_parent_default_branch_rename')
    verifiedFetch(dismissPath, {
      method: 'POST',
      body: form,
    })
    setHidden(true)
  }

  return (
    <Popover open={!hidden} caret="top-left" sx={{width: '530px', mt: '6px', ml: 1}}>
      <Popover.Content sx={{width: '530px', color: 'fg.default', fontSize: 1}}>
        <Heading as="h4" sx={{fontSize: 2, pb: 2}}>
          The default branch on the parent repository has been renamed!
        </Heading>
        <Text as="p">
          <BranchName>{nameWithOwner}</BranchName> renamed its default branch{' '}
          <BranchName sx={{backgroundColor: 'accent.emphasis', color: 'fg.onEmphasis'}}>{branchName}</BranchName>
        </Text>
        <Text as="p">
          You can rename this fork&apos;s default branch to match in{' '}
          <Link href={repositoryPath({owner: repo.ownerLogin, repo: repo.name, action: 'settings'})}>
            branch settings
          </Link>
        </Text>
        <Button onClick={onDismissPopover}>OK, got it</Button>
      </Popover.Content>
    </Popover>
  )
}

try{ ParentBranchRenamePopover.displayName ||= 'ParentBranchRenamePopover' } catch {}