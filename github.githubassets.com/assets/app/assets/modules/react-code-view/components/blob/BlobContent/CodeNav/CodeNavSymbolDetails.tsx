import type {CodeNavigationInfo, CodeSymbol, DefinitionOrReference} from '@github-ui/code-nav'
import CopilotChatButton from '@github-ui/copilot-chat/components/CopilotChatButton'
import type {CopilotChatReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {codeNavSearchPath} from '@github-ui/paths'
import {qualifyRef} from '@github-ui/ref-utils'
import type {RefInfo} from '@github-ui/repos-types'
import {useNavigate} from '@github-ui/use-navigate'
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FoldIcon,
  SearchIcon,
  UnfoldIcon,
  XIcon,
} from '@primer/octicons-react'
import {
  Box,
  type BoxProps,
  Button,
  Heading,
  IconButton,
  Link as PrimerLink,
  Octicon,
  Spinner,
  Text,
  Truncate,
} from '@primer/react'
import {lazy, type PropsWithChildren, Suspense, useEffect, useMemo, useRef, useState} from 'react'

import {useCurrentBlame} from '../../../../hooks/CurrentBlame'
import {useCurrentBlob} from '../../../../hooks/CurrentBlob'
import {useFilesPageInfo} from '../../../../hooks/FilesPageInfo'
import {useShortcut} from '../../../../hooks/shortcuts'
import {useCodeNav} from '../../../../hooks/use-code-nav'
import {useFocusSymbolPane} from '../../../../hooks/use-focus-symbol-pane'
import {scrollLineIntoView} from '../../../../hooks/use-scroll-line-into-view'
import {CodeNavInfoPanelData} from './CodeNavInfoPanelData'
import {SymbolIndicator} from './SymbolIndicator'

const MaxCrossReferenceFiles = 5
const ScrollMarks = lazy(() => import('./ScrollMarks'))

