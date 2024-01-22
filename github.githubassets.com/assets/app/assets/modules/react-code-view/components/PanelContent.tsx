import type {CodeNavigationInfo, CodeSymbol, DefinitionOrReference} from '@github-ui/code-nav'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {Dialog} from '@primer/react/experimental'
import React from 'react'

import {useCurrentBlob} from '../hooks/CurrentBlob'
import type {SearchInFileStatus} from '../hooks/use-in-file-search-results'
import {useStickyObserver} from '../hooks/use-sticky-observer'
import {useUpdatePanelExpandPreferences} from '../hooks/use-update-panel-expand-preferences'
import type {PanelType} from '../pages/CodeView'
import type {CodeNavData} from './blob/BlobContent/BlobContent'
import {CodeNavInfoPanel} from './blob/BlobContent/CodeNav/CodeNavInfoPanel'
import TableOfContentsPanel from './blob/BlobContent/Renderable/TableOfContentsPanel'
import {Panel} from './Panel'

interface InnerPanelContentProps {
  stickySx: Record<string, unknown> | undefined
  stickyHeaderRef: React.RefObject<HTMLDivElement>
  openPanel: PanelType
  isCodeNavLoading: boolean
  codeNavInfo: CodeNavigationInfo
  setOpenPanel: (panel: PanelType | undefined) => void
  showCodeNavWithSymbol: (symbol: CodeSymbol) => void
  searchingText: CodeNavData
  setSearchingText: React.Dispatch<React.SetStateAction<CodeNavData>>
  searchTerm: string
  searchStatus: SearchInFileStatus
  searchResults: DefinitionOrReference[]
  setSearchTerm: (term: string) => void
  setSearchResults: (results: DefinitionOrReference[]) => void
  setFocusedSearchResult: (index: number | undefined) => void
  autoFocusSearch: boolean
  className?: string
}

interface OuterPanelContentProps extends Omit<InnerPanelContentProps, 'isNarrow'> {
  setOpenPanel: (panel: PanelType | undefined) => void
}

export const PanelContent = React.memo(PanelContentUnmemoized)

function PanelContentUnmemoized(props: OuterPanelContentProps) {
  const {...innerProps} = props
  const [isNarrow, setIsNarrow] = React.useState(false)
  const {screenSize} = useScreenSize()

  React.useEffect(() => {
    setIsNarrow(screenSize < ScreenSize.large)
  }, [screenSize])

  return (
    <>
      {!isNarrow && <InnerPanelContent className={'inner-panel-content-not-narrow'} {...props} />}
      {isNarrow && (
        <Dialog
          onClose={() => innerProps.setOpenPanel(undefined)}
          renderHeader={() => null}
          renderBody={() => InnerPanelContent({...innerProps})}
        />
      )}
    </>
  )
}

function InnerPanelContent({
  stickySx,
  stickyHeaderRef,
  openPanel,
  isCodeNavLoading,
  codeNavInfo,
  setOpenPanel,
  showCodeNavWithSymbol,
  searchingText,
  setSearchingText,
  setSearchTerm,
  setSearchResults,
  setFocusedSearchResult,
  autoFocusSearch,
  className,
}: InnerPanelContentProps) {
  const {
    headerInfo: {toc},
  } = useCurrentBlob()

  const isStickied = useStickyObserver(stickyHeaderRef)
  const borderSx = isStickied ? {borderRadius: '0px 0px 6px 6px', borderTop: 0} : {}
  const updateExpandPreferences = useUpdatePanelExpandPreferences()

  return (
    <Panel sx={{...stickySx, ...borderSx}} className={`panel-content-narrow-styles ${className ? className : ''}`}>
      {openPanel === 'toc' ? (
        <TableOfContentsPanel
          toc={toc}
          onClose={() => {
            setOpenPanel(undefined)
          }}
        />
      ) : (
        openPanel === 'codeNav' && (
          <CodeNavInfoPanel
            codeNavInfo={codeNavInfo}
            showCodeNavWithSymbol={showCodeNavWithSymbol}
            selectedText={searchingText.selectedText}
            lineNumber={searchingText.lineNumber - 1}
            offset={searchingText.offset}
            onClose={() => {
              setOpenPanel(undefined)
              localStorage.setItem('codeNavOpen', '')
              updateExpandPreferences(null, false)
              // return focus to symbols button
              document.getElementById('symbols-button')?.focus()
            }}
            isLoading={isCodeNavLoading}
            onClear={() => setSearchingText({selectedText: '', lineNumber: 0, offset: -1})}
            setSearchTerm={setSearchTerm}
            setSearchResults={setSearchResults}
            setFocusedSearchResult={setFocusedSearchResult}
            autoFocusSearch={autoFocusSearch}
          />
        )
      )}
    </Panel>
  )
}

try{ PanelContent.displayName ||= 'PanelContent' } catch {}
try{ PanelContentUnmemoized.displayName ||= 'PanelContentUnmemoized' } catch {}
try{ InnerPanelContent.displayName ||= 'InnerPanelContent' } catch {}