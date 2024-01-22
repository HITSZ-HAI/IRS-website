import type {CodeNavigationInfo} from '@github-ui/code-nav'
import type {Blame, BlobPayload} from '@github-ui/code-view-types'
import {sendEvent} from '@github-ui/hydro-analytics'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {Box} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {DuplicateOnKeydownButton} from '../components/DuplicateOnKeydownButton'
import {useOpenPanel} from '../contexts/OpenPanelContext'
import {CurrentBlameProvider, useCurrentBlame} from '../hooks/CurrentBlame'
import {CurrentBlobProvider} from '../hooks/CurrentBlob'
import {CurrentLineRefMapProvider} from '../hooks/CurrentLineRefMap'
import {useFilesPageInfo} from '../hooks/FilesPageInfo'
import {useShortcut} from '../hooks/shortcuts'
import {useCodeNavigation} from '../hooks/use-code-navigation'
import {focusSymbolSearch, useFocusSymbolPane} from '../hooks/use-focus-symbol-pane'
import {useInFileSearchResults} from '../hooks/use-in-file-search-results'
import {useReposAnalytics} from '../hooks/use-repos-analytics'
import {stickyHeaderId} from '../hooks/use-sticky-header-height'
import {DELETE_STICKY_LINES_VALUE, useStickyLines} from '../hooks/use-sticky-lines'
import {useStickyHeaderSx} from '../hooks/use-sticky-observer'
import {useUpdatePanelExpandPreferences} from '../hooks/use-update-panel-expand-preferences'
import {textAreaId} from '../utilities/lines'
import BlobContent from './blob/BlobContent'
import type {CodeLinesHandle} from './blob/BlobContent/Code/code-lines-handle'
import {type CopilotInfo, CopilotPopover} from './CopilotPopover'
import BlobViewHeader from './headers/BlobViewHeader'
import CodeSizeDetails from './headers/header-components/CodeSizeDetails'
import {LatestCommitSingleLine} from './LatestCommit'
import {PanelContent} from './PanelContent'

