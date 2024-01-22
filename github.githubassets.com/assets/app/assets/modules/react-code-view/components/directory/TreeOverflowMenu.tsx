import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, Text} from '@primer/react'

import {useFilesPageInfo} from '../../hooks/FilesPageInfo'

export function TreeOverflowMenu() {
  const {refInfo} = useFilesPageInfo()
  if (!refInfo.canEdit) {
    return null
  }

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton icon={KebabHorizontalIcon} aria-label="More folder actions" title="More folder actions" />
      </ActionMenu.Anchor>

      <ActionMenu.Overlay>
        <ActionList>
          <DeleteDirectoryItem />
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export function DeleteDirectoryItem() {
  const repo = useCurrentRepository()
  const {path, refInfo} = useFilesPageInfo()

  if (!refInfo.canEdit) {
    return null
  }
  return (
    <ActionList.LinkItem
      as={Link}
      to={repositoryTreePath({repo, path, commitish: refInfo.name, action: 'tree/delete'})}
    >
      <Text sx={{color: 'danger.fg'}}>Delete directory</Text>
    </ActionList.LinkItem>
  )
}

try{ TreeOverflowMenu.displayName ||= 'TreeOverflowMenu' } catch {}
try{ DeleteDirectoryItem.displayName ||= 'DeleteDirectoryItem' } catch {}