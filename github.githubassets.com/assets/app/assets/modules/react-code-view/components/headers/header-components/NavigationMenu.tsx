import type {FileReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {Link} from '@github-ui/react-core/link'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {useClientValue} from '@github-ui/use-client-value'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, IconButton} from '@primer/react'
import {useEffect, useMemo, useRef, useState} from 'react'
// useLocation is safe for files not rendered in a partial on the overview.
// eslint-disable-next-line no-restricted-imports
import {useLinkClickHandler, useLocation} from 'react-router-dom'

import {useAlertTooltip} from '../../../../react-shared/hooks/use-alert-tooltip'
import {useFindInFileOpen} from '../../../contexts/FindInFileOpenContext'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useFilesPageInfo, useReposAppPayload} from '../../../hooks/FilesPageInfo'
import {useShortcut} from '../../../hooks/shortcuts'
import {BlobDisplayType, useBlobRendererType} from '../../../hooks/use-blob-renderer-type'
import {useIsCursorEnabled} from '../../../hooks/use-cursor-navigation'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import {useUrlCreator} from '../../../hooks/use-url-creator'
import type {CopyState} from '../../../utilities/Copy'
import {KeyboardVisual} from '../../../utilities/KeyboardVisual'
import {textAreaId} from '../../../utilities/lines'
import {AllShortcutsEnabled} from '../../AllShortcutsEnabled'
import {GoToLineDialog, useWorkflowRedirectUrl} from '../../blob/BlobNavigationButtons'
import {DuplicateOnKeydownButton} from '../../DuplicateOnKeydownButton'
import {CopyPathsActionItems} from './../CodeViewHeader'
import CopilotMenuItems from './CopilotMenuItems'
import RawMenuActionItems from './RawMenuActionItems'
import SettingsMenuItems from './SettingsMenuItems'

