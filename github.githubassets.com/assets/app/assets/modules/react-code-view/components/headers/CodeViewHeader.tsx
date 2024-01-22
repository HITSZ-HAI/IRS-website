import {
  type FileOverviewPayload,
  type FilePagePayload,
  isBlobPayload,
  isDeletePayload,
  isFileOverviewPayload,
  isTreePayload,
} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {useToastContext} from '@github-ui/toast'
import {useClientValue} from '@github-ui/use-client-value'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {KebabHorizontalIcon, PlusIcon, UploadIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, IconButton, Link as PrimerLink} from '@primer/react'
import {useRef} from 'react'

// eslint-disable-next-line no-restricted-imports
import {copyText} from '../../../github/command-palette/copy'
import {useAlertTooltip} from '../../../react-shared/hooks/use-alert-tooltip'
import {ScreenReaderHeading} from '../../../react-shared/ScreenReaderHeading'
import {CurrentBlobProvider} from '../../hooks/CurrentBlob'
import {useFilesPageInfo, useReposAppPayload} from '../../hooks/FilesPageInfo'
import {useShortcut} from '../../hooks/shortcuts'
import {useCopyRawBlobContents} from '../../hooks/use-copy-raw-blob-contents'
import {useReposAnalytics} from '../../hooks/use-repos-analytics'
import {useUrlCreator} from '../../hooks/use-url-creator'
import {KeyboardVisual} from '../../utilities/KeyboardVisual'
import {textAreaId} from '../../utilities/lines'
import {useWorkflowRedirectUrl} from '../blob/BlobNavigationButtons'
import {DeleteDirectoryItem} from '../directory/TreeOverflowMenu'
import {DuplicateOnKeydownButton} from '../DuplicateOnKeydownButton'
import FileResultsList from '../file-tree/FileResultsList'
import {AddFileDropdownButton} from './header-components/AddFileDropdownButton'
import {DeleteHeaderButtons} from './header-components/DeleteHeaderButtons'
import NavigationMenu from './header-components/NavigationMenu'
import {RecentlyTouchedBranches} from './header-components/RecentlyTouchedBranches'
import {OptionsElement} from './header-components/SettingsMenuItems'
import {ReposHeaderBreadcrumb} from './ReposHeaderBreadcrumb'
import {ReposHeaderRefSelector} from './ReposHeaderRefSelector'

