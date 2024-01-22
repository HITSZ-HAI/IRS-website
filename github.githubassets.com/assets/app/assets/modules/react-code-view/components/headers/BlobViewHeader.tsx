import type {DefinitionOrReference} from '@github-ui/code-nav'
import CopilotChatButton from '@github-ui/copilot-chat/CopilotChatButton'
import type {FileReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {Link} from '@github-ui/react-core/link'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useToastContext} from '@github-ui/toast'
import {useClientValue} from '@github-ui/use-client-value'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useNavigate} from '@github-ui/use-navigate'
import {
  CodeSquareIcon,
  CopyIcon,
  DownloadIcon,
  KebabHorizontalIcon,
  PencilIcon,
  TriangleDownIcon,
} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  Box,
  ButtonGroup,
  type ButtonProps,
  IconButton,
  Link as PrimerLink,
  LinkButton,
  Tooltip,
} from '@primer/react'
import {useMemo, useRef} from 'react'

// eslint-disable-next-line no-restricted-imports
import {copyText} from '../../../github/command-palette/copy'
import {useAlertTooltip} from '../../../react-shared/hooks/use-alert-tooltip'
import {ScreenReaderHeading} from '../../../react-shared/ScreenReaderHeading'
import {useFindInFileOpen} from '../../contexts/FindInFileOpenContext'
import {useCurrentBlame} from '../../hooks/CurrentBlame'
import {useCurrentBlob} from '../../hooks/CurrentBlob'
import {useFilesPageInfo, useReposAppPayload} from '../../hooks/FilesPageInfo'
import {useShortcut} from '../../hooks/shortcuts'
import {BlobDisplayType, useBlobRendererType} from '../../hooks/use-blob-renderer-type'
import {useCopyRawBlobContents} from '../../hooks/use-copy-raw-blob-contents'
import {setKeyboardNavUsed} from '../../hooks/use-cursor-navigation'
import {useReposAnalytics} from '../../hooks/use-repos-analytics'
import {trackStickyHeader, useStickyHeaderHeight} from '../../hooks/use-sticky-header-height'
import {useStickyObserver} from '../../hooks/use-sticky-observer'
import {useUpdatePanelExpandPreferences} from '../../hooks/use-update-panel-expand-preferences'
import {useUrlCreator} from '../../hooks/use-url-creator'
import type {PanelType} from '../../pages/CodeView'
import {type CopyState, getCopyStateUI} from '../../utilities/Copy'
import {textAreaId} from '../../utilities/lines'
import {linkButtonSx} from '../../utilities/styles'
import AccessibleIconButton from '../AccessibleIconButton'
import type {CodeNavData} from '../blob/BlobContent/BlobContent'
import type {CodeLineData} from '../blob/BlobContent/Code/hooks/use-code-lines'
import FindInFilePopover from '../blob/BlobContent/CodeNav/FindInFilePopover'
import {ContributorAvatars} from '../Contributors'
import {type CopilotInfo, CopilotPopover} from '../CopilotPopover'
import {DuplicateOnKeydownButton} from '../DuplicateOnKeydownButton'
import FileNameStickyHeader from './FileNameStickyHeader'
import BlameAgeLegend from './header-components/BlameAgeLegend'
import BlobTabButtons from './header-components/BlobTabButtons'
import CodeSizeDetails from './header-components/CodeSizeDetails'
import EditMenuActionItems from './header-components/EditMenuActionItems'
import {qualifyRef} from './header-components/NavigationMenu'
import {useHasOpenWithItems} from './header-components/OpenWithActionItems'
import RawMenuActionItems, {downloadFile} from './header-components/RawMenuActionItems'
import TableOfContents from './header-components/TableOfContents'
import {StickyLinesHeader} from './StickyLinesHeader'

