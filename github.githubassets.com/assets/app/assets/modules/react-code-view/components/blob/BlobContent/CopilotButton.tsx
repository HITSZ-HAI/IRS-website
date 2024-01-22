import CopilotChatButton from '@github-ui/copilot-chat/components/CopilotChatButton'
import type {CopilotChatReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import type {RefType} from '@github-ui/ref-utils'
import {qualifyRef} from '@github-ui/ref-utils'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {Box} from '@primer/react'
import React, {useImperativeHandle, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'

import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import {buttonHeight} from '../../../hooks/use-highlighted-line-menu-options'

const positionerID = 'copilot-button-positioner'
const portalRootID = 'copilot-button-container'

export function CopilotButtonContainer({children}: React.PropsWithChildren<unknown>) {
  return (
    <Box id={positionerID} sx={{position: 'relative'}}>
      {children}
      <div id={portalRootID} />
    </Box>
  )
}

interface CopilotButtonProps {
  rowBeginNumber: number
  rowEndNumber: number
}

export interface CopilotButtonHandle {
  setAnchor(anchor: HTMLElement | null): void
}

export const CopilotButton = React.memo(React.forwardRef(CopilotButtonWithRef))

function CopilotButtonWithRef(
  {rowBeginNumber, rowEndNumber}: CopilotButtonProps,
  ref: React.ForwardedRef<CopilotButtonHandle>,
) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  useImperativeHandle(ref, () => ({setAnchor}))

  const [position, setPosition] = useState<React.CSSProperties>({top: 0, left: 0})

  // We need to wait for the virtualization render in order to know where this position should be
  // due to possible word wrapping
  useLayoutEffect(() => {
    const changePosition = () => requestAnimationFrame(() => setPosition(calculateCopilotButtonPosition(anchor)))
    changePosition()

    // eslint-disable-next-line github/prefer-observers
    window.addEventListener('resize', changePosition)

    return () => {
      window.removeEventListener('resize', changePosition)
    }
  }, [anchor])

  // Copilot Menu Actions
  const {copilotAccessAllowed, refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const {language, languageID} = useCurrentBlob()
  const messageReference: CopilotChatReference = useMemo(
    () => ({
      type: 'snippet',
      languageID,
      languageName: language,
      path,
      range: {start: rowBeginNumber, end: rowEndNumber},
      ref: qualifyRef(refInfo.name, refInfo.refType as RefType),
      commitOID: refInfo.currentOid,
      repoID: repo.id,
      repoName: repo.name,
      repoOwner: repo.ownerLogin,
      url: window.location.href,
    }),
    [languageID, language, path, rowBeginNumber, rowEndNumber, refInfo, repo],
  )

  const element = (
    <div
      style={{
        alignSelf: 'center',
        position: 'absolute',
        lineHeight: '16px',
        height: '24px',
        width: '24px',
        ...position,
      }}
    >
      <CopilotChatButton copilotAccessAllowed={copilotAccessAllowed} messageReference={messageReference} />
    </div>
  )

  const portalRoot = document.getElementById(portalRootID)

  return portalRoot ? createPortal(element, portalRoot) : null
}

export function calculateCopilotButtonPosition(anchor: HTMLElement | null, offset = {x: 0, y: 0}): React.CSSProperties {
  const container = document.getElementById(positionerID)
  if (!anchor || !container) {
    return {display: 'none'}
  }

  const {top: anchorTop, height: anchorHeight} = anchor.getBoundingClientRect()
  const {top: tableTop} = container.getBoundingClientRect()
  const topOffset = (buttonHeight - anchorHeight) / 2

  return {
    top: `${anchorTop - tableTop - topOffset + offset.y + 1}px`,
    // Don't need to calculate this. This provides 8px spacing between
    // the edge of the button and edge of the blob
    right: '37px',
  }
}

try{ CopilotButtonContainer.displayName ||= 'CopilotButtonContainer' } catch {}
try{ CopilotButton.displayName ||= 'CopilotButton' } catch {}
try{ CopilotButtonWithRef.displayName ||= 'CopilotButtonWithRef' } catch {}