import {
  type FilePagePayload,
  isBlamePayload,
  isBlobPayload,
  isDeletePayload,
  isEditPayload,
  isFileOverviewPayload,
  isTreePayload,
} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {extractPathFromPathname} from '@github-ui/paths'
import {useNavigationError} from '@github-ui/react-core/use-navigation-error'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useDisableUserContentScrolling} from '@github-ui/use-disable-user-content-scrolling'
import {useHideFooter} from '@github-ui/use-hide-footer'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useNavigate} from '@github-ui/use-navigate'
import {Box, Heading, SplitPageLayout} from '@primer/react'
import React, {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'

// eslint-disable-next-line no-restricted-imports
import {getCookie, setCookie} from '../../github/cookies'
import {useCanonicalObject} from '../../react-shared/hooks/use-canonical-object'
import {useCurrentUser} from '../../react-shared/Repos/CurrentUser'
import {symbolsHeaderId} from '../components/blob/BlobContent/CodeNav/CodeNavSymbolNavigation'
import {ScrollMarksContainer} from '../components/blob/BlobContent/CodeNav/ScrollMarksContainer'
import {BlobViewContent} from '../components/BlobViewContent'
import CodeViewBanners from '../components/CodeViewBanners'
import {CodeViewError} from '../components/CodeViewError'
import {DeleteViewContent} from '../components/delete/DeleteViewContent'
import {DuplicateOnKeydownButton} from '../components/DuplicateOnKeydownButton'
import {ExpandFileTreeButton} from '../components/file-tree/ExpandFileTreeButton'
import {isSearchUrl} from '../components/file-tree/FilesSearchBox'
import {ReposFileTreePane, TreeOverlayBreakpoint} from '../components/file-tree/ReposFileTreePane'
import {FileTreeViewContent} from '../components/FileTreeViewContent'
import CodeViewHeader from '../components/headers/CodeViewHeader'
import {LoadingFallback} from '../components/SuspenseFallback'
import {CodeViewBannersProvider} from '../contexts/CodeViewBannersContext'
import {ContentSizeProvider} from '../contexts/ContentSizeContext'
import {DeferredMetadataProvider, useLoadDeferredMetadata} from '../contexts/DeferredMetadataContext'
import {FileQueryProvider} from '../contexts/FileQueryContext'
import {FindInFileOpenProvider} from '../contexts/FindInFileOpenContext'
import {OpenPanelProvider} from '../contexts/OpenPanelContext'
import {AllShortcutsEnabledProvider} from '../hooks/AllShortcutsEnabled'
import {type FilesPageAction, FilesPageInfoProvider} from '../hooks/FilesPageInfo'
import {RefreshTreeProvider} from '../hooks/RefreshTree'
import {useShortcut} from '../hooks/shortcuts'
import {useReposAnalytics} from '../hooks/use-repos-analytics'
import {useUpdatePanelExpandPreferences} from '../hooks/use-update-panel-expand-preferences'
import {useUrlCreator} from '../hooks/use-url-creator'
import {textAreaId} from '../utilities/lines'
import {extractFileTree, makeErrorPayload} from '../utilities/make-payload'

const BlobEditor = lazy(() => import('../components/blob-edit/BlobEditor'))

export type PanelType = 'codeNav' | 'toc'

export default function CodeView({initialPayload}: {initialPayload?: FilePagePayload}) {
  const payload = useFilePagePayload(initialPayload)
  const repo = useCurrentRepository()
  const {path} = payload
  const refInfo = useCanonicalObject(payload.refInfo)
  const isEdit = isEditPayload(payload)
  const isBlob = isBlobPayload(payload)
  const isBlame = isBlamePayload(payload)
  const isDelete = isDeletePayload(payload)
  const isOverview = 'overview' in payload
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null)
  const deferredMetadata = useLoadDeferredMetadata(repo, refInfo, path, payload.error?.httpStatus === 404)
  const refreshTree = React.useRef(false)
  const treeRef = React.useRef<HTMLDivElement>(null)
  // when user presses cmd+f6 this controls whether we focus the tree or the content
  const contentFocused = React.useRef(false)
  const textAreaFocused = React.useRef(false)
  // when we focus the content we can try to return focus to the element which previously had it
  const contentFocusTarget = React.useRef<HTMLElement | null>(null)
  // when we focus the tree we can try to return focus to the element which previously had it
  const treeFocusTarget = React.useRef<HTMLElement | null>(null)
  const reposFileTreeId = 'repos-file-tree'
  const openPanelRef = React.useRef<string | undefined>()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')

  const {toggleFocusedPaneShortcut} = useShortcut()
  function toggleFocus() {
    const symbolsPaneElement = document.getElementById(symbolsHeaderId)
    const textAreaElement = document.getElementById(textAreaId)
    if (document.activeElement?.id === textAreaId) {
      textAreaFocused.current = true
    }
    // the user may have moved focus from where we last put it
    if (contentRef?.contains(document.activeElement) && !textAreaFocused.current) {
      //the content (but not the text area) is focused
      contentFocused.current = true
    } else if (treeRef.current?.contains(document.activeElement)) {
      contentFocused.current = false
    }
    if (!contentFocused.current && !textAreaFocused.current) {
      // focus the text area
      const focusTarget = textAreaElement || contentRef
      treeFocusTarget.current = treeRef.current?.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null
      contentFocused.current = false
      focusTarget?.focus()
    } else if (textAreaFocused.current) {
      //focus the content
      const focusTarget = contentFocusTarget.current || symbolsPaneElement || contentRef
      contentFocused.current = true
      textAreaFocused.current = false
      focusTarget?.focus()
    } else {
      // focus the tree
      const focusTarget = treeFocusTarget.current || treeRef.current
      contentFocusTarget.current = contentRef?.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null
      contentFocused.current = false
      textAreaFocused.current = false
      focusTarget?.focus()
    }
  }

  // While this component is mounted, disable user automatic user content scrolling
  // based on the URL hash. This scrolling is handled by the individual components
  // that require it.
  useDisableUserContentScrolling()

  // While this component is mounted, hide the standard footer. The reason we
  // must do this in javascript is because the footer is retained across Turbo
  // navigations, so if we omit it in the controller, it may still be present
  // under some circumstances.
  useHideFooter(!isOverview)

  const fileTree = React.useMemo(
    () => extractFileTree(payload),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payload.path, payload.refInfo.currentOid],
  )

  const {isTreeExpanded, collapseTree, expandTree, treeToggleElement, treeToggleRef, searchBoxRef} = useTreePane(
    isOverview,
    reposFileTreeId,
    openPanelRef,
    payload.treeExpanded,
  )

  // When a tree item is selected, collapse the tree if the screen is small
  const onTreeItemSelected = useCallback(() => {
    if (window.innerWidth < ScreenSize.large) {
      collapseTree({focus: null})
    }
  }, [collapseTree])

  const [validCodeNav, setValidCodeNav] = useState(true)

  useEffect(() => {
    // scroll to top of code nav on file change if not going to a specific line and already scrolled down
    if (!window.location.hash && window.scrollY > 0) {
      const codeViewHeader = document.querySelector('#StickyHeader') as HTMLElement
      if (codeViewHeader) {
        codeViewHeader.style.position = 'relative'
        codeViewHeader.scrollIntoView()
        codeViewHeader.style.position = 'sticky'
      }
    }
  }, [payload.path])

  const {codeCenterOption} = useCodeViewOptions()

  const onFindFilesShortcut = React.useCallback(() => {
    if (window.innerWidth < ScreenSize.large) {
      if (isOverview) {
        navigate(`${window.location.pathname}?search=1`)
      } else {
        expandTree({focus: 'search'})
      }
    }
  }, [expandTree, isOverview, navigate])

  // Note: This is a hack to override primer's default styling on PageLayout.Content
  // We should remove this as soon as they update it to allow us to override a better way
  const overviewMediaQuery = isOverview
    ? {
        '@media screen and (min-width: 1440px)': {
          '> div': {
            mr: 4,
          },
        },
      }
    : {}

  let action: FilesPageAction

  if (isEdit) {
    if (payload.editInfo.isNewFile) {
      action = 'new'
    } else {
      action = 'edit'
    }
  } else if (isBlame) {
    action = 'blame'
  } else if (isBlob) {
    action = 'blob'
  } else {
    action = 'tree'
  }
  return (
    <DeferredMetadataProvider {...deferredMetadata}>
      <FilesPageInfoProvider
        refInfo={refInfo}
        path={path}
        action={action}
        copilotAccessAllowed={payload.copilotAccessAllowed ?? false}
      >
        <AllShortcutsEnabledProvider allShortcutsEnabled={payload.allShortcutsEnabled}>
          <RefreshTreeProvider refreshTree={refreshTree}>
            <PermalinkShortcut />
            <Box>
              <FileQueryProvider>
                <OpenPanelProvider payload={payload} openPanelRef={openPanelRef}>
                  <SplitPageLayout>
                    <Box ref={treeRef} tabIndex={0} sx={{width: ['100%', '100%', 'auto']}}>
                      {!isOverview && (
                        <ReposFileTreePane
                          id={reposFileTreeId}
                          repo={repo}
                          path={path}
                          isFilePath={isBlob || isEdit}
                          refInfo={refInfo}
                          collapseTree={collapseTree}
                          showTree={isTreeExpanded}
                          fileTree={fileTree}
                          onItemSelected={onTreeItemSelected}
                          processingTime={payload.fileTreeProcessingTime}
                          treeToggleElement={treeToggleElement}
                          treeToggleRef={treeToggleRef}
                          searchBoxRef={searchBoxRef}
                          foldersToFetch={payload.foldersToFetch}
                          isOverview={isOverview}
                          onFindFilesShortcut={onFindFilesShortcut}
                        />
                      )}
                    </Box>
                    <SplitPageLayout.Content
                      as="div"
                      padding="none"
                      width={codeCenterOption.enabled || isOverview ? 'xlarge' : 'full'}
                      hidden={{narrow: isTreeExpanded}}
                      sx={{
                        marginRight: isOverview ? 0 : 'auto',
                        '@media print': {
                          display: 'flex !important',
                        },
                        ...overviewMediaQuery,
                      }}
                    >
                      <Box
                        sx={{
                          marginLeft: 'auto',
                          marginRight: isOverview ? 0 : 'auto',
                          flexDirection: 'column',
                          pb: isOverview ? 3 : 6,
                          maxWidth: isOverview && !isTreeExpanded ? 1012 : '100%',
                          mt: isOverview ? 3 : 0,
                        }}
                        ref={setContentRef}
                        data-selector="repos-split-pane-content"
                        tabIndex={0}
                      >
                        <ContentSizeProvider contentRef={contentRef}>
                          <FindInFileOpenProvider
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            isBlame={isBlame}
                          >
                            <CodeViewBannersProvider>
                              <Box
                                sx={{
                                  display: isEdit ? 'none' : 'inherit',
                                }}
                              >
                                <CodeViewHeader
                                  payload={payload}
                                  showTree={isTreeExpanded}
                                  treeToggleElement={treeToggleElement}
                                  validCodeNav={validCodeNav}
                                  onFindFilesShortcut={onFindFilesShortcut}
                                />
                              </Box>
                              {payload.error ? (
                                <CodeViewError {...payload.error} />
                              ) : (
                                <>
                                  <Box
                                    className={!isOverview ? 'react-code-view-bottom-padding' : ''}
                                    sx={{
                                      mx: isOverview ? 0 : 3,
                                      '@media screen and (min-width: 1440px)': {
                                        ml: isOverview && !isTreeExpanded ? 0 : 3,
                                      },
                                    }}
                                  >
                                    <CodeViewBanners payload={payload} />
                                  </Box>
                                  <Box
                                    sx={{
                                      mx: isOverview ? 0 : 3,
                                      '@media screen and (min-width: 1440px)': {
                                        ml: isOverview && !isTreeExpanded ? 0 : 3,
                                      },
                                    }}
                                  >
                                    {isTreePayload(payload) ? (
                                      <FileTreeViewContent
                                        overview={isFileOverviewPayload(payload) ? payload.overview : undefined}
                                        tree={payload.tree}
                                        showTree={isTreeExpanded}
                                        treeToggleElement={isOverview ? null : treeToggleElement}
                                        onFindFilesShortcut={onFindFilesShortcut}
                                      />
                                    ) : isEditPayload(payload) ? (
                                      <Suspense fallback={<LoadingFallback />}>
                                        <BlobEditor
                                          collapseTree={collapseTree}
                                          editInfo={payload.editInfo}
                                          repo={payload.repo}
                                          showTree={isTreeExpanded}
                                          treeToggleElement={treeToggleElement}
                                          webCommitInfo={payload.webCommitInfo}
                                          copilotInfo={payload.copilotInfo}
                                        />
                                      </Suspense>
                                    ) : isBlob ? (
                                      <BlobViewContent
                                        blame={payload.blame}
                                        blob={payload.blob}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        setValidCodeNav={setValidCodeNav}
                                        showTree={isTreeExpanded}
                                        treeToggleElement={treeToggleElement}
                                        validCodeNav={validCodeNav}
                                        copilotInfo={payload.copilotInfo}
                                      />
                                    ) : isDelete ? (
                                      <DeleteViewContent
                                        deleteInfo={payload.deleteInfo}
                                        webCommitInfo={payload.webCommitInfo}
                                      />
                                    ) : null}
                                  </Box>
                                </>
                              )}
                            </CodeViewBannersProvider>
                          </FindInFileOpenProvider>
                        </ContentSizeProvider>
                      </Box>
                    </SplitPageLayout.Content>
                  </SplitPageLayout>
                </OpenPanelProvider>
              </FileQueryProvider>
              <ScrollMarksContainer />
              {/* TODO: make this focus on the cursor instead of just the blob as a whole */}
              <DuplicateOnKeydownButton
                buttonFocusId={textAreaId}
                buttonHotkey={toggleFocusedPaneShortcut.hotkey}
                onButtonClick={() => toggleFocus()}
              />
            </Box>
          </RefreshTreeProvider>
        </AllShortcutsEnabledProvider>
      </FilesPageInfoProvider>
    </DeferredMetadataProvider>
  )
}

