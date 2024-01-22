import type {CodeNavigationInfo, CodeSection, DefinitionOrReference} from '@github-ui/code-nav'
import {Box, Link} from '@primer/react'
import React, {lazy, Suspense, useEffect} from 'react'

import {useFindInFileOpen} from '../../../contexts/FindInFileOpenContext'
import {useCurrentBlame} from '../../../hooks/CurrentBlame'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useShortcut} from '../../../hooks/shortcuts'
import {BlobDisplayType, useBlobRendererType} from '../../../hooks/use-blob-renderer-type'
import {useIsCursorEnabled} from '../../../hooks/use-cursor-navigation'
import {useReposAnalytics} from '../../../hooks/use-repos-analytics'
import type {SetStickyLinesType} from '../../../hooks/use-sticky-lines'
import type {PanelType} from '../../../pages/CodeView'
import {assertNever} from '../../../utilities/assert-never'
import {textAreaId} from '../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../DuplicateOnKeydownButton'
import {MarkdownContent} from '../../MarkdownContent'
import {LoadingFallback} from '../../SuspenseFallback'
import type {CodeLinesHandle} from './Code/code-lines-handle'
import {CodeBlob} from './Code/CodeBlob'
import {ImageBlob} from './Renderable/ImageBlob'
import {YamlTemplateContent, YamlTemplateType} from './Renderable/YamlTemplateContent'

const CSVBlob = lazy(() => import('./CSV/CSVBlob'))
const FileRendererBlob = lazy(() => import('./Renderable/FileRendererBlob'))

export interface CodeNavData {
  selectedText: string
  lineNumber: number
  offset: number
}

export function BlobContent({
  setOpenPanel,
  codeNavInfo,
  validCodeNav,
  onCodeNavTokenSelected,
  onLineStickOrUnstick,
  searchResults,
  setSearchTerm,
  blobLinesHandle,
  focusedSearchResult,
}: {
  setOpenPanel: (panel: PanelType | undefined) => void
  codeNavInfo: CodeNavigationInfo | undefined
  validCodeNav: boolean
  onCodeNavTokenSelected: (codeNavData: CodeNavData) => void
  onLineStickOrUnstick: SetStickyLinesType
  searchResults: DefinitionOrReference[]
  setSearchTerm: (term: string) => void
  blobLinesHandle: React.RefObject<CodeLinesHandle>
  focusedSearchResult: number | undefined
}) {
  const hasBlame = !!useCurrentBlame()
  const {rawLines} = useCurrentBlob()
  const {sendRepoKeyDownEvent} = useReposAnalytics()
  const {findInFileShortcut} = useShortcut()

  const blobRendererType = useBlobRendererType()
  const {setFindInFileOpen} = useFindInFileOpen()
  const isRenderingCode = blobRendererType === BlobDisplayType.Code

  // Find in file
  const findInFileHotkey = isRenderingCode && rawLines != null && validCodeNav ? findInFileShortcut.hotkey : ''
  const cursorEnabled = useIsCursorEnabled()

  useEffect(() => {
    if (!isRenderingCode) {
      setOpenPanel(undefined)
    }
  }, [isRenderingCode, setOpenPanel])

  function onHotkeyPressed() {
    setFindInFileOpen(true)
    sendRepoKeyDownEvent('BLOB_FIND_IN_FILE_MENU.OPEN')
    const selection = window.getSelection()?.toString()
    if (selection) {
      setSearchTerm(selection)
    }
  }
  // We can't have the overflow classes for these types because it interferes with the HighlightedLineMenu
  // For markdown, overflow: auto causes lag with code blocks
  const extraSx =
    isRenderingCode || blobRendererType === BlobDisplayType.CSV || blobRendererType === BlobDisplayType.Markdown
      ? {}
      : {overflow: 'auto'}
  const markdownSx = blobRendererType === BlobDisplayType.Markdown ? {justifyContent: 'center'} : {}

  return (
    <Box
      as="section"
      aria-labelledby="file-name-id-wide file-name-id-mobile"
      sx={{
        backgroundColor: 'var(--bgColor-default, var(--color-canvas-default))',
        border: '0px',
        borderWidth: 0,
        borderRadius: '0px 0px 6px 6px',
        p: 0,
        minWidth: 0,
        // 46px is the height of the header, and to fix the weirdness of the header pushing all content down, we need
        // to add padding to the body content of a given view. Otherwise the header covers up the first few lines of
        // any given view. 92px is the height of the blame header because there is an extra line with the color scheme
        mt: hasBlame ? '92px' : '46px',
        ...markdownSx,
        ...extraSx,
      }}
    >
      <Blob
        blobLinesHandle={blobLinesHandle}
        onCodeNavTokenSelected={onCodeNavTokenSelected}
        codeSections={hasBlame ? undefined : codeNavInfo?.codeSections}
        codeLineToSectionMap={codeNavInfo ? codeNavInfo.lineToSectionMap : undefined}
        validCodeNav={validCodeNav}
        onLineStickOrUnstick={onLineStickOrUnstick}
        searchResults={searchResults}
        focusedSearchResult={focusedSearchResult}
      />
      {isRenderingCode && !cursorEnabled && (
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={findInFileHotkey}
          onButtonClick={onHotkeyPressed}
          buttonTestLabel={'hotkey-button'}
        />
      )}
    </Box>
  )
}