export function CodeNavSymbolDetails({
  codeNavInfo,
  selectedText,
  lineNumber,
  offset,
  onClose,
  onBackToSymbol,
  onSymbolSelect,
  isLoading,
  setSearchResults,
  setFocusedSearchResult,
}: {
  codeNavInfo: CodeNavigationInfo
  selectedText: string
  lineNumber: number
  offset: number
  onClose: () => void
  onBackToSymbol: () => void
  onSymbolSelect: (sym: CodeSymbol) => void
  isLoading: boolean
  setSearchResults: (results: DefinitionOrReference[]) => void
  setFocusedSearchResult: (idx: number | undefined) => void
}) {
  const {findNextShortcut, findPrevShortcut} = useShortcut()
  const hasBlame = !!useCurrentBlame()
  const {
    definitions: defsResponse,
    localReferences: localRefsResponse,
    crossReferences: crossRefsResponse,
    error,
  } = useCodeNav(codeNavInfo, selectedText, lineNumber, offset)
  const {copilotAccessAllowed} = useFilesPageInfo()
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [showAllCrossRefs, setShowAllCrossRefs] = useState(false)
  const repo = useCurrentRepository()
  const definitions = defsResponse?.definitions || []
  const references = useMemo(() => localRefsResponse?.references || [], [localRefsResponse])
  const crossReferences = crossRefsResponse?.references || []
  const startReferenceIndex = definitions.length
  const allReferencesCount = references.length + crossReferences.length
  const nav = useNavigate()

  const currentSymbol = definitions.length > 0 ? definitions[0] : undefined

  // limit cross references to 5 files
  const crossRefFiles = crossReferences.map(r => r.path).filter((v, i, a) => a.indexOf(v) === i)
  const shownReferences = showAllCrossRefs ? allReferencesCount : references.length

  const backToSymbolsRef = useRef<HTMLButtonElement>(null)

  const {language, languageID} = useCurrentBlob()
  const messageReference: CopilotChatReference = {
    type: 'symbol',
    kind: 'codeNavSymbol',
    name: selectedText,
    languageID,
    languageName: language,
    codeNavDefinitions: definitions.map(d => ({
      ident: d.ident,
      extent: d.extent,
      kind: d.kind.fullName,
      fullyQualifiedName: d.fullyQualifiedName,
      ref: getRefName(d.refInfo),
      commitOID: d.refInfo.currentOid,
      repoID: d.repo.id,
      repoName: d.repo.name,
      repoOwner: d.repo.ownerLogin,
      path: d.path,
    })),
    codeNavReferences: [
      ...references.map(r => ({
        ident: r.ident,
        path: r.path,
        ref: getRefName(r.refInfo),
        commitOID: r.refInfo.currentOid,
        repoID: r.repo.id,
        repoName: r.repo.name,
        repoOwner: r.repo.ownerLogin,
      })),
      ...crossReferences.map(c => ({
        ident: c.ident,
        path: c.path,
        ref: getRefName(c.refInfo),
        commitOID: c.refInfo.currentOid,
        repoID: c.repo.id,
        repoName: c.repo.name,
        repoOwner: c.repo.ownerLogin,
      })),
    ],
  }

  useEffect(() => {
    // only include definition if its in the same file
    if (currentSymbol && currentSymbol.repo.name === codeNavInfo.repo.name && currentSymbol.path === codeNavInfo.path) {
      setSearchResults([currentSymbol, ...references])
    } else {
      setSearchResults(references)
    }
    setFocusedSearchResult(undefined)
  }, [
    codeNavInfo.path,
    codeNavInfo.repo.name,
    currentSymbol,
    references,
    selectedText,
    setSearchResults,
    setFocusedSearchResult,
  ])

  useFocusSymbolPane(focusSymbolSearch => {
    if (!focusSymbolSearch) {
      backToSymbolsRef.current?.focus()
    }
  })

  // When the selected symbol changes, reset the highlighted index
  useEffect(() => {
    setHighlightedIndex(-1)
  }, [selectedText])

  useEffect(() => {
    setShowAllCrossRefs(crossRefFiles.length > 0 && crossRefFiles.length <= MaxCrossReferenceFiles)
  }, [crossRefFiles.length])

  // We should not use navigation on the links.
  // Using href and programmatic navigation breaks nav history on Firefox: https://github.com/github/repos/issues/3462
  const onHighlight = ({index, direction, navigate}: {index?: number; direction?: number; navigate?: boolean}) => {
    // If we are directly setting the index, just do that
    if (index !== undefined) {
      const currentRef = index >= startReferenceIndex ? references[index - startReferenceIndex]! : definitions[index]!
      setHighlightedIndex(index)
      if (navigate) {
        nav(currentRef.href(hasBlame))
      }

      // Note: we need this "backdoor" mechanism of scrolling to the selected line, since
      // just setting the URL won't scroll the line into view unless the URL actually changes.
      scrollLineIntoView({line: currentRef.lineNumber, column: currentRef.ident.start.column})
    }

    if (direction !== undefined) {
      // Account for the fact that the definitions are at the top of the list
      const newIndex = Math.max(startReferenceIndex, highlightedIndex + direction)
      const highlightedSymbol = references[newIndex - startReferenceIndex]
      if (newIndex < references.length + definitions.length && highlightedSymbol) {
        setHighlightedIndex(newIndex)
        if (navigate) {
          nav(highlightedSymbol.href(hasBlame))
        }
        scrollLineIntoView({line: highlightedSymbol.lineNumber, column: highlightedSymbol.ident.start.column})
      }
    }
  }

  return (
    <Box>
      <Box
        as="h2"
        sx={{
          fontSize: '12px',
          py: 2,
          px: 3,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        role="group"
        aria-roledescription="Symbol Navigation Details"
      >
        <Button
          onClick={onBackToSymbol}
          onSelect={onBackToSymbol}
          id="back-to-all-symbols"
          aria-label="Back to All Symbols"
          ref={backToSymbolsRef}
          variant="invisible"
          sx={{
            order: 1,
            pr: 3,
            pl: 0,
            px: 0,
            ':hover:not([disabled])': {bg: 'canvas.default'},
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Octicon icon={ArrowLeftIcon} sx={{pr: 1, fontWeight: 600, color: 'fg.muted'}} size={20} />
            <Box sx={{fontSize: 0, color: 'fg.subtle', fontWeight: 400}}>All Symbols</Box>
          </Box>
        </Button>
        <IconButton
          aria-label="Close symbols"
          data-hotkey="Escape"
          icon={XIcon}
          sx={{
            order: 3,
            mr: -2,
            color: 'fg.default',
          }}
          onClick={onClose}
          variant="invisible"
        />
      </Box>
      <Box sx={{alignItems: 'center', display: 'flex', justifyContent: 'space-between', pb: 3}}>
        <CodeNavSymbolDefinitionHeader
          currentSymbol={currentSymbol}
          selectedText={selectedText}
          codeNavInfo={codeNavInfo}
          onSymbolSelect={onSymbolSelect}
        >
          {definitions.length === 1 ? (
            <CopilotChatButton copilotAccessAllowed={copilotAccessAllowed} messageReference={messageReference} />
          ) : undefined}
        </CodeNavSymbolDefinitionHeader>
      </Box>
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            p: 3,
            justifyContent: 'center',
          }}
        >
          <Spinner size="small" />
        </Box>
      )}
      {!error && !isLoading && definitions && definitions.length > 0 ? (
        <>
          <CodeNavSymbolSectionHeader
            headerText={definitions.length > 1 ? 'Definitions' : 'Definition'}
            searchType={defsResponse?.backend === 'precise' ? 'Precise' : 'Search'}
          />
          <Box>
            {definitions && (
              <CodeNavInfoPanelData
                key={'definitions'}
                definitions={definitions}
                onClick={(index: number) => {
                  onHighlight({index})
                }}
                highlightedIndex={highlightedIndex}
                initiallyExpanded={true}
                enableExpandCollapse={definitions.length > 1}
                symbol={selectedText}
                setFocusOnFile={true}
              />
            )}
          </Box>
        </>
      ) : null}
      {!isLoading && (references.length > 0 || crossReferences.length > 0) && (
        <CodeNavSymbolSectionHeader
          headerText={`${shownReferences} ${shownReferences > 1 ? 'References' : 'Reference'}`}
          searchType="Search"
          sx={{justifyContent: 'space-between'}}
        >
          <Box sx={{display: 'float', float: 'right', mr: '-6px'}}>
            <IconButton
              aria-label="Previous reference"
              data-hotkey={findPrevShortcut.hotkey}
              onClick={() => onHighlight({direction: -1, navigate: true})}
              sx={{mr: 2, cursor: 'pointer', color: 'fg.muted'}}
              disabled={highlightedIndex <= definitions.length}
              icon={ChevronUpIcon}
              variant="invisible"
              size="small"
            />
            <IconButton
              aria-label="Next reference"
              data-hotkey={findNextShortcut.hotkey}
              onClick={() => onHighlight({direction: 1, navigate: true})}
              sx={{cursor: 'pointer', color: 'fg.muted'}}
              disabled={highlightedIndex >= references.length + definitions.length - 1}
              icon={ChevronDownIcon}
              variant="invisible"
              size="small"
            />
            <button
              hidden={true}
              data-hotkey={findNextShortcut.hotkey}
              onClick={() => onHighlight({direction: 1, navigate: true})}
              data-testid="find-next-button"
            />
            <button
              hidden={true}
              data-hotkey={findPrevShortcut.hotkey}
              onClick={() => onHighlight({direction: -1, navigate: true})}
              data-testid="find-prev-button"
            />
          </Box>
        </CodeNavSymbolSectionHeader>
      )}
      {error && <Box sx={{p: 3, fontWeight: '400', color: 'fg.muted'}}>No references found</Box>}
      {!isLoading && references.length > 0 && (
        <CodeNavInfoPanelData
          initiallyExpanded={true}
          enableExpandCollapse={true}
          references={references}
          highlightedIndex={highlightedIndex - startReferenceIndex}
          onClick={(index: number) => {
            onHighlight({index: startReferenceIndex + index})
          }}
          key={'referencesInfoBox'}
          symbol={selectedText}
          setFocusOnFile={!(definitions && definitions.length > 0)}
        />
      )}
      {!isLoading && showAllCrossRefs && (
        <CodeNavInfoPanelData
          initiallyExpanded={false}
          enableExpandCollapse={true}
          references={crossReferences}
          key={'crossReferencesInfoBox'}
          symbol={selectedText}
        />
      )}
      {references.length === 0 && definitions.length === 0 && !error && !isLoading && (
        <Box sx={{p: 3, fontWeight: '400', color: 'fg.muted'}}>No definitions or references found</Box>
      )}
      <Box sx={{px: 2, py: 2, fontSize: 0, color: 'fg.muted', borderTop: '1px solid', borderColor: 'border.muted'}}>
        {crossRefFiles.length > MaxCrossReferenceFiles && (
          // If there are more than refs than shown, show toggle to more/less references
          <Button
            leadingVisual={showAllCrossRefs ? FoldIcon : UnfoldIcon}
            sx={{color: 'fg.default', mb: 2}}
            variant="invisible"
            size="small"
            onClick={() => setShowAllCrossRefs(!showAllCrossRefs)}
          >
            {showAllCrossRefs ? 'Show less' : 'Show more'}
          </Button>
        )}

        <Button
          as={PrimerLink}
          leadingVisual={SearchIcon}
          sx={{color: 'fg.default'}}
          variant="invisible"
          size="small"
          href={codeNavSearchPath({owner: repo.ownerLogin, repo: repo.name, searchTerm: selectedText})}
        >
          Search for this symbol
        </Button>
      </Box>
      <Suspense fallback={null}>
        <ScrollMarks definitionsOrReferences={[...definitions, ...references]} />
      </Suspense>
    </Box>
  )
}