export default function CodeViewHeader({
  payload,
  showTree,
  treeToggleElement,
  validCodeNav,
  onFindFilesShortcut,
}: {
  payload: FilePagePayload
  showTree: boolean
  treeToggleElement: JSX.Element
  validCodeNav: boolean
  onFindFilesShortcut?: () => void
}) {
  const onCopy = useCopyRawBlobContents()
  const isOverview = isFileOverviewPayload(payload)
  const {codeCenterOption} = useCodeViewOptions()
  const {githubDevUrl} = useReposAppPayload()
  const {openWithGitHubDevShortcut, openWithGitHubDevInNewWindowShortcut} = useShortcut()

  const goToFileInput = !showTree && (
    <FileResultsList onFindFilesShortcut={onFindFilesShortcut} useOverlay={true} sx={{mr: 1, ml: 1}} />
  )

  return isOverview ? (
    <OverviewHeader showTree={showTree} payload={payload} />
  ) : (
    <Box className="container" sx={{width: '100%'}}>
      <MobileCodeHeader
        showTree={showTree}
        treeToggleElement={treeToggleElement}
        payload={payload}
        validCodeNav={validCodeNav}
      />
      <Box sx={{p: 3, pb: 0, px: 3}} id="StickyHeader" className="react-code-view-header--wide">
        <Box sx={{display: 'flex', gap: 2, flexDirection: 'column', width: '100%'}}>
          <Box sx={{display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 2}}>
            {!showTree ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'start',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    display: 'block',
                    '@media screen and (min-width: 1360px)': {
                      display: codeCenterOption.enabled ? 'none' : 'block',
                    },
                    mr: 2,
                  }}
                >
                  {treeToggleElement}
                </Box>
                <Box sx={{mr: 2}}>
                  <ReposHeaderRefSelector
                    buttonClassName="ref-selector-class"
                    idEnding="repos-header-ref-selector-wide"
                  />
                </Box>
                <Box sx={{alignSelf: 'center', display: 'flex', px: 2, minWidth: 0}}>
                  <ReposHeaderBreadcrumb
                    id="repos-header-breadcrumb-wide"
                    fileNameId="file-name-id-wide"
                    showCopyPathButton={true}
                  />
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  alignSelf: 'center',
                  display: 'flex',
                  pr: 2,
                  minWidth: 0,
                }}
              >
                <ReposHeaderBreadcrumb
                  id="repos-header-breadcrumb-wide"
                  fileNameId="file-name-id-wide"
                  showCopyPathButton={true}
                />
              </Box>
            )}
            <Box sx={{minHeight: '32px', display: 'flex', alignItems: 'start'}}>
              <div className="d-flex gap-2">
                {isBlobPayload(payload) && (
                  <CurrentBlobProvider blob={payload.blob}>
                    <ViewRunsButton />
                    {goToFileInput}
                    <NavigationMenu onCopy={onCopy} validCodeNav={validCodeNav} />
                  </CurrentBlobProvider>
                )}
                {isTreePayload(payload) && (
                  <>
                    <ScreenReaderHeading as="h2" text="Directory actions" />
                    {goToFileInput}
                    <AddFileDropdownButton />
                    <TreeOverflowMenu />
                    <PrimerLink
                      className="js-github-dev-shortcut d-none"
                      data-hotkey={openWithGitHubDevShortcut.hotkey}
                      href={githubDevUrl}
                    />
                    <PrimerLink
                      className="js-github-dev-new-tab-shortcut d-none"
                      data-hotkey={openWithGitHubDevInNewWindowShortcut.hotkey}
                      href={githubDevUrl}
                      target="_blank"
                    />
                  </>
                )}
                {isDeletePayload(payload) && (
                  <DeleteHeaderButtons webCommitInfo={payload.webCommitInfo} isBlob={payload.deleteInfo.isBlob} />
                )}
              </div>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export function MobileCodeHeader({
  showTree,
  treeToggleElement,
  payload,
  validCodeNav,
}: {
  showTree: boolean
  treeToggleElement: JSX.Element | null
  payload: FilePagePayload
  validCodeNav: boolean
}) {
  const onCopy = useCopyRawBlobContents()
  const [isSSR] = useClientValue(() => false, true, [])

  /* on the server, the expanded value will purely be whatever their saved
  setting is, which might be expanded. On mobile widths we don't ever default to
  having the tree expanded, so on the server we need to just hard code it to
  show the regular not expanded version of everything*/
  return (
    <Box sx={{p: 3, pb: 0}} className="react-code-view-header--narrow">
      <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 3, width: '100%'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between'}}>
          {showTree && !isSSR ? (
            <Box sx={{alignSelf: 'center', display: 'flex', minWidth: 0}}>
              <ReposHeaderBreadcrumb
                id="repos-header-breadcrumb-mobile"
                fileNameId="file-name-id-mobile"
                showCopyPathButton={true}
              />
            </Box>
          ) : (
            treeToggleElement
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'start',
              justifyContent: 'space-between',
              justifySelf: 'flex-end',
            }}
          >
            {(!showTree || isSSR) && (
              <Box sx={{mx: 2}}>
                <ReposHeaderRefSelector
                  buttonClassName="ref-selector-class"
                  idEnding="repos-header-ref-selector-narrow"
                />
              </Box>
            )}
            {isBlobPayload(payload) ? (
              <CurrentBlobProvider blob={payload.blob}>
                <NavigationMenu onCopy={onCopy} validCodeNav={validCodeNav} narrow />
              </CurrentBlobProvider>
            ) : null}
            {isTreePayload(payload) ? (
              <>
                <ScreenReaderHeading as="h2" text="Directory actions" />
                <TreeOverflowMenu narrow />
              </>
            ) : isDeletePayload(payload) ? (
              <DeleteHeaderButtons webCommitInfo={payload.webCommitInfo} isBlob={payload.deleteInfo.isBlob} />
            ) : null}
          </Box>
        </Box>
        {(!showTree || isSSR) && (
          <Box sx={{justifySelf: 'end', maxWidth: '100%'}}>
            <ReposHeaderBreadcrumb
              id="repos-header-breadcrumb-mobile"
              fileNameId="file-name-id-mobile"
              showCopyPathButton={true}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

function OverviewHeader({showTree, payload}: {showTree: boolean; payload: FileOverviewPayload}) {
  const repo = useCurrentRepository()

  const {banners} = payload.overview

  return banners.recentlyTouchedDataChannel !== null ? (
    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pl: !showTree ? 0 : 3}}>
      <RecentlyTouchedBranches channel={banners.recentlyTouchedDataChannel} repo={repo} />
    </Box>
  ) : null
}

function TreeOverflowMenu({narrow}: {narrow?: boolean}) {
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const {sendRepoClickEvent} = useReposAnalytics()
  const {addToast} = useToastContext()
  const {createPermalink} = useUrlCreator()
  const {copyFilePathShortcut, copyPermalinkShortcut} = useShortcut()
  const {codeCenterOption} = useCodeViewOptions()
  const moreOptionsButtonRef = useRef(null)
  const [updateMessage, clearMessage, portalTooltip] = useAlertTooltip(
    'raw-copy-message-tooltip',
    moreOptionsButtonRef,
    {direction: 'nw'},
  )

  return (
    <>
      {/* Copy link and permalink shortcut */}
      {copyFilePathShortcut.hotkey && (
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={copyFilePathShortcut.hotkey}
          onButtonClick={() => {
            copyText(path)
            addToast({
              type: 'success',
              message: 'Path copied!',
            })
          }}
        />
      )}
      {copyPermalinkShortcut.hotkey && (
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={copyPermalinkShortcut.hotkey}
          onButtonClick={() => {
            copyText(createPermalink({absolute: true}))
            addToast({
              type: 'success',
              message: 'Permalink copied!',
            })
          }}
        />
      )}
      <ScreenReaderHeading as="h2" text="More options" />
      {portalTooltip}
      <ActionMenu
        onOpenChange={open => open && sendRepoClickEvent('MORE_OPTIONS_DROPDOWN')}
        anchorRef={moreOptionsButtonRef}
      >
        <ActionMenu.Anchor>
          <IconButton
            icon={KebabHorizontalIcon}
            aria-label="More options"
            size="medium"
            sx={{color: 'fg.muted'}}
            title="More options"
            data-testid="tree-overflow-menu-anchor"
            onBlur={clearMessage}
          />
        </ActionMenu.Anchor>

        <ActionMenu.Overlay width="small">
          <ActionList>
            {narrow && refInfo.canEdit && (
              <>
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
                <ActionList.Divider />
              </>
            )}
            <CopyPathsActionItems path={path} updateTooltipMessage={updateMessage} />
            {refInfo.canEdit && <ActionList.Divider />}
            <DeleteDirectoryItem />
            <ActionList.Divider />
            <ActionList.Group title="View options">
              <OptionsElement option={codeCenterOption} />
            </ActionList.Group>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}

export function CopyPathsActionItems({
  path,
  updateTooltipMessage,
}: {
  path: string
  updateTooltipMessage: (message: string) => void
}) {
  const {copyFilePathShortcut} = useShortcut()
  const {copyPermalinkShortcut} = useShortcut()
  const {sendRepoClickEvent} = useReposAnalytics()
  const {createPermalink} = useUrlCreator()
  return (
    <>
      <ActionList.Item
        onSelect={() => {
          sendRepoClickEvent('MORE_OPTIONS_DROPDOWN.COPY_PATH')
          copyText(path)
          updateTooltipMessage('Path copied!')
        }}
      >
        Copy path
        {copyFilePathShortcut.hotkey && (
          <ActionList.TrailingVisual aria-hidden="true">
            <KeyboardVisual shortcut={copyFilePathShortcut} />
          </ActionList.TrailingVisual>
        )}
      </ActionList.Item>
      <ActionList.Item
        onSelect={() => {
          sendRepoClickEvent('MORE_OPTIONS_DROPDOWN.COPY_PERMALINK')
          copyText(createPermalink({absolute: true}))
          updateTooltipMessage('Permalink copied!')
        }}
      >
        Copy permalink
        {copyPermalinkShortcut.hotkey && (
          <ActionList.TrailingVisual aria-hidden="true">
            <KeyboardVisual shortcut={copyPermalinkShortcut} />
          </ActionList.TrailingVisual>
        )}
      </ActionList.Item>
    </>
  )
}

function ViewRunsButton() {
  const redirectUrl = useWorkflowRedirectUrl()

  if (!redirectUrl) {
    return null
  }

  return (
    <Button as={Link} to={redirectUrl}>
      View Runs
    </Button>
  )
}

try{ CodeViewHeader.displayName ||= 'CodeViewHeader' } catch {}
try{ MobileCodeHeader.displayName ||= 'MobileCodeHeader' } catch {}
try{ OverviewHeader.displayName ||= 'OverviewHeader' } catch {}
try{ TreeOverflowMenu.displayName ||= 'TreeOverflowMenu' } catch {}
try{ CopyPathsActionItems.displayName ||= 'CopyPathsActionItems' } catch {}
try{ ViewRunsButton.displayName ||= 'ViewRunsButton' } catch {}