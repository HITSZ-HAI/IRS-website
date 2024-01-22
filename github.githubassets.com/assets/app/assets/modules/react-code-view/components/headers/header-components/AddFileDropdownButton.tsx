import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {PlusIcon, UploadIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton} from '@primer/react'

import {ScreenReaderHeading} from '../../../../react-shared/ScreenReaderHeading'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'

export function AddFileDropdownButton({useIcon}: {useIcon?: boolean}) {
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const {sendRepoClickEvent} = useReposAnalytics()

  if (!refInfo.canEdit) {
    return null
  }

  return (
    <>
      <ScreenReaderHeading as="h2" text="Add file" />
      <ActionMenu>
        {useIcon ? (
          <ActionMenu.Anchor>
            <IconButton icon={PlusIcon} aria-label="Add file" />
          </ActionMenu.Anchor>
        ) : (
          <ActionMenu.Button>Add file</ActionMenu.Button>
        )}
        <ActionMenu.Overlay sx={{maxHeight: '55vh', overflowY: 'auto'}}>
          <ActionList>
            <ActionList.LinkItem
              as={Link}
              onClick={() => sendRepoClickEvent('NEW_FILE_BUTTON')}
              to={repositoryTreePath({repo, path, commitish: refInfo.name, action: 'new'})}
            >
              <ActionList.LeadingVisual>
                <PlusIcon />
              </ActionList.LeadingVisual>
              Create new file
            </ActionList.LinkItem>
            <ActionList.LinkItem
              onClick={() => sendRepoClickEvent('UPLOAD_FILES_BUTTON')}
              href={repositoryTreePath({repo, path, commitish: refInfo.name, action: 'upload'})}
            >
              <ActionList.LeadingVisual>
                <UploadIcon />
              </ActionList.LeadingVisual>
              Upload files
            </ActionList.LinkItem>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}

try{ AddFileDropdownButton.displayName ||= 'AddFileDropdownButton' } catch {}