export function BlobViewContent({
  blame,
  blob,
  searchTerm,
  setSearchTerm,
  setValidCodeNav,
  showTree,
  treeToggleElement,
  validCodeNav,
  copilotInfo,
}: {
  blame: Blame | undefined
  blob: BlobPayload
  searchTerm: string
  setSearchTerm: (term: string) => void
  setValidCodeNav: (show: boolean) => void
  showTree: boolean
  treeToggleElement: JSX.Element
  validCodeNav: boolean
  copilotInfo?: CopilotInfo
}) {
  const {path} = useFilesPageInfo()
  const stickyHeaderRef = useRef(null)
  const stickySx = useStickyHeaderSx()
  const borderSx = {
    border: '1px solid',
    borderTop: 'none',
    borderColor: 'border.default',
  }

  const [autoFocusSearch, setAutoFocusSearch] = useState(false)
  const {openPanel, setOpenPanel} = useOpenPanel()
  const codeLinesHandle = useRef<CodeLinesHandle>(null)
  const shouldOpenPanel = useCodeViewOptions().openSymbolsOption.enabled

  useFocusSymbolPane(focusSearch => {
    if (focusSearch) {
      setAutoFocusSearch(true)
    }
  })

  const {sendRepoClickEvent} = useReposAnalytics()

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!isFirstRender.current) {
      //remove sticky lines when navigating to a new file
      setStickyLines(DELETE_STICKY_LINES_VALUE, true)

      //reset panel when navigating to new file
      setSearchTerm('')

      // Don't autofocus search when navigating
      setAutoFocusSearch(false)

      setSearchingText({selectedText: '', lineNumber: -1, offset: 0})
    } else {
      isFirstRender.current = false
      // If this is the first render, open the panel if we have text selected from the hash
      if (searchingText.selectedText && !openPanel && shouldOpenPanel) {
        openCodeNav()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  function scrollEventListenerFunction() {
    if (window.scrollY < 300) {
      //if the user scrolled to the top, we want to make sure all sticky lines are cleared out in that situation
      setStickyLines(DELETE_STICKY_LINES_VALUE, true)
    }
  }
  useEffect(() => {
    // rather than set up an intersection observer on a particular element, we only want to know if the user has scrolled
    // to the very top of the page. The element would never really intersect because it is sticky, so this is the only
    // realistic way for us to determine if the user has scrolled to the top of the page.
    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('scroll', scrollEventListenerFunction)

    return () => {
      window.removeEventListener('scroll', scrollEventListenerFunction)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasBlame = !!useCurrentBlame()
  const updateExpandPreferences = useUpdatePanelExpandPreferences()

  const {currentStickyLines, setStickyLines} = useStickyLines()
  const openCodeNav = useCallback(() => {
    if (!hasBlame && shouldOpenPanel) {
      setOpenPanel('codeNav')
      sendRepoClickEvent('BLOB_SYMBOLS_MENU.OPEN_WITH_SYMBOL')
      localStorage.setItem('codeNavOpen', 'codeNav')
      updateExpandPreferences(null, true)
    }
  }, [hasBlame, shouldOpenPanel, setOpenPanel, sendRepoClickEvent, updateExpandPreferences])

  const {isCodeNavLoading, codeNavInfo, showCodeNavWithSymbol, showCodeNavForToken, searchingText, setSearchingText} =
    useCodeNavigation(blob, openCodeNav, setValidCodeNav, ssrSafeLocation.hash, hasBlame)

  const {searchStatus, searchResults, setSearchResults, focusedSearchResult, setFocusedSearchResult} =
    useInFileSearchResults(codeNavInfo, searchTerm)

  const {
    headerInfo: {toc},
  } = blob

  // store if we've rendered with no openPanel
  // think of this like a useRef that resets when codeNavInfo changes (which happens when the user navigates to a new file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hasRenderedWithNoOpenPanel = useMemo(() => ({value: false}), [codeNavInfo])
  hasRenderedWithNoOpenPanel.value = !openPanel || hasRenderedWithNoOpenPanel.value

  const showPanel =
    openPanel !== undefined &&
    codeNavInfo &&
    validCodeNav &&
    // we show the symbol panel by default, but if there are no symbols, we shouldn't open the symbol panel. if
    // hasRenderedWithNoOpenPanel.value is true, that implies the user has deliberately requested the symbols panel
    !(codeNavInfo.symbols.length === 0 && openPanel === 'codeNav' && !hasRenderedWithNoOpenPanel.value) &&
    // if we don't have a toc, don't show the toc
    !(!toc && openPanel === 'toc')
  const actualOpenPanel = showPanel ? openPanel : undefined

  // if we're not showing the panel, setOpenPanel to maintain consistency
  useEffect(() => {
    if (openPanel && !showPanel) {
      setOpenPanel(undefined)
    }
  }, [openPanel, setOpenPanel, showPanel])

  useEffect(() => {
    try {
      sendEvent('blob-size', {
        // for files over the size limit, lines will be 0
        lines: blob.stylingDirectives?.length,
        // for files over the size limit, truncatedSloc will not be reported
        truncatedSloc: blob.headerInfo?.lineInfo.truncatedSloc,
        // for files over the size limit, truncatedLoc will not be reported
        truncatedLoc: blob.headerInfo?.lineInfo.truncatedLoc,
        // for files over the size limit length will be 0
        length: blob.rawLines?.reduce((total, line) => total + line.length, 0) ?? 0,
        // for files over the size limit, humanLength will be reported
        humanLength: blob.headerInfo?.blobSize,
      })
    } catch (e) {
      // don't want to crash the page just for analytics
    }
  }, [blob])

  return (
    <CurrentBlobProvider blob={blob}>
      <CurrentBlameProvider blame={blame}>
        <CurrentLineRefMapProvider>
          {codeNavInfo && <FindSymbolShortcut codeNavInfo={codeNavInfo} />}
          <LatestCommitSingleLine />
          <Box sx={{display: 'flex', flexDirection: 'row'}}>
            <Box
              className="container"
              sx={{
                width: '100%',
                height: 'fit-content',
                minWidth: 0,
                mr: actualOpenPanel && codeNavInfo ? 3 : 0,
              }}
            >
              <Box sx={{pl: 1, pb: 3}} className="react-code-size-details-banner">
                <CodeSizeDetails className="react-code-size-details-banner" />
                <CopilotPopover
                  copilotInfo={copilotInfo}
                  className="react-code-size-details-banner"
                  view={blame ? 'blame' : 'preview'}
                />
              </Box>
              <Box className="react-blob-view-header-sticky" sx={stickySx} id={stickyHeaderId} ref={stickyHeaderRef}>
                <BlobViewHeader
                  currentStickyLines={currentStickyLines}
                  focusedSearchResult={focusedSearchResult}
                  openPanel={actualOpenPanel}
                  searchingText={searchingText}
                  searchResults={searchResults}
                  searchTerm={searchTerm}
                  setFocusedSearchResult={setFocusedSearchResult}
                  setOpenPanel={setOpenPanel}
                  setSearchTerm={setSearchTerm}
                  showTree={showTree}
                  stickyHeaderRef={stickyHeaderRef}
                  treeToggleElement={treeToggleElement}
                  validCodeNav={validCodeNav}
                  copilotInfo={copilotInfo}
                />
              </Box>

              <Box
                sx={{
                  ...borderSx,
                  borderRadius: '0px 0px 6px 6px',
                  // Min width is set to 273px to prevent the blob content from being too narrow.
                  // Supports a min screen size of 320px without introducing any horizontal scrollbars.
                  minWidth: '273px',
                }}
              >
                <BlobContent
                  blobLinesHandle={codeLinesHandle}
                  setOpenPanel={setOpenPanel}
                  validCodeNav={validCodeNav}
                  codeNavInfo={codeNavInfo}
                  onCodeNavTokenSelected={showCodeNavForToken}
                  onLineStickOrUnstick={setStickyLines}
                  searchResults={searchResults}
                  setSearchTerm={setSearchTerm}
                  focusedSearchResult={focusedSearchResult}
                />
              </Box>
            </Box>
            {actualOpenPanel && codeNavInfo ? (
              <>
                <Box
                  // This is a bit of a hack for SSR - we want the symbols panel to be shifted down when the
                  // Code size details are rendered above the blob (instead of in the blob header)
                  // Because that item needs to be inside the container above for the container query to work
                  // We need to shift the symbols panel oursleves when the content size is right
                  sx={{pb: '33px'}}
                />
                <PanelContent
                  stickySx={stickySx}
                  stickyHeaderRef={stickyHeaderRef}
                  openPanel={actualOpenPanel}
                  isCodeNavLoading={isCodeNavLoading}
                  codeNavInfo={codeNavInfo}
                  setOpenPanel={setOpenPanel}
                  showCodeNavWithSymbol={showCodeNavWithSymbol}
                  searchingText={searchingText}
                  setSearchingText={setSearchingText}
                  searchTerm={searchTerm}
                  searchResults={searchResults}
                  searchStatus={searchStatus}
                  setSearchResults={setSearchResults}
                  setSearchTerm={setSearchTerm}
                  setFocusedSearchResult={setFocusedSearchResult}
                  autoFocusSearch={autoFocusSearch}
                />
              </>
            ) : null}
          </Box>
        </CurrentLineRefMapProvider>
      </CurrentBlameProvider>
    </CurrentBlobProvider>
  )
}

function FindSymbolShortcut({codeNavInfo}: {codeNavInfo: CodeNavigationInfo}) {
  const {sendRepoKeyDownEvent} = useReposAnalytics()
  const {findSymbolShortcut} = useShortcut()
  const {setOpenPanel} = useOpenPanel()

  // Don't support `r` hotkey if no symbols exist for the document
  if (codeNavInfo.symbols.length === 0) {
    return null
  }

  return (
    <DuplicateOnKeydownButton
      buttonFocusId={textAreaId}
      buttonHotkey={findSymbolShortcut.hotkey}
      onButtonClick={() => {
        setOpenPanel('codeNav')
        focusSymbolSearch()
        sendRepoKeyDownEvent('FIND_SYMBOL')
      }}
    />
  )
}

try{ BlobViewContent.displayName ||= 'BlobViewContent' } catch {}
try{ FindSymbolShortcut.displayName ||= 'FindSymbolShortcut' } catch {}