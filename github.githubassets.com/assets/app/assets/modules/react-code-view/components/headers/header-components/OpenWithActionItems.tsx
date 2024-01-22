import {useIsPlatform} from '@github-ui/use-is-platform'
import {ActionList} from '@primer/react'

import {useShortcut} from '../../../hooks/shortcuts'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {AllShortcutsEnabled} from '../../AllShortcutsEnabled'

export default function OpenWithActionItems({
  editEnabled,
  githubDevUrl,
  ghDesktopPath,
  onBranch,
}: {
  editEnabled: boolean
  githubDevUrl: string | null
  ghDesktopPath: string | null
  onBranch: boolean
}) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const isMacOrWindows = useIsPlatform(['windows', 'mac'])
  const {openWithGitHubDevShortcut} = useShortcut()
  return (
    <ActionList.Group title="Open with...">
      {
        // TODO: add support for codespaces here
      }
      {githubDevUrl ? (
        <ActionList.LinkItem
          onClick={() =>
            sendRepoClickEvent('BLOB_EDIT_DROPDOWN.DEV_LINK', {
              ['edit_enabled']: editEnabled,
            })
          }
          className="js-blob-dropdown-click js-github-dev-shortcut"
          href={githubDevUrl}
          data-hotkey={openWithGitHubDevShortcut.hotkey}
        >
          github.dev
          <ActionList.TrailingVisual aria-hidden="true">
            <AllShortcutsEnabled>
              <kbd>.</kbd>
            </AllShortcutsEnabled>
          </ActionList.TrailingVisual>
        </ActionList.LinkItem>
      ) : null}
      {onBranch && isMacOrWindows && ghDesktopPath ? (
        <ActionList.LinkItem onClick={() => sendRepoClickEvent('BLOB_EDIT_DROPDOWN.DESKTOP')} href={ghDesktopPath}>
          GitHub Desktop
        </ActionList.LinkItem>
      ) : null}
    </ActionList.Group>
  )
}

export function useHasOpenWithItems(githubDevUrl: string | null, onBranch: boolean, ghDesktopPath: string | null) {
  const isMacOrWindows = useIsPlatform(['windows', 'mac'])
  return !!(githubDevUrl || (onBranch && !isMacOrWindows && ghDesktopPath))
}

try{ OpenWithActionItems.displayName ||= 'OpenWithActionItems' } catch {}