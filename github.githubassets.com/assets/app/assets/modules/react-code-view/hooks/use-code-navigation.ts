import {CodeNavigationInfo, type CodeSymbol} from '@github-ui/code-nav'
import type {BlobPayload} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useNavigate} from '@github-ui/use-navigate'
import {useCallback, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'

// eslint-disable-next-line no-restricted-imports
import {parseFileAnchor} from '../../github/blob-anchor'
import {useCurrentUser} from '../../react-shared/Repos/CurrentUser'
import type {CodeNavData} from '../components/blob/BlobContent/BlobContent'
import {isSymbol} from '../utilities/lines'
import {useFilesPageInfo} from './FilesPageInfo'
import {scrollLineIntoView} from './use-scroll-line-into-view'

export function useCodeNavigation(
  blob: BlobPayload,
  onCodeNavActivated: () => void,
  setValidCodeNav: (show: boolean) => void,
  hash: string,
  hasBlame: boolean,
) {
  const nav = useNavigate()
  const repo = useCurrentRepository()
  const user = useCurrentUser()
  const {refInfo, path} = useFilesPageInfo()

  const [isCodeNavLoading, setCodeNavLoading] = useState(false)

  const [urlParams] = useSearchParams()
  const isPlain = urlParams.get('plain') === '1'

  const codeNavInfo = useMemo(() => {
    setValidCodeNav(true)
    try {
      return new CodeNavigationInfo(
        repo,
        refInfo,
        path,
        !!user,
        blob.rawLines || [],
        blob.symbols?.symbols ?? [],
        blob.stylingDirectives,
        blob.language,
        isPlain,
        setCodeNavLoading,
      )
    } catch (e) {
      setValidCodeNav(false)
    }
  }, [repo, refInfo, path, blob, setValidCodeNav, isPlain, user])

  const [searchingText, setSearchingText] = useState<CodeNavData>(() => {
    const anchInfo = parseFileAnchor(hash)
    if (!anchInfo.blobRange?.start?.line) {
      return {selectedText: '', lineNumber: -1, offset: 0}
    }

    const isTextRangeOnSingleLineHighlighted =
      !hasBlame &&
      anchInfo.blobRange.start.line === anchInfo.blobRange.end.line &&
      anchInfo.blobRange.start.column !== null &&
      anchInfo.blobRange.end.column !== null &&
      anchInfo.blobRange.end.column - anchInfo.blobRange.start.column > 2 &&
      blob.stylingDirectives &&
      blob.stylingDirectives[anchInfo.blobRange.start.line - 1]?.length &&
      codeNavInfo?.blobLines[anchInfo.blobRange.start.line - 1]

    if (isTextRangeOnSingleLineHighlighted) {
      const highlightedText = codeNavInfo.blobLines[anchInfo.blobRange.start.line - 1]?.substring(
        anchInfo.blobRange.start.column! - 1,
        anchInfo.blobRange.end.column! - 1,
      )

      const stylingDirective = blob.stylingDirectives![anchInfo.blobRange.start.line - 1]?.find(
        directive =>
          directive.start === anchInfo.blobRange.start.column! - 1 &&
          directive.end === anchInfo.blobRange.end.column! - 1,
      )

      if (highlightedText && stylingDirective && isSymbol(highlightedText, stylingDirective.cssClass)) {
        return {
          selectedText: highlightedText,
          lineNumber: anchInfo.blobRange.start.line,
          offset: anchInfo.blobRange.start.column!,
        }
      } else {
        return {selectedText: '', lineNumber: -1, offset: 0}
      }
    } else if (hash && codeNavInfo && !hasBlame) {
      const sym = codeNavInfo.getSymbolOnLine(Number(hash.substring(2)))
      if (!sym) {
        return {selectedText: '', lineNumber: -1, offset: 0}
      }

      return {selectedText: sym.name, lineNumber: sym.lineNumber, offset: sym.ident.start.column}
    } else {
      return {selectedText: '', lineNumber: -1, offset: 0}
    }
  })

  const showCodeNavWithSymbol = useCallback(
    (sym: CodeSymbol) => {
      setSearchingText({selectedText: sym.name, lineNumber: sym.lineNumber, offset: sym.ident.start.column})
      onCodeNavActivated()

      nav(sym.href())
      scrollLineIntoView({line: sym.lineNumber})
    },
    [onCodeNavActivated, nav],
  )

  const showCodeNavForToken = useCallback(
    (codeNavData: CodeNavData) => {
      setSearchingText(codeNavData)
      onCodeNavActivated()
    },
    [onCodeNavActivated],
  )

  return {
    isCodeNavLoading,
    codeNavInfo,
    showCodeNavWithSymbol,
    showCodeNavForToken,
    setSearchingText,
    searchingText,
  }
}
