import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton} from '@primer/react'
import React, {useImperativeHandle, useState} from 'react'
import {createPortal} from 'react-dom'
import {useSearchParams} from 'react-router-dom'

// eslint-disable-next-line no-restricted-imports
import {copyText} from '../../../../github/command-palette/copy'
import {useDeferredMetadata} from '../../../contexts/DeferredMetadataContext'
import {useReposAppPayload} from '../../../hooks/FilesPageInfo'
import {useShortcut} from '../../../hooks/shortcuts'
import {
  calculatePosition,
  calculateTextContentFromElement,
  positionerID,
  useHighlightedLineMenuOptions,
} from '../../../hooks/use-highlighted-line-menu-options'
import type {SetStickyLinesType} from '../../../hooks/use-sticky-lines'
import {useUrlCreator} from '../../../hooks/use-url-creator'
import {forceAnnouncementToScreenReaders} from '../../../utilities/lines'
import {AllShortcutsEnabled} from '../../AllShortcutsEnabled'
import type {CodeLineData} from './Code/hooks/use-code-lines'

const portalRootID = 'highlighted-line-menu-container'
export const firstOptionId = 'highlighted-line-menu-first-option'

export function HighlightedLineMenuContainer({children}: React.PropsWithChildren<unknown>) {
  return (
    <div id={positionerID} className="position-relative">
      {children}
      <div id={portalRootID} />
    </div>
  )
}

interface HighlightedLineMenuProps {
  codeLineClassName?: string
  offset?: {x: number; y: number}
  lineData?: CodeLineData | null
  onLineStickOrUnstick?: SetStickyLinesType
  onMenuClose?: (value: boolean, otherValue: boolean) => void
  onCollapseToggle?: () => void
  openOnLoad?: boolean
  cursorRef?: React.RefObject<HTMLDivElement>
  rowBeginId: string
  rowBeginNumber: number
  rowEndId: string
  rowEndNumber: number
}

export interface HighlightedLineMenuHandle {
  setAnchor(anchor: HTMLElement | null): void
}

const HighlightedLineMenu = React.memo(React.forwardRef(HighlightedLineMenuWithRef))

export default HighlightedLineMenu