function CodeNavSymbolSectionHeader({
  headerText,
  searchType,
  sx,
  children,
}: PropsWithChildren<{headerText: string; searchType: 'Precise' | 'Search'; sx?: BoxProps['sx']}>) {
  return (
    <Box
      sx={{
        fontSize: '14px',
        px: 3,
        py: 2,
        fontWeight: '600',
        backgroundColor: 'canvas.subtle',
        borderTop: '1px solid',
        borderColor: 'border.muted',
        height: '36px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...sx,
      }}
    >
      <Heading
        as="h3"
        sx={{
          fontSize: '12px',
          fontWeight: 'semibold',
          color: 'fg.muted',
        }}
      >
        {headerText}
        <Text sx={{ml: 2, fontWeight: 'light'}}>{searchType}</Text>
      </Heading>
      {children}
    </Box>
  )
}

function CodeNavSymbolDefinitionHeader({
  currentSymbol,
  selectedText,
  codeNavInfo,
  onSymbolSelect,
  children,
}: {
  currentSymbol?: CodeSymbol
  selectedText: string
  codeNavInfo: CodeNavigationInfo
  onSymbolSelect: (symbol: CodeSymbol) => void
  children?: JSX.Element
}) {
  const fullSymbolText = currentSymbol?.fullyQualifiedName ?? selectedText
  const segmentNames = fullSymbolText.split(/(\W+)/)

  const symbolSegments = segmentNames.map(segment => {
    const isSeparator = /^\W+$/.test(segment)
    const foundDefinitions = !isSeparator ? codeNavInfo.getLocalDefinitions(segment, true) : []
    const foundSymbol = foundDefinitions.length === 1 ? foundDefinitions[0] : undefined
    const symbolColor = foundSymbol?.kind.plColor

    return {text: segment, symbol: foundSymbol, symbolColor, isSeparator}
  })

  return (
    <Box
      as="h3"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignContent: 'start',
        fontWeight: 400,
        fontSize: 1,
        fontFamily: 'mono',
        flexWrap: 'wrap',
        minWidth: 0,
        verticalAlign: 'center',
        gap: 2,
        px: 3,
      }}
      aria-label={`${currentSymbol?.kind.fullName || ''} ${fullSymbolText}`.trimStart()}
    >
      {currentSymbol && (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1, width: '100%'}}>
          <SymbolIndicator symbolKind={currentSymbol.kind} showFullSymbol />
          {children}
        </Box>
      )}
      <Truncate title={fullSymbolText} sx={{maxWidth: 290, mt: '3px', direction: 'rtl', alignSelf: 'start'}} inline>
        &lrm;
        {symbolSegments.map((segment, index) => {
          const symbolSx = segment.symbol
            ? {all: 'unset', cursor: 'pointer', '&:hover': {backgroundColor: 'attention.muted'}}
            : {}

          // under normal circumstances - use a button and dont do what we are doing below
          // we need a span to allow the truncation to not truncate the entire button element when overflowing
          // the below code makes each non-separator span behave like a button
          return (
            <Box
              as="span"
              role="button"
              tabIndex={segment.isSeparator ? -1 : 0}
              sx={{...symbolSx, color: segment.symbolColor, direction: 'ltr'}}
              key={`${segment.text}-${index}`}
              onClick={() => (segment.symbol ? onSymbolSelect(segment.symbol) : undefined)}
              onKeyDown={(keyboardEvent: React.KeyboardEvent) => {
                if (segment.symbol && ['Enter', 'Space'].includes(keyboardEvent.code)) {
                  onSymbolSelect(segment.symbol)
                }
              }}
            >
              {segment.text}
            </Box>
          )
        })}
        &lrm;
      </Truncate>
    </Box>
  )
}

function getRefName(refInfo: RefInfo) {
  return refInfo.name === refInfo.currentOid
    ? refInfo.currentOid
    : refInfo.refType === 'tree'
      ? `refs/heads/${refInfo.name}`
      : qualifyRef(refInfo.name, refInfo.refType ?? 'branch')
}

try{ ScrollMarks.displayName ||= 'ScrollMarks' } catch {}
try{ CodeNavSymbolDetails.displayName ||= 'CodeNavSymbolDetails' } catch {}
try{ CodeNavSymbolSectionHeader.displayName ||= 'CodeNavSymbolSectionHeader' } catch {}
try{ CodeNavSymbolDefinitionHeader.displayName ||= 'CodeNavSymbolDefinitionHeader' } catch {}