function PermalinkShortcut() {
  const urlCreator = useUrlCreator()
  const {permalinkShortcut} = useShortcut()
  if (urlCreator.isCurrentPagePermalink()) {
    return (
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={permalinkShortcut.hotkey}
        buttonTestLabel={'header-permalink-button'}
        onlyAddHotkeyScopeButton={true}
        onButtonClick={() => {
          //no-op so that the user isn't moved to the bottom of the page while the text area has focus
        }}
      />
    )
  }

  return (
    <DuplicateOnKeydownButton
      buttonFocusId={textAreaId}
      buttonHotkey={permalinkShortcut.hotkey}
      buttonTestLabel={'header-permalink-button'}
      onButtonClick={() => {
        const permalink = urlCreator.createPermalink()
        if (window.location.href.indexOf(permalink) < 0) {
          window.history.pushState(null, document.title, permalink)
        }
      }}
    />
  )
}

function useFilePagePayload(initialPayload?: FilePagePayload): FilePagePayload {
  const routePayload = useRoutePayload<FilePagePayload>()
  let payload = initialPayload || routePayload
  // we assume that the first payload is always good
  const lastGoodPayload = useRef(payload)
  const error = useNavigationError()

  if (!payload) {
    const newPath = extractPathFromPathname(
      location.pathname,
      lastGoodPayload.current.refInfo.name,
      lastGoodPayload.current.path,
    )
    payload = makeErrorPayload(lastGoodPayload.current, error, newPath)
  } else {
    lastGoodPayload.current = payload
  }
  return payload
}

