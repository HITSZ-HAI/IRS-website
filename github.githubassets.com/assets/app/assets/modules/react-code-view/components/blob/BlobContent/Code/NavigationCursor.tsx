/* eslint eslint-comments/no-use: off */
import {useCurrentRepository} from '@github-ui/current-repository'
import {editBlobPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {Box, Text} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
// useLocation is safe for files not rendered in a partial on the overview.
// eslint-disable-next-line no-restricted-imports
import {useLocation} from 'react-router-dom'

import {appendAndFocusSearchBar} from '../../../../../blackbird-monolith/utilities/append-and-focus-search-bar'
// eslint-disable-next-line no-restricted-imports
import {formatBlobRange} from '../../../../../github/blob-anchor'
import {useFilesPageInfo} from '../../../../hooks/FilesPageInfo'
import {useShortcut} from '../../../../hooks/shortcuts'
import {useCurrentLineHeight} from '../../../../hooks/use-current-line-height'
import {minLeftOffsetBlame, minLeftOffsetBlob, useCursorNavigation} from '../../../../hooks/use-cursor-navigation'
import type {SetStickyLinesType} from '../../../../hooks/use-sticky-lines'
import {getActualLineNumberBinarySearch, textAreaId} from '../../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../../DuplicateOnKeydownButton'
import type {CodeNavData} from '../BlobContent'
import HighlightedLineMenu, {firstOptionId, type HighlightedLineMenuHandle} from '../HighlightedLineMenu'
import type {CodeLineData} from './hooks/use-code-lines'

export function NavigationCursor({
  linesData,
  onCodeNavTokenSelected,
  onLineNumberClick,
  isBlame,
  isCursorVisible,
  isVirtualized,
  textAreaRef,
  shouldRenderOverlay,
  tabSize,
  optionalTestLeftOffsetFunction,
  textSelection,
  onCollapseToggle,
  onLineStickOrUnstick,
  optionalTestTopOffsetFunction,
  additionalTextAreaInstructions,
}: {
  linesData: readonly CodeLineData[]
  onCodeNavTokenSelected?: (symbol: CodeNavData) => void
  cursorClickPosition?: {startX: number; startY: number; endX: number; endY: number} | undefined
  onLineNumberClick?: React.MouseEventHandler<HTMLElement>
  isBlame: boolean
  isCursorVisible: boolean
  isVirtualized: boolean
  textAreaRef: React.RefObject<HTMLTextAreaElement> | undefined
  shouldRenderOverlay: boolean
  tabSize: number
  textSelection?: {start: number; end: number; keyboard: boolean; displayStart: boolean}
  additionalTextAreaInstructions: string
  onCollapseToggle: () => void
  onLineStickOrUnstick?: SetStickyLinesType
  optionalTestLeftOffsetFunction?: (leftOffset: number) => void
  optionalTestTopOffsetFunction?: (leftOffset: number) => void
}) {
  const [leftOffset, setLeftOffset] = useState(0)
  const [topOffset, setTopOffset] = useState(0)
  const [shouldShowHighlightMenu, setShouldShowHighlightMenu] = useState(false)
  const lastKeyPressed = useRef('')
  const menuRef = useRef<HighlightedLineMenuHandle>(null)
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()

  const {
    cursorNavigationHighlightLine,
    expandAndFocusLineContextMenu,
    cursorNavigationEnter,
    searchShortcut,
    cursorNavigationPageDown,
    cursorNavigationPageUp,
  } = useShortcut()

  //TODO: implement wrapping
  //const wrapOption = useCodeViewOptions().codeWrappingOption

  //wasExpandCollapseCodeSection will default to false for every call except the call from expand and collapse
  function onLineMenuClose(value: boolean, wasExpandCollapseCodeSection: boolean) {
    setShouldShowHighlightMenu(value)
    setTimeout(() => {
      //only if it was an expand/collapse event do we want to set the text area cursor position to be kinda near where
      //it should be. It's not exact, but I don't really think it's worth worrying over, becuase the alternative is
      //that the cursor is at the very end of the file (because the contents of the text area changed, that is the
      //default behavior)
      if (wasExpandCollapseCodeSection) determineAndSetTextAreaCursorPosition()
      textAreaRef?.current?.focus()
      //300ms timeout so that there is enough time for screen readers to read off their stuff before text area
      //screen reading takes over
    }, 300)
  }

  function showLineMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    event.stopPropagation()
    setShouldShowHighlightMenu(true)
    setTimeout(() => {
      //need to do it with a timeout so that the line menu is rendered when we are setting the anchor
      menuRef.current?.setAnchor(cursorRef.current)
    }, 0)
    return false
  }

  const location = useLocation()
  useEffect(() => {
    setLeftOffset(0)
    setTopOffset(0)
  }, [location.key])

  useEffect(() => {
    function keydownKeyChecking(event: KeyboardEvent) {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      lastKeyPressed.current = event.key
    }
    function contextMenuCheckDoNotTriggerBasicMenu(event: MouseEvent) {
      if (
        lastKeyPressed.current === 'ContextMenu' &&
        //-1 means it was the contextmenu hotkey button
        event.button === -1 &&
        (document.activeElement as Element)?.className.indexOf(firstOptionId) !== -1
      ) {
        lastKeyPressed.current = ''
        event?.preventDefault()
        event?.stopPropagation()
        return false
      }
    }

    window.oncontextmenu = contextMenuCheckDoNotTriggerBasicMenu
    window.addEventListener('keydown', keydownKeyChecking)

    return () => {
      window.removeEventListener('keydown', keydownKeyChecking)
      //setting the context menu to null resets it to just be the browser default
      window.oncontextmenu = null
    }
  }, [])

  const minLeftOffset = isBlame ? minLeftOffsetBlame : minLeftOffsetBlob
  const cursorRef = useRef<HTMLDivElement>(null)

  const {
    onEnter,
    updateUrlForLineNumber,
    onPageUp,
    onPageDown,
    currentStartLine,
    currentStartChar,
    currentEndLine,
    currentEndChar,
    determineAndSetTextAreaCursorPosition,
    getCorrectLineNumberWithCollapsedSections,
  } = useCursorNavigation(
    cursorRef,
    onCodeNavTokenSelected,
    optionalTestLeftOffsetFunction ?? setLeftOffset,
    optionalTestTopOffsetFunction ?? setTopOffset,
    linesData,
    isVirtualized,
    isBlame,
    onLineNumberClick,
    textAreaRef,
    tabSize,
    additionalTextAreaInstructions,
    textSelection,
  )
  const isMobile = useRef(false)

  function determineClosestParentCodeSection() {
    if (currentStartLine.current !== currentEndLine.current) {
      return null
    }
    const currentLineData = linesData[currentStartLine.current]
    if (!currentLineData) return null
    //if the current line is a start line, we don't have to do any extra work
    if (currentLineData.isStartLine) return currentLineData
    if (currentLineData.codeLineClassName === '') {
      //return null because there isn't a code section for this line
      return null
    }
    const lineCodeSections = currentLineData.codeLineClassName?.split('child-of-line-')
    if (!lineCodeSections || currentLineData.codeLineClassName?.indexOf('child-of-line-') === -1) {
      return null
    }
    //making this undefined if it can't find the lineCodeSection so that it doesn't pass the isNaN check
    const closestParentCodeSection = parseInt(lineCodeSections[lineCodeSections.length - 1]?.trim() ?? 'undefined')
    if (closestParentCodeSection && !Number.isNaN(closestParentCodeSection)) {
      if (
        linesData[closestParentCodeSection - 1] &&
        linesData[closestParentCodeSection - 1]?.lineNumber === closestParentCodeSection
      ) {
        //save the time of doing the binary search
        return linesData[closestParentCodeSection - 1]
      }
      //if any lines have been collapsed, we need to actually find the index in the linesData array
      //where the closestParentCodeSection is
      return linesData[getActualLineNumberBinarySearch(closestParentCodeSection, linesData)]
    }

    return null
  }

  useEffect(() => {
    isMobile.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  }, [])

  const lineHeight = useCurrentLineHeight('react-code-lines')
  const cursorSx = isCursorVisible
    ? {
        height: `${lineHeight}px`,
        width: '1.5px',
        backgroundColor: 'fg.default',
        position: 'absolute',
        visibility: isMobile.current ? 'hidden' : 'visible',
      }
    : {}

  let editorLinkHash
  if (currentStartLine.current === currentEndLine.current && currentStartChar.current === currentEndChar.current) {
    editorLinkHash = `#L${currentStartLine.current + 1}C${currentStartChar.current}`
  } else {
    editorLinkHash = `#${formatBlobRange({
      start: {line: currentStartLine.current + 1, column: currentStartChar.current},
      end: {line: currentEndLine.current + 1, column: currentEndChar.current},
    })}`
  }

  return (
    <>
      <Box
        aria-hidden={true}
        style={{
          top: topOffset,
          left: minLeftOffset + leftOffset,
        }}
        sx={cursorSx}
        ref={cursorRef}
        data-testid="navigation-cursor"
        className="code-navigation-cursor"
      >
        {' '}
      </Box>
      {shouldRenderOverlay && (
        <div
          style={{
            top: topOffset + lineHeight,
            left: minLeftOffset + leftOffset,
          }}
          className="position-absolute border rounded-2 color-bg-subtle px-3 py-2"
        >
          <Text sx={{pointerEvents: 'auto'}}>
            Code view is read-only.{' '}
            {refInfo.canEdit && (
              <Link
                to={editBlobPath({
                  owner: repo.ownerLogin,
                  repo: repo.name,
                  filePath: path,
                  commitish: refInfo.name,
                  hash: editorLinkHash,
                })}
              >
                Switch to the editor.
              </Link>
            )}
          </Text>
        </div>
      )}
      {shouldShowHighlightMenu && (
        <HighlightedLineMenu
          ref={menuRef}
          rowBeginId={`LG${getCorrectLineNumberWithCollapsedSections(currentStartLine.current)}`}
          rowBeginNumber={getCorrectLineNumberWithCollapsedSections(currentStartLine.current)}
          rowEndNumber={getCorrectLineNumberWithCollapsedSections(currentEndLine.current)}
          rowEndId={`LG${getCorrectLineNumberWithCollapsedSections(currentEndLine.current)}`}
          openOnLoad={true}
          cursorRef={cursorRef}
          onCollapseToggle={onCollapseToggle}
          onLineStickOrUnstick={onLineStickOrUnstick}
          lineData={determineClosestParentCodeSection()}
          onMenuClose={onLineMenuClose}
        />
      )}
      <button
        hidden={true}
        data-testid={'NavigationCursorEnter'}
        data-hotkey={cursorNavigationEnter.hotkey}
        onClick={onEnter}
        data-hotkey-scope={textAreaId}
      />
      <button
        hidden={true}
        data-testid={'NavigationCursorSetHighlightedLine'}
        data-hotkey={cursorNavigationHighlightLine.hotkey}
        onClick={updateUrlForLineNumber}
        data-hotkey-scope={textAreaId}
      />
      <button
        hidden={true}
        data-testid={'NavigationCursorSetHighlightAndExpandMenu'}
        data-hotkey={expandAndFocusLineContextMenu.hotkey}
        onClick={event => showLineMenu(event)}
        data-hotkey-scope={textAreaId}
      />
      <button
        hidden={true}
        data-testid={'NavigationCursorPageDown'}
        data-hotkey={cursorNavigationPageDown.hotkey}
        onClick={onPageDown}
        data-hotkey-scope={textAreaId}
      />
      <button
        hidden={true}
        data-testid={'NavigationCursorPageUp'}
        data-hotkey={cursorNavigationPageUp.hotkey}
        onClick={onPageUp}
        data-hotkey-scope={textAreaId}
      />

      {/* hotkeys which are only necessary for use while the text area has focus which don't have a logical home*/}
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={searchShortcut.hotkey}
        onButtonClick={() => {
          appendAndFocusSearchBar({
            retainScrollPosition: true,
            returnTarget: textAreaRef?.current ?? undefined,
          })
        }}
        onlyAddHotkeyScopeButton={true}
      />
    </>
  )
}

try{ NavigationCursor.displayName ||= 'NavigationCursor' } catch {}