export default function BlobViewHeader({
  openPanel,
  setOpenPanel,
  showTree,
  validCodeNav,
  treeToggleElement,
  searchTerm,
  setSearchTerm,
  currentStickyLines,
  focusedSearchResult,
  setFocusedSearchResult,
  searchResults,
  searchingText,
  stickyHeaderRef,
  copilotInfo,
}: {
  openPanel: PanelType | undefined
  setOpenPanel: (panel: PanelType | undefined) => void
  showTree: boolean
  validCodeNav: boolean
  treeToggleElement: JSX.Element
  currentStickyLines: Map<number, CodeLineData>
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  focusedSearchResult: number | undefined
  setFocusedSearchResult: (idx: number | undefined) => void
  searchResults: DefinitionOrReference[]
  searchingText: CodeNavData
  stickyHeaderRef: React.RefObject<HTMLDivElement>
  copilotInfo?: CopilotInfo
}) {
  const payload = useCurrentBlob()
  const isStickied = useStickyObserver(stickyHeaderRef)
  const {copilotAccessAllowed, refInfo, path} = useFilesPageInfo()
  const displayType = useBlobRendererType()
  const {sendRepoClickEvent} = useReposAnalytics()
  const stickyHeaderHeight = useStickyHeaderHeight()
  const {copyFilePathShortcut} = useShortcut()
  const {copyPermalinkShortcut} = useShortcut()
  const repository = useCurrentRepository()

  const {githubDevUrl} = useReposAppPayload()
  const {
    headerInfo: {toc, onBranch, ghDesktopPath},
    viewable,
  } = payload
  const hasOpenWithItem = useHasOpenWithItems(githubDevUrl, onBranch, ghDesktopPath)
  const isLfs = !!payload.headerInfo.gitLfsPath

  const blame = useCurrentBlame()

  const onCopy = useCopyRawBlobContents()
  const {createPermalink} = useUrlCreator()
  const {addToast} = useToastContext()

  const {findInFileOpen, setFindInFileOpen} = useFindInFileOpen()
  const rawActionsButtonRef = useRef(null)
  const [updateTooltipMessage, clearTooltipMessage, portalTooltip] = useAlertTooltip(
    'raw-actions-message-tooltip',
    rawActionsButtonRef,
    {direction: 'nw'},
  )
  const updateExpandPreferences = useUpdatePanelExpandPreferences()
  const {getUrl} = useUrlCreator()
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
      ref: qualifyRef(refInfo.name, refInfo.refType ?? 'branch'),
      commitOID: refInfo.currentOid,
    }),
    [
      fileUrl,
      path,
      repository.id,
      repository.ownerLogin,
      repository.name,
      refInfo.name,
      refInfo.refType,
      refInfo.currentOid,
    ],
  )

  return (
    <>
      <Box
        ref={trackStickyHeader}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          position: 'absolute',
        }}
      >
        <Box className="react-blob-sticky-header">
          <FileNameStickyHeader isStickied={isStickied} showTree={showTree} treeToggleElement={treeToggleElement} />
        </Box>
        <Box
          sx={{
            pl: 2,
            py: 2,
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'canvas.subtle',
            border: '1px solid var(--borderColor-default, var(--color-border-default))',
            borderRadius: isStickied ? '0px' : '6px 6px 0px 0px',
          }}
        >
          <ScreenReaderHeading as="h2" text="File metadata and controls" />
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2, minWidth: 0}}>
            <BlobTabButtons />
            <CodeSizeDetails className="react-code-size-details-in-header" />
            <CopilotPopover
              copilotInfo={copilotInfo}
              className="react-code-size-details-in-header"
              view={blame ? 'blame' : 'preview'}
            />
          </Box>

          <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mr: 2}}>
            {/* Copy link and permalink shortcut */}
            {copyFilePathShortcut.hotkey && (
              <KeyboardShortcut
                hotkey={copyFilePathShortcut.hotkey}
                onActivate={() => {
                  copyText(path)
                  addToast({
                    type: 'success',
                    message: 'Path copied!',
                  })
                }}
              />
            )}
            {copyPermalinkShortcut.hotkey && (
              <KeyboardShortcut
                hotkey={copyPermalinkShortcut.hotkey}
                onActivate={() => {
                  copyText(createPermalink({absolute: true}))
                  addToast({
                    type: 'success',
                    message: 'Permalink copied!',
                  })
                }}
              />
            )}

            <CopilotChatButton
              copilotAccessAllowed={copilotAccessAllowed}
              messageReference={fileReference}
              hideDropdown={true}
            />

            <Box className="react-blob-header-edit-and-raw-actions" sx={{gap: 2}}>
              <RawGroup onCopy={onCopy} fileName={payload.displayName} isLfs={isLfs} />
              <EditMenu />
            </Box>
            {displayType === BlobDisplayType.Code && !blame && validCodeNav && (
              <SymbolsButton
                isCodeNavOpen={openPanel === 'codeNav'}
                setCodeNavOpen={open => {
                  if (open) {
                    sendRepoClickEvent('BLOB_SYMBOLS_MENU.OPEN')
                  }
                  localStorage.setItem('codeNavOpen', open ? 'codeNav' : '')
                  updateExpandPreferences(null, open)
                  setOpenPanel(open ? 'codeNav' : undefined)
                }}
                size="small"
                searchingText={searchingText.selectedText}
              />
            )}
            {!blame && <TableOfContents toc={toc} openPanel={openPanel} setOpenPanel={setOpenPanel} />}

            <Box className="react-blob-header-edit-and-raw-actions-combined">
              {portalTooltip}
              <ActionMenu anchorRef={rawActionsButtonRef}>
                <ActionMenu.Anchor>
                  <IconButton
                    icon={KebabHorizontalIcon}
                    aria-label="Edit and raw actions"
                    className="js-blob-dropdown-click"
                    size={'small'}
                    sx={{color: 'fg.muted'}}
                    title="More file actions"
                    variant={'invisible'}
                    data-testid="more-file-actions-button"
                    onBlur={clearTooltipMessage}
                  />
                </ActionMenu.Anchor>
                <ActionMenu.Overlay
                  className="react-blob-header-edit-and-raw-actions-combined"
                  width="small"
                  sx={{maxHeight: '55vh', overflowY: 'auto'}}
                >
                  <ActionList>
                    {((refInfo.canEdit && viewable) || hasOpenWithItem) && (
                      <div className="react-navigation-menu-edit-and-raw-actions">
                        <EditMenuActionItems
                          editAllowed={refInfo.canEdit && viewable}
                          hasOpenWithItem={hasOpenWithItem}
                        />
                        <ActionList.Divider />
                      </div>
                    )}
                    <>
                      <RawMenuActionItems
                        viewable={viewable}
                        onCopy={onCopy}
                        name={payload.displayName}
                        updateTooltipMessage={updateTooltipMessage}
                        all
                      />
                    </>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </Box>
          </Box>
        </Box>
        {blame && (
          <Box
            sx={{
              px: '12px',
              py: 2,
              height: '44px',
              display: 'flex',
              flexShrink: 0,
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'border.default',
              borderTop: 0,
              justifyContent: 'space-between',
              backgroundColor: 'canvas.default',
            }}
          >
            <BlameAgeLegend />
            <ContributorAvatars />
          </Box>
        )}
      </Box>
      {findInFileOpen && (
        <FindInFilePopover
          stickied={isStickied}
          searchTerm={searchTerm}
          focusedSearchResult={focusedSearchResult}
          setFocusedSearchResult={setFocusedSearchResult}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          onClose={() => {
            setFindInFileOpen(false)
            if (openPanel === 'codeNav') {
              setSearchTerm(searchingText.selectedText)
            }
          }}
        />
      )}
      <Box>
        {!blame && currentStickyLines.size > 0 && (
          <Box
            sx={{
              zIndex: 1,
              background: 'var(--bgColor-default, var(--color-canvas-default))',
              top: stickyHeaderHeight,
              position: 'absolute',
              width: '100%',
              border: '1px solid var(--borderColor-default, var(--color-border-default))',
              borderBottom: 'none',
              borderTop: 'none',
              boxShadow: '0 1px 0 var(--borderColor-default, var(--color-border-default))',
              tableLayout: 'fixed',
            }}
          >
            <StickyLinesHeader currentStickyLines={currentStickyLines} />
          </Box>
        )}
      </Box>
    </>
  )
}