export type ExpandTreeFunction = (options?: {focus?: 'toggleButton' | 'search' | null; setCookie?: boolean}) => void
export type CollapseTreeFunction = (options?: {
  focus?: 'toggleButton' | null
  when?: 'medium'
  setCookie?: boolean
}) => void

interface TreePane {
  isTreeExpanded: boolean
  treeToggleElement: JSX.Element
  treeToggleRef: React.RefObject<HTMLButtonElement>
  searchBoxRef: React.RefObject<HTMLInputElement>
  expandTree: ExpandTreeFunction
  collapseTree: CollapseTreeFunction
}

function useTreePane(
  isOverview: boolean,
  reposFileTreeId: string,
  openPanelRef: React.MutableRefObject<string | undefined>,
  treeExpanded: boolean,
): TreePane {
  const {sendRepoClickEvent} = useReposAnalytics()
  const updateExpandPreferences = useUpdatePanelExpandPreferences()
  const currentUser = useCurrentUser()

  const fileTreeExpandedCookie = getCookie('fileTreeExpanded')
  const isSSR = !!(typeof ssrSafeDocument === 'undefined')
  // Only use the cookie if the user isn't logged in
  let initiallyExpanded =
    ((!currentUser && fileTreeExpandedCookie && fileTreeExpandedCookie.value !== 'false') ||
      (currentUser && treeExpanded)) &&
    !isOverview

  if (initiallyExpanded === undefined) {
    initiallyExpanded = false
  }

  if (isOverview && initiallyExpanded && !isSSR) {
    document.querySelector('.react-repos-overview-margin')?.classList.add('tree-open')
  }

  const treeToggleRef = useRef<HTMLButtonElement>(null)
  const searchBoxRef = useRef<HTMLInputElement>(null)
  const {screenSize} = useScreenSize()

  const [isTreeExpanded, setIsTreeExpanded] = useState(initiallyExpanded)
  // Keep track of the last state that was specifically requested by the user
  const lastStateIsExpanded = useRef(initiallyExpanded)
  const expandTreeCookieExpiration = 30 * 24 * 60 * 60 * 1000 // 30 days
  const expandedAsOverlay = useRef(false)
  const hasManuallyCollapsed = useRef(false)

  const showAsOverlay = useCallback(() => {
    return !(
      ((isOverview || openPanelRef.current) && window.innerWidth >= TreeOverlayBreakpoint) ||
      (!openPanelRef.current && window.innerWidth >= ScreenSize.xlarge)
    )
  }, [isOverview, openPanelRef])

  /**
   * With SSR, we need to make sure we get the correct initial state for the tree
   */
  useLayoutEffect(() => {
    const showingAsOverlay = showAsOverlay()
    if (!showingAsOverlay) {
      expandedAsOverlay.current = false
    }
    const shouldExpand =
      (isSearchUrl() && screenSize < ScreenSize.large && !hasManuallyCollapsed.current) ||
      ((!showingAsOverlay || expandedAsOverlay.current) &&
        ((currentUser && isTreeExpanded) || (!currentUser && fileTreeExpandedCookie?.value !== 'false')) &&
        !isOverview)
    setIsTreeExpanded(shouldExpand)
    // Don't retrigger when the tree expanded state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    expandedAsOverlay,
    fileTreeExpandedCookie?.value,
    screenSize,
    openPanelRef,
    isOverview,
    showAsOverlay,
    currentUser,
  ])

  /**
   * When the screen size shrinks below medium, collapse the tree if it is expanded.
   * When the screen size grows beyond medium, return the tree to its last state.
   */
  useLayoutEffect(() => {
    const shouldClose = !(isOverview || openPanelRef.current) && window.innerWidth < ScreenSize.xlarge
    const shouldOpen = !(isOverview || openPanelRef.current) && window.innerWidth >= ScreenSize.xlarge
    if (shouldClose && lastStateIsExpanded.current && !isSearchUrl() && isTreeExpanded) {
      setIsTreeExpanded(false)
    }

    if (shouldOpen && lastStateIsExpanded.current && !isTreeExpanded) {
      setIsTreeExpanded(true)
    }
    // Don't retrigger when the tree expanded state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverview, openPanelRef, screenSize])

  /**
   * When the screen size shrinks below large, collapse the tree if it is expanded.
   * When the screen size grows beyond large, return the tree to its last state.
   */
  useLayoutEffect(() => {
    const shouldClose = (isOverview || openPanelRef.current) && window.innerWidth < TreeOverlayBreakpoint
    const shouldOpen = (isOverview || openPanelRef.current) && window.innerWidth >= TreeOverlayBreakpoint
    if (shouldClose && lastStateIsExpanded.current && !isSearchUrl() && isTreeExpanded) {
      setIsTreeExpanded(false)
    }
    if (shouldOpen && lastStateIsExpanded.current && !isTreeExpanded) {
      setIsTreeExpanded(true)
    }
    // Don't retrigger when the tree expanded state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOverview, openPanelRef])

  const expandTree: ExpandTreeFunction = useCallback(
    options => {
      setIsTreeExpanded(true)
      if (showAsOverlay()) {
        expandedAsOverlay.current = true
      }

      if (options?.setCookie) {
        updateExpandPreferences(true, null)
        lastStateIsExpanded.current = true
        const expireTime = new Date(new Date().getTime() + expandTreeCookieExpiration).toUTCString()
        setCookie('fileTreeExpanded', 'true', expireTime)
      }

      if (options?.focus === 'toggleButton') {
        requestAnimationFrame(() => treeToggleRef.current?.focus())
      } else if (options?.focus === 'search') {
        requestAnimationFrame(() => searchBoxRef.current?.focus())
      }

      if (isOverview) {
        document.querySelector('.react-repos-overview-margin')?.classList.add('tree-open')
      }
    },
    [expandTreeCookieExpiration, isOverview, showAsOverlay, updateExpandPreferences],
  )

  const collapseTree: CollapseTreeFunction = useCallback(
    options => {
      setIsTreeExpanded(false)
      expandedAsOverlay.current = false
      hasManuallyCollapsed.current = true
      if (options?.setCookie) {
        updateExpandPreferences(false, null)
        lastStateIsExpanded.current = false
        const expireTime = new Date(new Date().getTime() + expandTreeCookieExpiration).toUTCString()
        setCookie('fileTreeExpanded', 'false', expireTime)
      }

      if (options?.focus === 'toggleButton') {
        requestAnimationFrame(() => treeToggleRef.current?.focus())
      }

      if (isOverview) {
        document.querySelector('.react-repos-overview-margin')?.classList.remove('tree-open')
      }
    },
    [expandTreeCookieExpiration, isOverview, updateExpandPreferences],
  )

  // This is SSR safe since it won't be called during SSR
  const shouldSetCookie = useCallback(
    (openPanel: string | undefined) => {
      return (
        ((isOverview || openPanel) && window.innerWidth >= TreeOverlayBreakpoint) ||
        (!openPanelRef.current && !isOverview && window.innerWidth >= ScreenSize.xlarge)
      )
    },
    [isOverview, openPanelRef],
  )

  const treeToggleElement = useMemo(
    () => (
      <Heading as="h2" sx={{fontSize: 1}}>
        <ExpandFileTreeButton
          expanded={isTreeExpanded}
          ariaControls={reposFileTreeId}
          onToggleExpanded={(event: React.MouseEvent<HTMLButtonElement>) => {
            sendRepoClickEvent(isTreeExpanded ? 'FILES_TREE.HIDE' : 'FILES_TREE.SHOW')
            // On the overview page, the toggle button isn't sticky, we don't want the user to lose the place
            // on the page to focuss it if they click
            isTreeExpanded
              ? collapseTree({
                  focus: isOverview && event.detail !== 0 ? undefined : 'toggleButton',
                  setCookie: shouldSetCookie(openPanelRef.current),
                })
              : expandTree({focus: 'toggleButton', setCookie: shouldSetCookie(openPanelRef.current)})
          }}
          className={
            fileTreeExpandedCookie === undefined && !isTreeExpanded && !isSSR
              ? 'react-tree-toggle-button-with-indicator'
              : undefined
          }
          ref={treeToggleRef}
        />
      </Heading>
    ),
    [
      isTreeExpanded,
      reposFileTreeId,
      fileTreeExpandedCookie,
      sendRepoClickEvent,
      collapseTree,
      isOverview,
      shouldSetCookie,
      openPanelRef,
      expandTree,
      isSSR,
    ],
  )

  return {
    isTreeExpanded,
    expandTree,
    collapseTree,
    treeToggleElement,
    treeToggleRef,
    searchBoxRef,
  }
}

try{ BlobEditor.displayName ||= 'BlobEditor' } catch {}
try{ CodeView.displayName ||= 'CodeView' } catch {}
try{ PermalinkShortcut.displayName ||= 'PermalinkShortcut' } catch {}