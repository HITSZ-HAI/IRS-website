import type {BranchRename} from '@github-ui/code-view-types'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {useCurrentRepository} from '@github-ui/current-repository'
import {dismissRepositoryNoticePathPath} from '@github-ui/paths'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Box, BranchName, Button, Heading, Link, Popover, Text} from '@primer/react'
import {useRef, useState} from 'react'

import {useCurrentUser} from '../../../../react-shared/Repos/CurrentUser'

export default function BranchRenamePopover({rename}: {rename: BranchRename}) {
  const [hidden, setHidden] = useState(false)
  const commandsRef = useRef<HTMLPreElement>(null)
  const currentUser = useCurrentUser()
  const repo = useCurrentRepository()

  const onDismissPopover = () => {
    if (!currentUser) return
    const dismissPath = dismissRepositoryNoticePathPath({login: currentUser.login})
    const form = new FormData()
    form.append('_method', 'delete')
    form.append('repository_id', repo.id.toString())
    form.append('notice_name', 'repo_default_branch_rename')
    verifiedFetch(dismissPath, {
      method: 'POST',
      body: form,
    })
    setHidden(true)
  }

  return (
    <Popover open={!hidden} caret="top-left" sx={{width: '480px', mt: '6px', ml: 1}}>
      <Popover.Content sx={{width: '480px', color: 'fg.default', fontSize: 1}}>
        <Heading as="h4" sx={{fontSize: 2, pb: 2}}>
          The default branch has been renamed!
        </Heading>
        <Text as="p">
          <BranchName>{rename.oldName}</BranchName> is now named{' '}
          <BranchName sx={{backgroundColor: 'accent.emphasis', color: 'fg.onEmphasis'}}>{rename.newName}</BranchName>
        </Text>
        <Text as="p" sx={{mb: 0}}>
          If you have a local clone, you can update it by running the following commands.
          {rename.shellEscapingDocsURL ? (
            <Link href={rename.shellEscapingDocsURL}>
              Learn about dealing with special characters on the command line.
            </Link>
          ) : null}
        </Text>
        <CopyToClipboardButton
          textToCopy={commandsRef.current?.textContent ?? ''}
          tooltipProps={{sx: {position: 'absolute', right: 3, top: '140px'}}}
        />
        <Box as="pre" sx={{py: '20px'}} ref={commandsRef}>
          {`git branch -m ${rename.shellOldName} ${rename.shellNewName}\ngit fetch origin\ngit branch -u ${rename.shellNewName} ${rename.shellNewName}\ngit remote set-head origin -a`}
        </Box>
        <Button onClick={onDismissPopover}>OK, got it</Button>
      </Popover.Content>
    </Popover>
  )
}

try{ BranchRenamePopover.displayName ||= 'BranchRenamePopover' } catch {}