const Blob = React.memo(function Blob({
  onCodeNavTokenSelected,
  codeSections,
  codeLineToSectionMap,
  validCodeNav,
  onLineStickOrUnstick,
  searchResults,
  blobLinesHandle,
  focusedSearchResult,
}: {
  onCodeNavTokenSelected: (codeNavData: CodeNavData) => void
  codeSections?: Map<number, CodeSection[]>
  codeLineToSectionMap?: Map<number, CodeSection[]>
  validCodeNav: boolean
  onLineStickOrUnstick: SetStickyLinesType
  searchResults: DefinitionOrReference[]
  blobLinesHandle: React.RefObject<CodeLinesHandle>
  focusedSearchResult: number | undefined
}) {
  const payload = useCurrentBlob()

  const displayType = useBlobRendererType()

  switch (displayType) {
    case BlobDisplayType.TooLargeError:
      return (
        <Box sx={{textAlign: 'center'}} data-hpc>
          <Link href={payload.rawBlobUrl}>View raw</Link>
          {payload.large && <p>(Sorry about that, but we can’t show files that are this big right now.)</p>}
        </Box>
      )
    case BlobDisplayType.Code:
      return (
        <CodeBlob
          blobLinesHandle={blobLinesHandle}
          onCodeNavTokenSelected={onCodeNavTokenSelected}
          codeSections={codeSections}
          codeLineToSectionMap={codeLineToSectionMap}
          validCodeNav={validCodeNav}
          onLineStickOrUnstick={onLineStickOrUnstick}
          searchResults={searchResults}
          focusedSearchResult={focusedSearchResult}
        />
      )
    case BlobDisplayType.Markdown:
      return (
        <MarkdownContent
          richText={payload.richText!}
          sx={{
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            p: 5,
            minWidth: 0,
          }}
        />
      )
    case BlobDisplayType.CSV:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <CSVBlob csv={payload.csv!} />
        </Suspense>
      )
    case BlobDisplayType.FileRenderer:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <FileRendererBlob
            identityUuid={payload.renderedFileInfo!.identityUUID}
            size={payload.renderedFileInfo!.size}
            type={payload.renderedFileInfo!.renderFileType}
            url={payload.displayUrl}
          />
        </Suspense>
      )
    case BlobDisplayType.Image:
      return <ImageBlob displayName={payload.displayName} displayUrl={payload.displayUrl} />
    case BlobDisplayType.IssueTemplate:
      return (
        <YamlTemplateContent
          issueTemplate={payload.issueTemplate ? payload.issueTemplate : payload.discussionTemplate!}
          type={payload.issueTemplate ? YamlTemplateType.Issue : YamlTemplateType.Discussion}
          data-hpc
        />
      )
    default:
      assertNever(displayType)
  }
})

try{ CSVBlob.displayName ||= 'CSVBlob' } catch {}
try{ FileRendererBlob.displayName ||= 'FileRendererBlob' } catch {}
try{ BlobContent.displayName ||= 'BlobContent' } catch {}
try{ Blob.displayName ||= 'Blob' } catch {}