function EditMenu() {
  const payload = useCurrentBlob()
  const {getUrl} = useUrlCreator()
  const {
    refInfo: {canEdit},
  } = useFilesPageInfo()
  const {sendRepoClickEvent} = useReposAnalytics()
  const {githubDevUrl} = useReposAppPayload()
  const navigate = useNavigate()
  const {editFileShortcut, openWithGitHubDevShortcut, openWithGitHubDevInNewWindowShortcut} = useShortcut()

  const {
    headerInfo: {
      editInfo: {editTooltip},
      ghDesktopPath,
      onBranch,
    },
  } = payload

  const hasOpenWithItem = useHasOpenWithItems(githubDevUrl, onBranch, ghDesktopPath)
  if (!canEdit && !hasOpenWithItem) {
    return null
  }

  return (
    <>
      {githubDevUrl && (
        <>
          <PrimerLink
            className="js-github-dev-shortcut d-none"
            data-hotkey={openWithGitHubDevShortcut.hotkey}
            href={githubDevUrl}
          />
          <DuplicateOnKeydownButton
            buttonFocusId={textAreaId}
            buttonHotkey={openWithGitHubDevShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={() => {
              //need the pathname because the githubDevUrl is just the root, and cut off the first '/'
              navigate(githubDevUrl + window.location.pathname.substring(1))
            }}
          />
          <PrimerLink
            className="js-github-dev-new-tab-shortcut d-none"
            data-hotkey={openWithGitHubDevInNewWindowShortcut.hotkey}
            href={githubDevUrl}
            target="_blank"
          />
          <DuplicateOnKeydownButton
            buttonFocusId={textAreaId}
            buttonHotkey={openWithGitHubDevInNewWindowShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={() => {
              window.open(githubDevUrl, '_blank')
            }}
          />
        </>
      )}
      <ButtonGroup>
        <Tooltip direction="nw" text={editTooltip}>
          {canEdit ? (
            <IconButton
              as={Link}
              aria-label="Edit file"
              data-hotkey={editFileShortcut.hotkey}
              icon={PencilIcon}
              to={getUrl({action: 'edit'})}
              size="small"
              // wrapping in tooltip breaks button group styles, manually override borders for now
              sx={{...linkButtonSx, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0}}
              data-testid="edit-button"
            />
          ) : (
            <AccessibleIconButton
              icon={PencilIcon}
              // wrapping in tooltip breaks button group styles, manually override borders for now
              sx={{borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0}}
              aria-label="Edit file"
              disabled
            />
          )}
        </Tooltip>

        <ActionMenu onOpenChange={open => open && sendRepoClickEvent('BLOB_EDIT_DROPDOWN')}>
          <ActionMenu.Anchor>
            <IconButton
              icon={TriangleDownIcon}
              size="small"
              aria-label="More edit options"
              data-testid="more-edit-button"
            />
          </ActionMenu.Anchor>

          <ActionMenu.Overlay align="end">
            <ActionList>
              <EditMenuActionItems editAllowed={canEdit} hasOpenWithItem={hasOpenWithItem} />
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </ButtonGroup>
      {canEdit && (
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={'e,Shift+E'}
          onlyAddHotkeyScopeButton={true}
          onButtonClick={() => {
            navigate(getUrl({action: 'edit'}))
          }}
        />
      )}
    </>
  )
}

function RawGroup({onCopy, fileName, isLfs}: {onCopy: () => Promise<CopyState>; fileName: string; isLfs: boolean}) {
  const {viewRawContentShortcut, copyRawContentShortcut, downloadRawContentShortcut} = useShortcut()
  const {renderImageOrRaw, renderedFileInfo, viewable, image, rawBlobUrl} = useCurrentBlob()
  const navigate = useNavigate()
  const {addToast} = useToastContext()
  const copyButtonRef = useRef(null)
  const [updateTooltipMessage, clearTooltipMessage, portalTooltip] = useAlertTooltip(
    'raw-copy-message-tooltip',
    copyButtonRef,
  )
  const isOnlyPreviewable = !isLfs && ((renderedFileInfo && !viewable) || image)

  const lfsDownloadUrl = new URL(rawBlobUrl, ssrSafeLocation.origin)
  lfsDownloadUrl.searchParams.set('download', '')
  const downloadButtonProps = {
    ['aria-label']: 'Download raw content',
    icon: DownloadIcon,
    size: 'small',
    onClick: async () => {
      if (!isLfs) {
        await downloadFile(rawBlobUrl, fileName)
      }
    },
    ['data-testid']: 'download-raw-button',
    ['data-hotkey']: downloadRawContentShortcut.hotkey,
    // wrapping in tooltip breaks button group styles, manually override borders for now
    sx: {borderTopLeftRadius: 0, borderBottomLeftRadius: 0},
  } as const

  return isOnlyPreviewable ? (
    <>
      <Tooltip aria-label="Download raw file">
        <IconButton
          aria-label="Download raw content"
          icon={DownloadIcon}
          size="small"
          onClick={async () => {
            await downloadFile(rawBlobUrl, fileName)
          }}
          data-testid="download-raw-button"
          data-hotkey={downloadRawContentShortcut.hotkey}
        />
      </Tooltip>
      <DuplicateOnKeydownButton
        buttonTestLabel="download-raw-button-shortcut"
        buttonFocusId={textAreaId}
        buttonHotkey={downloadRawContentShortcut.hotkey}
        onlyAddHotkeyScopeButton={true}
        onButtonClick={async () => {
          await downloadFile(rawBlobUrl, fileName)
        }}
      />
    </>
  ) : (
    <>
      <ButtonGroup>
        <LinkButton
          href={rawBlobUrl}
          download={renderImageOrRaw ? 'true' : undefined}
          size="small"
          sx={{linkButtonSx, px: 2}}
          data-testid="raw-button"
          data-hotkey={viewRawContentShortcut.hotkey}
        >
          Raw
        </LinkButton>
        {!isLfs && (
          <>
            <IconButton
              ref={copyButtonRef}
              aria-label="Copy raw content"
              icon={CopyIcon}
              size="small"
              onFocus={() => updateTooltipMessage('Copy raw file')}
              onMouseEnter={() => updateTooltipMessage('Copy raw file')}
              onMouseLeave={clearTooltipMessage}
              onClick={async () => {
                const result = await onCopy()
                const {ariaLabel} = getCopyStateUI(result)
                updateTooltipMessage(ariaLabel)
              }}
              data-testid="copy-raw-button"
              data-hotkey={copyRawContentShortcut.hotkey}
              onBlur={clearTooltipMessage}
            />
            {portalTooltip}
          </>
        )}
        <Tooltip aria-label="Download raw file">
          {isLfs ? (
            <IconButton as="a" data-turbo="false" href={lfsDownloadUrl.toString()} {...downloadButtonProps} />
          ) : (
            <IconButton {...downloadButtonProps} />
          )}
        </Tooltip>
      </ButtonGroup>
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={viewRawContentShortcut.hotkey}
        buttonTestLabel="raw-button-shortcut"
        onlyAddHotkeyScopeButton={true}
        onButtonClick={() => navigate(rawBlobUrl)}
      />
      {!isLfs && (
        <>
          <DuplicateOnKeydownButton
            buttonTestLabel="copy-raw-button-shortcut"
            buttonFocusId={textAreaId}
            buttonHotkey={copyRawContentShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={async () => {
              const result = await onCopy()
              const {ariaLabel, content} = getCopyStateUI(result)
              addToast({
                message: ariaLabel,
                icon: content,
              })
            }}
          />
          <DuplicateOnKeydownButton
            buttonTestLabel="download-raw-button-shortcut"
            buttonFocusId={textAreaId}
            buttonHotkey={downloadRawContentShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={async () => {
              await downloadFile(rawBlobUrl, fileName)
            }}
          />
        </>
      )}
    </>
  )
}

function SymbolsButton({
  isCodeNavOpen,
  setCodeNavOpen,
  size,
  searchingText,
}: {
  isCodeNavOpen: boolean
  setCodeNavOpen: (isOpen: boolean) => void
  size?: ButtonProps['size']
  searchingText: string
}) {
  const {toggleSymbolsShortcut} = useShortcut()
  const shouldShowIndicator = !useCodeViewOptions().openSymbolsOption.enabled && !isCodeNavOpen

  return (
    <Tooltip direction="nw" text={isCodeNavOpen ? 'Close symbols panel' : 'Open symbols panel'}>
      <IconButton
        aria-label="Symbols"
        aria-pressed={isCodeNavOpen}
        aria-expanded={isCodeNavOpen}
        aria-controls="symbols-pane"
        icon={CodeSquareIcon}
        className={shouldShowIndicator && searchingText ? 'react-button-with-indicator' : ''}
        data-hotkey={toggleSymbolsShortcut.hotkey}
        onClick={() => {
          setKeyboardNavUsed(true)
          setCodeNavOpen(!isCodeNavOpen)
        }}
        variant="invisible"
        sx={{color: 'fg.muted', position: 'relative'}}
        data-testid="symbols-button"
        id="symbols-button"
        size={size}
      />
    </Tooltip>
  )
}

function KeyboardShortcut({hotkey, onActivate}: {hotkey: string; onActivate: () => void}) {
  return <DuplicateOnKeydownButton buttonFocusId={textAreaId} buttonHotkey={hotkey} onButtonClick={onActivate} />
}

try{ BlobViewHeader.displayName ||= 'BlobViewHeader' } catch {}
try{ EditMenu.displayName ||= 'EditMenu' } catch {}
try{ RawGroup.displayName ||= 'RawGroup' } catch {}
try{ SymbolsButton.displayName ||= 'SymbolsButton' } catch {}
try{ KeyboardShortcut.displayName ||= 'KeyboardShortcut' } catch {}