function HighlightedLineMenuWithRef(
  {
    codeLineClassName,
    offset,
    lineData,
    onLineStickOrUnstick,
    onMenuClose,
    onCollapseToggle,
    openOnLoad = false,
    cursorRef,
    rowBeginId,
    rowBeginNumber,
    rowEndId,
    rowEndNumber,
  }: HighlightedLineMenuProps,
  ref: React.ForwardedRef<HighlightedLineMenuHandle>,
) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  useImperativeHandle(ref, () => ({setAnchor}))
  const actionMenuRef = React.useRef<HTMLLIElement>(null)
  const {githubDevUrl} = useReposAppPayload()

  //make the button itself invisible when the menu is being opened up next to the cursor
  //also hide the button it is being repositioned so that it doesn't flash in the corner
  const [visibility, setVisibility] = useState(openOnLoad ? 'hidden' : 'visible')

  const [position, setPosition] = useState<React.CSSProperties>({top: 0, left: 0})

  // We need to wait for the virtualization render in order to know where this position should be
  // due to possible word wrapping
  useLayoutEffect(() => {
    const changePosition = () => {
      setVisibility('hidden')
      requestAnimationFrame(() => {
        setPosition(calculatePosition(anchor, offset))
        setVisibility('visible')
      })
    }
    changePosition()

    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('resize', changePosition)

    return () => {
      window.removeEventListener('resize', changePosition)
    }
  }, [anchor, offset])

  useLayoutEffect(() => {
    if (openOnLoad) {
      if (cursorRef) setAnchor(cursorRef.current)
      setTimeout(() => {
        setOpen(true)
        //50ms for the timeout because that gives the menu enough time to render and reposition itself so the
        //menu doesn't open up in the corner
      }, 50)
    }
    //we only want this to run when the component is initialized
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const useEndLineNumber = rowBeginId !== rowEndId

  const {newDiscussionPath, newIssuePath} = useDeferredMetadata()
  const {refSelectorShortcut} = useShortcut()

  const [open, setOpen] = React.useState(false)
  const {createPermalink, getUrl} = useUrlCreator()
  const {setShouldBeOpen, expandOrCollapseSection, openUpRefSelector} = useHighlightedLineMenuOptions({
    lineData,
    onLineStickOrUnstick,
    onMenuClose,
    onCollapseToggle,
    setOpen,
  })

  const [urlParams] = useSearchParams()
  const isPlain = urlParams.get('plain') === '1'

  const permalinkUrl = createPermalink({absolute: true, params: isPlain ? 'plain=1' : undefined})
  const encodedPermalinkUrl = encodeURIComponent(permalinkUrl)

  const linkHash = `L${rowBeginNumber}${useEndLineNumber ? `-L${rowEndNumber}` : ''}`

  const element = (
    <ActionMenu open={open} onOpenChange={setShouldBeOpen}>
      <ActionMenu.Anchor>
        <IconButton
          className={codeLineClassName}
          size="small"
          icon={KebabHorizontalIcon}
          aria-label={`Code line ${rowBeginNumber} options`}
          data-testid="highlighted-line-menu-button"
          sx={{
            alignSelf: 'center',
            position: 'absolute',
            lineHeight: '16px',
            height: '24px',
            width: '24px',
            visibility,
            ...position,
          }}
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="small">
        <ActionList>
          {rowBeginNumber === rowEndNumber && (
            <ActionList.Item
              onClick={() => {
                forceAnnouncementToScreenReaders(`Copied line ${rowBeginNumber}.`)
                const text = calculateTextContentFromElement(document.getElementById(`LC${rowBeginNumber}`))
                text && copyText(text)
                setShouldBeOpen(false)
              }}
              onSelect={() => {
                forceAnnouncementToScreenReaders(`Copied line ${rowBeginNumber}.`)
                const text = calculateTextContentFromElement(document.getElementById(`LC${rowBeginNumber}`))
                text && copyText(text)
                setShouldBeOpen(false)
              }}
              ref={actionMenuRef}
              className={firstOptionId}
            >
              Copy line
            </ActionList.Item>
          )}
          {rowBeginNumber !== rowEndNumber && (
            <ActionList.Item
              onClick={() => {
                forceAnnouncementToScreenReaders(`Copied lines ${rowBeginNumber}-${rowEndNumber}.`)
                let text = ''
                for (let i = rowBeginNumber; i <= rowEndNumber; i++) {
                  text += `${calculateTextContentFromElement(document.getElementById(`LC${i}`))}${
                    i !== rowEndNumber ? '\n' : ''
                  }`
                }
                text && copyText(text)
                setShouldBeOpen(false)
              }}
              onSelect={() => {
                forceAnnouncementToScreenReaders(`Copied lines ${rowBeginNumber}-${rowEndNumber}.`)
                let text = ''
                for (let i = rowBeginNumber; i <= rowEndNumber; i++) {
                  text += `${calculateTextContentFromElement(document.getElementById(`LC${i}`))}${
                    i !== rowEndNumber ? '\n' : ''
                  }`
                }
                text && copyText(text)
                setShouldBeOpen(false)
              }}
              className={firstOptionId}
            >
              Copy lines
            </ActionList.Item>
          )}
          {permalinkUrl && (
            <ActionList.Item
              onClick={() => {
                forceAnnouncementToScreenReaders(`Copied permalink.`)
                copyText(permalinkUrl)
                setShouldBeOpen(false)
              }}
              onSelect={() => {
                forceAnnouncementToScreenReaders(`Copied permalink.`)
                copyText(permalinkUrl)
                setShouldBeOpen(false)
              }}
            >
              Copy permalink
            </ActionList.Item>
          )}
          <ActionList.LinkItem href={getUrl({action: 'blame', hash: linkHash})}>View git blame</ActionList.LinkItem>
          {newIssuePath && permalinkUrl && (
            <ActionList.LinkItem href={`${newIssuePath}?permalink=${encodedPermalinkUrl}`}>
              Reference in new issue
            </ActionList.LinkItem>
          )}
          {newDiscussionPath && permalinkUrl && (
            <ActionList.LinkItem href={`${newDiscussionPath}?permalink=${encodedPermalinkUrl}`}>
              Reference in new discussion
            </ActionList.LinkItem>
          )}
          {githubDevUrl && (
            <ActionList.LinkItem href={githubDevUrl + window.location.pathname.substring(1)}>
              View file in GitHub.dev
            </ActionList.LinkItem>
          )}
          {rowBeginNumber === rowEndNumber && lineData && (
            <ActionList.Item onClick={expandOrCollapseSection} onSelect={expandOrCollapseSection}>
              {lineData.ownedSection && lineData.ownedSection.collapsed ? 'Expand' : 'Collapse'} current section
            </ActionList.Item>
          )}
          <ActionList.Item onClick={openUpRefSelector} onSelect={openUpRefSelector}>
            View file in different branch/tag
            <ActionList.TrailingVisual>
              <AllShortcutsEnabled>{refSelectorShortcut.text}</AllShortcutsEnabled>
            </ActionList.TrailingVisual>
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )

  const portalRoot = document.getElementById(portalRootID)

  return portalRoot ? createPortal(element, portalRoot) : null
}

try{ HighlightedLineMenuContainer.displayName ||= 'HighlightedLineMenuContainer' } catch {}
try{ HighlightedLineMenu.displayName ||= 'HighlightedLineMenu' } catch {}
try{ HighlightedLineMenuWithRef.displayName ||= 'HighlightedLineMenuWithRef' } catch {}