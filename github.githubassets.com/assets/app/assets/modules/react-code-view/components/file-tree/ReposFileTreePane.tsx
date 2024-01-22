import type {DirectoryItem, ReposFileTreeData} from '@github-ui/code-view-types'
import type {Repository} from '@github-ui/current-repository'
import {sendEvent} from '@github-ui/hydro-analytics'
import {repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import type {RefInfo} from '@github-ui/repos-types'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {useClientValue} from '@github-ui/use-client-value'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {scrollIntoView} from '@primer/behaviors'
import {AlertFillIcon, PlusIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, Octicon, Overlay, SplitPageLayout, Tooltip} from '@primer/react'
import React, {useMemo} from 'react'
import {createHtmlPortalNode, InPortal, OutPortal} from 'react-reverse-portal'

import type {TreeItem} from '../../../react-shared/Tree'
import SearchButton from '../../components/headers/header-components/SearchButton'
import {ReposHeaderRefSelector} from '../../components/headers/ReposHeaderRefSelector'
import {useFileQueryContext} from '../../contexts/FileQueryContext'
import FileTreeContext from '../../contexts/FileTreeContext'
import {useOpenPanel} from '../../contexts/OpenPanelContext'
import {useUrlCreator} from '../../hooks/use-url-creator'
import type {CollapseTreeFunction} from '../../pages/CodeView'
import FileResultsList from './FileResultsList'
import {buildReposFileTree, ReposFileTreeView} from './ReposFileTreeView'

export const TreeOverlayBreakpoint = ScreenSize.xxxlarge

export function ReposFileTreePane({
  collapseTree,
  showTree,
  fileTree,
  treeToggleElement,
  treeToggleRef,
  onItemSelected,
  processingTime,
  searchBoxRef,
  repo,
  path,
  refInfo,
  isFilePath,
  foldersToFetch,
  isOverview,
  id,
  onFindFilesShortcut,
}: {
  collapseTree: CollapseTreeFunction
  showTree: boolean
  fileTree: ReposFileTreeData
  onItemSelected: () => void
  processingTime: number
  treeToggleElement: JSX.Element
  treeToggleRef: React.RefObject<HTMLButtonElement>
  searchBoxRef: React.RefObject<HTMLInputElement>
  repo: Repository
  path: string
  refInfo: RefInfo
  isFilePath: boolean
  foldersToFetch: string[]
  isOverview: boolean
  id: string
  onFindFilesShortcut: () => void
}) {
  const {openPanel} = useOpenPanel()
  const [treeLoading, setTreeLoading] = React.useState(foldersToFetch.length > 0)
  const [fetchError, setFetchError] = React.useState(false)
  const fetchedFolders = React.useRef<string[]>([])
  const scrollingRef = React.useRef<HTMLDivElement | null>(null)
  const hasAttemptedToFetchFolders = React.useRef(false)
  const ignoreNextScroll = React.useRef(false)
  const selectedElement = React.useRef<HTMLElement | null>(null)
  const {getItemUrl} = useUrlCreator()
  const {query} = useFileQueryContext()
  const {codeCenterOption} = useCodeViewOptions()
  const lastOpenPanel = React.useRef(openPanel)
  const [isSSR] = useClientValue(() => false, true, [])

  let initialRenderRootItems: Array<TreeItem<DirectoryItem>> = []
  const newKnownFolders = new Map<string, TreeItem<DirectoryItem>>()

  const hasDoneInitialRender = React.useRef(treeLoading)
  if (!hasDoneInitialRender.current && fileTree) {
    const newKnownRootItems: Array<TreeItem<DirectoryItem>> = []
    const resultingTree = buildReposFileTree(fileTree, newKnownFolders, newKnownRootItems)
    initialRenderRootItems = resultingTree.newRootItems
  }
  hasDoneInitialRender.current = true
  const [knownFolders, dispatchKnownFolders] = React.useReducer(knownFolderReducer, newKnownFolders)
  const [rootItems, setRootItems] = React.useState<Array<TreeItem<DirectoryItem>>>(initialRenderRootItems)

  React.useEffect(() => {
    if (!showTree || !(!query || window.innerWidth >= ScreenSize.large)) {
      selectedElement.current = null
    }
  }, [showTree, query])

  React.useEffect(() => {
    if (openPanel && lastOpenPanel.current !== openPanel && window.innerWidth < TreeOverlayBreakpoint) {
      collapseTree({setCookie: false})
    }
    lastOpenPanel.current = openPanel
  }, [collapseTree, openPanel])

  const fetchFolder = React.useCallback(
    async (folderPath: string) => {
      const folder: DirectoryItem = {contentType: 'directory', path: folderPath, name: folderPath}
      const contentUrl = getItemUrl(folder)
      try {
        const response = await verifiedFetchJSON(`${contentUrl}?noancestors=1`)
        if (response.ok) {
          const folderPayload = await response.json()
          const folderData = {
            items: folderPayload.payload.tree.items,
            totalCount: folderPayload.payload.tree.totalCount,
          }
          fileTree[folderPath] = folderData
        } else {
          setFetchError(true)
        }
      } catch {
        setFetchError(true)
      }
      fetchedFolders.current.push(folderPath)
      if (fetchedFolders.current.length === foldersToFetch.length) {
        setTreeLoading(false)
      }
    },
    [fileTree, foldersToFetch.length, getItemUrl],
  )

  React.useEffect(() => {
    if (foldersToFetch && !hasAttemptedToFetchFolders.current) {
      for (const folder of foldersToFetch) {
        fetchFolder(folder)
      }
    }
    hasAttemptedToFetchFolders.current = true
  }, [fetchFolder, foldersToFetch, knownFolders.size])

  const focusActiveItem = React.useCallback(
    (selectedItemElement: HTMLElement | null) => {
      if (
        showTree &&
        (!query || window.innerWidth >= ScreenSize.large) &&
        scrollingRef.current &&
        selectedItemElement
      ) {
        // On becoming visible, the tree should scroll to the selected item
        // Simulate "block: center" mode by adding an endMargin and startMargin of half the window height
        scrollIntoView(selectedItemElement, scrollingRef.current, {
          endMargin: window.innerHeight / 2,
          startMargin: window.innerHeight / 2,
          behavior: 'auto',
        })
      }
    },
    [query, showTree],
  )

  const setSelectedItemRef = React.useCallback(
    (selectedItemElement: HTMLElement | null) => {
      if (selectedItemElement && ignoreNextScroll.current) {
        ignoreNextScroll.current = false
      } else if (selectedElement.current !== selectedItemElement) {
        focusActiveItem(selectedItemElement)
      }
      selectedElement.current = selectedItemElement
    },
    [focusActiveItem],
  )

  const setScrollingRef = React.useCallback(
    (element: HTMLDivElement) => {
      scrollingRef.current = element
      const screenWidth = window.innerWidth
      // When the tree is a pane, focus after the scrollable container renders.
      if (screenWidth >= TreeOverlayBreakpoint) {
        focusActiveItem(selectedElement.current)
      }
    },
    [focusActiveItem],
  )

  const setOverlayRef = React.useCallback(
    (element: HTMLDivElement) => {
      // When the tree is in an overlay, we need to wait for the overlay container to mount
      // before focusing the active element.
      if (element) {
        focusActiveItem(selectedElement.current)
      }
    },
    [focusActiveItem],
  )

  const {screenSize} = useScreenSize()
  const showTreeOverlay =
    !isSSR &&
    (((isOverview || openPanel) && screenSize < TreeOverlayBreakpoint) || screenSize < ScreenSize.xlarge) &&
    screenSize >= ScreenSize.large

  const onTreeItemSelected = React.useCallback(() => {
    if (!showTreeOverlay) {
      onItemSelected()
    }
    ignoreNextScroll.current = true
  }, [onItemSelected, showTreeOverlay])

  const displayNoneSx = !showTree ? {display: 'none'} : {}

  const parentDirPath = isFilePath ? path.substring(0, path.lastIndexOf('/')) : path

  const fileTreeContextValue = useMemo(() => {
    return {knownFolders, dispatchKnownFolders}
  }, [knownFolders])

  // These are the widths where the distance to the first header element is less than the header tree toggle's padding
  const marginToggleTreeDisplaySx = isOverview
    ? {
        '@media screen and (min-width: 1476px)': {
          display: 'block',
        },
      }
    : {
        '@media screen and (min-width: 1360px)': {
          display: 'block',
        },
      }

  // Create a portal node: this holds your rendered content
  const portalNode = React.useMemo(() => {
    if (isSSR) {
      return null
    }
    return createHtmlPortalNode()
  }, [isSSR])

  const exitOverlay = React.useCallback(() => {
    if (window.innerWidth > ScreenSize.large && window.innerWidth < ScreenSize.xxxxlarge) {
      collapseTree({setCookie: false})
    }
  }, [collapseTree])

  /* on the server during SSR, the expanded value will purely be whatever their saved
  setting is, which might be expanded. On mobile widths we don't ever default to
  having the tree expanded, so on the server we need to just hard code it to
  show the regular not expanded version of everything*/
  const paneContents = (
    <Box
      id={id}
      sx={{
        maxHeight: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '@media screen and (max-width: 768px)': isSSR ? {display: 'none'} : undefined,
        '@media screen and (min-width: 768px)': {
          maxHeight: '100vh',
          height: '100vh',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          pb: 2,
          pt: 3,
        }}
      >
        <Box sx={{display: 'flex', width: '100%', mb: 3, alignItems: 'center'}}>
          {showTree && treeToggleElement}
          <Heading as="h2" sx={{fontSize: 2, ml: 2}}>
            Files
          </Heading>
        </Box>

        <Box sx={{mx: 4, display: 'flex', width: '100%'}}>
          <Box sx={{flexGrow: 1}}>
            <ReposHeaderRefSelector
              buttonClassName="react-repos-tree-pane-ref-selector width-full ref-selector-class"
              allowResizing={true}
            />
          </Box>
          <Box
            sx={{
              ml: 2,
              whiteSpace: 'nowrap',
              '&:hover button:not(:hover)': {
                borderLeftColor: 'var(--button-default-borderColor-hover, var(--color-btn-hover-border))',
              },
            }}
          >
            {refInfo.canEdit && (
              <Tooltip aria-label="Add file" direction="s">
                <IconButton
                  aria-label="Add file"
                  as={Link}
                  sx={{
                    color: 'fg.subtle',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: 0,
                  }}
                  icon={PlusIcon}
                  to={repositoryTreePath({repo, path: parentDirPath, commitish: refInfo.name, action: 'new'})}
                  // This callback will close the tree if this is a narrow viewport
                  onClick={onTreeItemSelected}
                />
              </Tooltip>
            )}
            <SearchButton
              sx={refInfo.canEdit ? {borderTopLeftRadius: 0, borderBottomLeftRadius: 0} : undefined}
              onClick={exitOverlay}
            />
          </Box>
        </Box>
      </Box>

      {refInfo.currentOid && (
        <FileResultsList
          onItemSelected={onItemSelected}
          searchBoxRef={searchBoxRef}
          isOverview={isOverview}
          onFindFilesShortcut={onFindFilesShortcut}
          sx={{
            ml: 3,
            mr: 3,
            mb: '12px',
            '@media screen and (max-width: 768px)': isSSR ? {display: 'none'} : undefined,
          }}
        />
      )}
      <TreeBorder scrollingRef={scrollingRef} />
      <Box
        ref={setScrollingRef}
        sx={{
          flexGrow: 1,
          maxHeight: '100% !important',
          overflowY: 'auto',
          '@media screen and (max-width: 768px)': isSSR ? {display: 'none'} : undefined,
          scrollbarGutter: 'stable',
        }}
      >
        {isSSR
          ? refInfo.currentOid && (
              <div className={!query ? 'react-tree-show-tree-items' : 'react-tree-show-tree-items-on-large-screen'}>
                <ReposFileTreeView
                  data={fileTree}
                  rootItems={rootItems}
                  selectedItemRef={setSelectedItemRef}
                  setRootItems={setRootItems}
                  onItemSelected={onTreeItemSelected}
                  processingTime={processingTime}
                  loading={treeLoading}
                  fetchError={fetchError}
                />
              </div>
            )
          : portalNode && <OutPortal node={portalNode} />}
        {!refInfo.currentOid && !repo.isEmpty && (
          <Box
            sx={{
              mt: 2,
              mx: 4,
              mb: '12px',
              fontSize: 1,
              alignItems: 'center',
              color: 'danger.fg',
            }}
          >
            <Octicon icon={AlertFillIcon} />
            &nbsp;Ref is invalid
          </Box>
        )}
      </Box>
    </Box>
  )

  const hidePaneSx =
    isOverview || showTreeOverlay || openPanel
      ? {
          // 1349 is TreeOverlayBreakpoint - 1
          '@media print, screen and (max-width: 1349px) and (min-width: 768px)': {
            display: 'none',
          },
        }
      : {
          '@media print, screen and (max-width: 1011px) and (min-width: 768px)': {
            display: 'none',
          },
        }

  return (
    <FileTreeContext.Provider value={fileTreeContextValue}>
      {/* Render the TreeView in a portal that can be moved to different containers without rerendering */}
      {portalNode && (
        <InPortal node={portalNode}>
          {refInfo.currentOid && (
            <div className={!query ? 'react-tree-show-tree-items' : 'react-tree-show-tree-items-on-large-screen'}>
              <ReposFileTreeView
                data={fileTree}
                rootItems={rootItems}
                selectedItemRef={setSelectedItemRef}
                setRootItems={setRootItems}
                onItemSelected={onTreeItemSelected}
                processingTime={processingTime}
                loading={treeLoading}
                fetchError={fetchError}
              />
            </div>
          )}
        </InPortal>
      )}
      {!showTree && codeCenterOption.enabled && !isOverview && (
        <Box
          sx={{
            position: 'absolute',
            p: isOverview ? undefined : 3,
            pl: isOverview ? 3 : undefined,
            mt: isOverview ? 3 : undefined,
            display: 'none',
            ...marginToggleTreeDisplaySx,
          }}
        >
          {treeToggleElement}
        </Box>
      )}
      {(!isOverview || screenSize < ScreenSize.large) && (
        <SplitPageLayout.Pane
          position="start"
          sticky
          sx={{
            minWidth: 0,
            ...displayNoneSx,
            flexDirection: ['column', 'column', 'inherit'],
            '@media screen and (min-width: 769px)': {
              height: '100vh',
              maxHeight: '100vh !important',
            },
            ...hidePaneSx,
          }}
          padding="none"
          width="large"
          resizable={true}
          widthStorageKey="codeView.tree-pane-width"
          divider={{regular: 'line', narrow: 'none'}}
        >
          {showTree && !showTreeOverlay && (
            <Box
              className={
                isSSR ? (openPanel ? 'react-tree-pane-contents-3-panel' : 'react-tree-pane-contents') : undefined
              }
            >
              <>{paneContents}</>
            </Box>
          )}
        </SplitPageLayout.Pane>
      )}
      {showTree && !isOverview && showTreeOverlay && lastOpenPanel.current === openPanel && (
        <Overlay
          className={
            isSSR
              ? isOverview || openPanel
                ? 'react-tree-pane-overlay-3-panel'
                : 'react-tree-pane-overlay'
              : undefined
          }
          ref={setOverlayRef}
          returnFocusRef={treeToggleRef}
          onClickOutside={exitOverlay}
          onEscape={exitOverlay}
          top={0}
          position="fixed"
          sx={{
            ...displayNoneSx,
            width: '440px',
            height: '100vh',
            maxHeight: '100vh',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <>{paneContents}</>
        </Overlay>
      )}
    </FileTreeContext.Provider>
  )
}

function knownFolderReducer(
  state: Map<string, TreeItem<DirectoryItem>>,
  action: {
    type: string
    folders: Map<string, TreeItem<DirectoryItem>>
    processingTime: number
  },
) {
  switch (action.type) {
    case 'set': {
      const stateInitialized = state?.size > 0
      sendEvent('file-tree', {
        'fetch-count': stateInitialized ? action.folders.size - state.size : action.folders.size,
        'file-count': action.folders.size,
        'nav-type': stateInitialized ? 'soft' : 'hard',
        'processing-time': action.processingTime,
      })
      return action.folders
    }
    case 'add': {
      const newState = new Map([...state, ...action.folders])
      sendEvent('file-tree', {
        'fetch-count': action.folders.size,
        'file-count': newState.size,
        'nav-type': 'fetch',
        'processing-time': action.processingTime,
      })
      return newState
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

function TreeBorder({scrollingRef}: {scrollingRef: React.RefObject<HTMLDivElement>}) {
  const [visible, setVisible] = React.useState(scrollingRef.current && scrollingRef.current.scrollTop > 0)

  React.useEffect(() => {
    if (scrollingRef.current) {
      const scrollElement = scrollingRef.current
      const scrollHandler = () => {
        if (scrollElement && scrollElement.scrollTop > 0) {
          setVisible(true)
        } else {
          setVisible(false)
        }
      }
      // eslint-disable-next-line github/prefer-observers
      scrollElement.addEventListener('scroll', scrollHandler)
      return () => {
        scrollElement.removeEventListener('scroll', scrollHandler)
      }
    }
  }, [scrollingRef])

  return visible ? (
    <Box
      sx={{
        borderBottom: '1px solid',
        borderColor: 'border.default',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
      }}
    />
  ) : null
}

try{ ReposFileTreePane.displayName ||= 'ReposFileTreePane' } catch {}
try{ TreeBorder.displayName ||= 'TreeBorder' } catch {}