import {Link} from '@github-ui/react-core/link'
import {ActionList, Box} from '@primer/react'

import {AllShortcutsEnabled} from '../../../components/AllShortcutsEnabled'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useFilesPageInfo, useReposAppPayload} from '../../../hooks/FilesPageInfo'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {useUrlCreator} from '../../../hooks/use-url-creator'
import OpenWithActionItems from './OpenWithActionItems'

export default function EditMenuActionItems({
  editAllowed,
  hasOpenWithItem,
}: {
  editAllowed: boolean
  hasOpenWithItem: boolean
}) {
  const payload = useCurrentBlob()
  const {
    refInfo: {canEdit},
  } = useFilesPageInfo()
  const {githubDevUrl} = useReposAppPayload()
  const {sendRepoClickEvent} = useReposAnalytics()
  const {getUrl} = useUrlCreator()

  const {
    headerInfo: {ghDesktopPath, onBranch},
  } = payload

  return (
    <>
      {editAllowed && (
        <ActionList.Group title="Edit file">
          <ActionList.Item
            as={Link}
            onClick={() => sendRepoClickEvent('BLOB_EDIT_DROPDOWN.IN_PLACE')}
            to={getUrl({action: 'edit'})}
            aria-keyshortcuts="e"
          >
            <Box sx={{display: 'flex'}}>Edit in place</Box>
            <ActionList.TrailingVisual aria-hidden="true">
              <AllShortcutsEnabled>
                <kbd>e</kbd>
              </AllShortcutsEnabled>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        </ActionList.Group>
      )}
      {editAllowed && hasOpenWithItem && <ActionList.Divider />}
      {hasOpenWithItem && (
        <OpenWithActionItems
          editEnabled={canEdit}
          githubDevUrl={githubDevUrl}
          ghDesktopPath={ghDesktopPath}
          onBranch={onBranch}
        />
      )}
    </>
  )
}

try{ EditMenuActionItems.displayName ||= 'EditMenuActionItems' } catch {}