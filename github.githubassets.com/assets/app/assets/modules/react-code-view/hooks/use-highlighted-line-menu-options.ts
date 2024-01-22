import {announce} from '@github-ui/aria-live'
import {useCallback} from 'react'

import type {CodeLineData} from '../components/blob/BlobContent/Code/hooks/use-code-lines'
import {collapseRow, expandRow, forceAnnouncementToScreenReaders} from '../utilities/lines'
import type {SetStickyLinesType} from './use-sticky-lines'

export const positionerID = 'highlighted-line-menu-positioner'
export const buttonHeight = 25

export function useHighlightedLineMenuOptions({
  lineData,
  onLineStickOrUnstick,
  onMenuClose,
  onCollapseToggle,
  setOpen,
}: {
  lineData?: CodeLineData | null
  onLineStickOrUnstick?: SetStickyLinesType
  onMenuClose?: (value: boolean, otherValue: boolean) => void
  onCollapseToggle?: () => void
  setOpen: (value: boolean) => void
}) {
  function setShouldBeOpen(openValue: boolean, wasExpandCollapse = false) {
    setOpen(openValue)
    if (onMenuClose && !openValue) {
      onMenuClose(openValue, wasExpandCollapse)
    }
  }

  function openUpRefSelector() {
    const refSelector = document.getElementsByClassName('ref-selector-class')
    if (refSelector && refSelector.length === 1) {
      //tree is expanded or tree is collapsed and user is scrolled to the top
      ;(refSelector[0] as HTMLElement)?.click()
      announce('ref selector opened')
    } else if (refSelector && refSelector.length === 2) {
      //tree is collapsed and the user has scrolled enough for the sticky header to be present
      ;(refSelector[1] as HTMLElement)?.click()
      announce('ref selector opened')
    }

    setShouldBeOpen(false)
  }

  function expandOrCollapseSection() {
    if (!lineData) return
    const {ownedSection} = lineData
    if (ownedSection) {
      if (ownedSection.collapsed) {
        expand()
        // eslint-disable-next-line i18n-text/no-en
        forceAnnouncementToScreenReaders('Code section expanded')
      } else {
        collapse()
        // eslint-disable-next-line i18n-text/no-en
        forceAnnouncementToScreenReaders('Code section collapsed')
      }
    }
    //close the menu, second parameter is to let the function know it was an expand or collapse event
    setShouldBeOpen(false, true)
  }

  const expand = useCallback(() => {
    if (!lineData) return
    const {lineNumber, ownedSection} = lineData
    if (ownedSection) ownedSection.collapsed = false
    onCollapseToggle?.()
    expandRow(lineNumber)
    onLineStickOrUnstick?.(lineData, true)
  }, [lineData, onCollapseToggle, onLineStickOrUnstick])

  const collapse = useCallback(() => {
    if (!lineData) return
    const {lineNumber, ownedSection} = lineData
    if (ownedSection) ownedSection.collapsed = true
    onCollapseToggle?.()
    collapseRow(lineNumber)
  }, [lineData, onCollapseToggle])

  return {
    setShouldBeOpen,
    expandOrCollapseSection,
    openUpRefSelector,
  }
}

export function calculatePosition(anchor: HTMLElement | null, offset = {x: 0, y: 0}): React.CSSProperties {
  const container = document.getElementById(positionerID)
  if (!anchor || !container) {
    return {display: 'none'}
  }

  const {top: anchorTop, left: anchorLeft, height: anchorHeight} = anchor.getBoundingClientRect()
  const {top: tableTop, left: tableLeft} = container.getBoundingClientRect()
  const topOffset = (buttonHeight - anchorHeight) / 2

  return {
    top: `${anchorTop - tableTop - topOffset + offset.y}px`,
    left: `${Math.max(anchorLeft - tableLeft + offset.x, 0) - 13}px`,
  }
}

export function calculateTextContentFromElement(element: Element | null): string {
  let textContent = element?.textContent ?? ''
  if (textContent !== '') {
    return textContent
  }

  if (element) {
    const children = element.childNodes

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as Element
      if (child) {
        let childTextContent = child.getAttribute('data-code-text')
        if (childTextContent === null) {
          //recurse down the tree if we don't have the data-code-text attribute (meaning the node was a parent)
          childTextContent = calculateTextContentFromElement(child)
        }
        textContent += childTextContent
      }
    }

    return textContent
  }
  return textContent
}