export default function NavigationMenu({
  onCopy,
  validCodeNav,
  narrow,
}: {
  onCopy: () => Promise<CopyState>
  validCodeNav: boolean
  narrow?: boolean
}) {
  const payload = useCurrentBlob()
  const {
    action,
    path,
    refInfo: {canEdit, currentOid, name, refType},
  } = useFilesPageInfo()
  const {githubDevUrl} = useReposAppPayload()
  const {sendRepoClickEvent} = useReposAnalytics()

  const [isGoToLineDialogOpen, setGoToLineDialogOpen] = useState(false)

  const redirectUrl = useWorkflowRedirectUrl()
  const shouldDisplayViewRuns = redirectUrl !== null
  const {search} = useLocation()
  const urlParams = new URLSearchParams(search)

  const {setFindInFileOpen} = useFindInFileOpen()
  const cursorEnabled = useIsCursorEnabled()

  const shouldDisplayGoToLine = !(
    (payload.richText && !(urlParams.get('plain') === '1')) ||
    payload.renderImageOrRaw ||
    (payload.renderedFileInfo && !urlParams.get('short_path')) ||
    (payload.issueTemplate?.structured && payload.issueTemplate.valid)
  )
  const {
    headerInfo: {
      deleteInfo: {deleteTooltip},
      onBranch,
      siteNavLoginPath,
      lineInfo: {truncatedLoc},
    },
    loggedIn,
    viewable,
  } = payload

  const {getUrl} = useUrlCreator()
  const displayType = useBlobRendererType()
  const blameUrl = useRef('')

  useEffect(() => {
    blameUrl.current = getUrl({action: 'blame'})
  }, [getUrl])
  const {goToLineShortcut, findInFileShortcut, alternativeGoToLineShortcut} = useShortcut()
  const moreButtonRef = useRef(null)
  const [updateTooltipMessage, clearTooltipMessage, portalTooltip] = useAlertTooltip(
    'raw-copy-message-tooltip',
    moreButtonRef,
    {direction: 'nw'},
  )
  const copilotChatEnabled = useFeatureFlag('copilot_conversational_ux')
  const repository = useCurrentRepository()
  const blobUrl = getUrl()
  const [fileUrl] = useClientValue(() => window.location.origin + blobUrl, blobUrl)
  const fileReference: FileReference = useMemo(
    () => ({
      type: 'file',
      url: fileUrl,
      path,
      repoID: repository.id,
      repoOwner: repository.ownerLogin,
      repoName: repository.name,
      ref: qualifyRef(name, refType ?? 'branch'),
      commitOID: currentOid,
    }),
    [fileUrl, path, repository.id, repository.ownerLogin, repository.name, name, refType, currentOid],
  )

  return (
    <>
      {shouldDisplayGoToLine && (
        <>
          <DuplicateOnKeydownButton
            buttonFocusId={textAreaId}
            buttonHotkey={goToLineShortcut.hotkey}
            onButtonClick={() => setGoToLineDialogOpen(true)}
          />
          <DuplicateOnKeydownButton
            buttonFocusId={textAreaId}
            buttonHotkey={alternativeGoToLineShortcut.hotkey}
            onButtonClick={() => setGoToLineDialogOpen(true)}
          />
        </>
      )}
      <BlameButton blameUrl={blameUrl.current} viewable={viewable} hidden />
      {portalTooltip}
      <ActionMenu
        onOpenChange={open =>
          open &&
          sendRepoClickEvent('MORE_OPTIONS_DROPDOWN', {
            ['edit_enabled']: canEdit,
            ['github_dev_enabled']: !!githubDevUrl,
          })
        }
        anchorRef={moreButtonRef}
      >
        <ActionMenu.Anchor>
          <IconButton
            icon={KebabHorizontalIcon}
            aria-label="More file actions"
            className="js-blob-dropdown-click"
            size={'medium'}
            sx={{color: 'fg.muted'}}
            title="More file actions"
            variant={'default'}
            data-testid="more-file-actions-button"
            onBlur={clearTooltipMessage}
          />
        </ActionMenu.Anchor>

        <ActionMenu.Overlay width="small" sx={{maxHeight: '55vh', overflowY: 'auto'}}>
          <ActionList>
            {narrow && shouldDisplayViewRuns && (
              <>
                <ActionList.LinkItem href={redirectUrl}>View Runs</ActionList.LinkItem>
                <ActionList.Divider />
              </>
            )}

            <>
              <RawMenuActionItems
                viewable={viewable}
                onCopy={onCopy}
                name={payload.displayName}
                updateTooltipMessage={updateTooltipMessage}
              />
              <ActionList.Divider />
            </>

            <ActionList.Group>
              {shouldDisplayGoToLine && (
                <ActionList.Item
                  onSelect={() => {
                    sendRepoClickEvent('MORE_OPTIONS_DROPDOWN.GO_TO_LINE')
                    setGoToLineDialogOpen(true)
                  }}
                  aria-keyshortcuts={goToLineShortcut.hotkey}
                >
                  Jump to line
                  <ActionList.TrailingVisual aria-hidden="true">
                    <AllShortcutsEnabled>
                      <kbd>{goToLineShortcut.text}</kbd>
                    </AllShortcutsEnabled>
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              )}
              {displayType === BlobDisplayType.Code && payload.rawLines !== null && validCodeNav && !cursorEnabled && (
                <ActionList.Item
                  onSelect={() => {
                    sendRepoClickEvent('BLOB_FIND_IN_FILE_MENU.OPEN')
                    setFindInFileOpen(true)
                  }}
                  aria-keyshortcuts={findInFileShortcut.ariaKeyShortcuts}
                >
                  Find in file
                  <ActionList.TrailingVisual aria-hidden="true">
                    <KeyboardVisual shortcut={findInFileShortcut} />
                  </ActionList.TrailingVisual>
                </ActionList.Item>
              )}
            </ActionList.Group>
            {(shouldDisplayGoToLine ||
              (displayType === BlobDisplayType.Code && payload.rawLines !== null && validCodeNav)) && (
              <ActionList.Divider />
            )}
            <CopyPathsActionItems path={path} updateTooltipMessage={updateTooltipMessage} />
            <ActionList.Divider />
            {copilotChatEnabled && (
              <>
                <ActionList.Group title="Copilot">
                  <CopilotMenuItems fileReference={fileReference} />
                </ActionList.Group>
                <ActionList.Divider />
              </>
            )}
            <ActionList.Group title="View options">
              <SettingsMenuItems />
            </ActionList.Group>
            {((canEdit && onBranch) || (!viewable && onBranch)) && (
              <>
                <ActionList.Divider />
                <DeleteActionItem
                  deleteTooltip={deleteTooltip}
                  loggedIn={loggedIn}
                  siteNavLoginPath={siteNavLoginPath}
                />
              </>
            )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {isGoToLineDialogOpen && (
        <GoToLineDialog
          onBlamePage={action === 'blame'}
          onDismiss={() => {
            setGoToLineDialogOpen(false)
            //focus the text area so the cursor is visible at the start of the given line
            setTimeout(() => {
              const textAreaRef = document.getElementById(textAreaId)
              textAreaRef?.focus()
            }, 0)
          }}
          maxLineNumber={parseInt(truncatedLoc, 10) ?? undefined}
        />
      )}
    </>
  )
}

function BlameButton({blameUrl, viewable, hidden}: {blameUrl: string; viewable: boolean; hidden?: boolean}) {
  const {hash} = useLocation()
  const href = blameUrl + hash
  const onClick = useLinkClickHandler<HTMLButtonElement>(href)
  const hiddenSx = hidden ? {display: 'none'} : undefined
  const {viewBlameShortcut} = useShortcut()
  return viewable ? (
    <>
      <Button
        data-hotkey={viewBlameShortcut.hotkey}
        sx={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0, ...hiddenSx}}
        onClick={onClick}
      >
        Blame
      </Button>
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={viewBlameShortcut.hotkey}
        onButtonClick={onClick}
        onlyAddHotkeyScopeButton={true}
      />
    </>
  ) : null
}

function DeleteActionItem({
  deleteTooltip,
  loggedIn,
  siteNavLoginPath,
}: {
  deleteTooltip: string
  loggedIn: boolean
  siteNavLoginPath: string
}) {
  const {getUrl} = useUrlCreator()

  return (
    <ActionList.LinkItem
      as={Link}
      sx={{padding: 2, color: 'danger.fg', ':hover': {color: 'danger.fg'}}}
      aria-label={deleteTooltip}
      to={loggedIn ? getUrl({action: 'delete'}) : siteNavLoginPath}
    >
      Delete file
    </ActionList.LinkItem>
  )
}
export const qualifyRef = (ref: string, refType: 'branch' | 'tag' | 'tree') => {
  if (refType === 'branch') return `refs/heads/${ref}`
  if (refType === 'tag') return `refs/tags/${ref}`
  return ref
}

try{ NavigationMenu.displayName ||= 'NavigationMenu' } catch {}
try{ BlameButton.displayName ||= 'BlameButton' } catch {}
try{ DeleteActionItem.displayName ||= 'DeleteActionItem' } catch {}