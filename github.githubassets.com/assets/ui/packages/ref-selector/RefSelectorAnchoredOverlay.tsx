import {GitBranchIcon, TagIcon, TriangleDownIcon} from '@primer/octicons-react'
import {AnchoredOverlay, Box, Button, Text} from '@primer/react'
import {useCallback, useMemo, useRef} from 'react'

import type {RefSelectorProps, RefType} from './RefSelector'
import {FocusKeys} from '@primer/behaviors'

type PickedRefSelectorProps = Pick<RefSelectorProps, 'currentCommitish' | 'hotKey' | 'onOpenChange' | 'size'>

export interface RefSelectorAnchoredOverlayProps extends PickedRefSelectorProps {
  overlayOpen: boolean
  onOverlayChange: (open: boolean) => void
  preventClosing?: boolean
  focusTrapEnabled?: boolean
  refType: RefType
  inputRef?: React.RefObject<HTMLInputElement>
  buttonClassName?: string
  allowResizing?: boolean
  idEnding?: string
  useFocusZone?: boolean
}

export function RefSelectorAnchoredOverlay(props: React.PropsWithChildren<RefSelectorAnchoredOverlayProps>) {
  const {
    hotKey,
    onOpenChange,
    size,
    currentCommitish,
    refType,
    children,
    preventClosing,
    inputRef,
    overlayOpen,
    onOverlayChange,
    focusTrapEnabled = true,
    buttonClassName,
    allowResizing,
    useFocusZone,
  } = props

  const extraIdEnding = props.idEnding ? `-${props.idEnding}` : `-${Date.now()}`
  // If we render multiple ref pickers on the page we need to ensure unique ids.
  const buttonIdRef = useRef(`branch-picker${extraIdEnding}`)

  const textAreaId = 'read-only-cursor-text-area'

  const onOverlayOpenChange = useCallback(
    (open: boolean) => {
      onOverlayChange(open)
      onOpenChange?.(open)
    },
    [onOpenChange, onOverlayChange],
  )

  const focusTrapSettings = useMemo(() => {
    if (focusTrapEnabled) {
      // Setting disabled to false does not work. Therefore, I need to return different object
      return {initialFocusRef: inputRef}
    }

    return {initialFocusRef: inputRef, disabled: true}
  }, [focusTrapEnabled, inputRef])

  return (
    <AnchoredOverlay
      open={overlayOpen}
      overlayProps={{role: 'dialog', width: 'medium'}}
      onOpen={() => onOverlayOpenChange(true)}
      // Prevent closing overlay, while working with the dialog
      onClose={() => !preventClosing && onOverlayOpenChange(false)}
      renderAnchor={anchorProps => (
        <>
          <Button
            {...anchorProps}
            data-hotkey={hotKey}
            size={size}
            sx={{
              svg: {color: 'fg.muted'},
              display: 'flex',
              minWidth: allowResizing ? 0 : undefined,
              '> span': {width: 'inherit'},
            }}
            trailingVisual={TriangleDownIcon}
            aria-label={`${currentCommitish} ${refType}`}
            data-testid="anchor-button"
            id={buttonIdRef.current}
            className={buttonClassName}
          >
            <Box sx={{display: 'flex', width: '100%'}}>
              <Box sx={{mr: 1, color: 'fg.muted'}}>
                {refType === 'tag' ? <TagIcon size="small" /> : <GitBranchIcon size="small" />}
              </Box>
              <Box
                sx={{
                  fontSize: 1,
                  minWidth: 0,
                  maxWidth: allowResizing ? undefined : 125,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                className="ref-selector-button-text-container"
              >
                <Text sx={{minWidth: 0}}>&nbsp;{currentCommitish}</Text>
              </Box>
            </Box>
          </Button>
          {/* this button is necessary so that the ref selector hotkey still works while the blob text area has focus
  and it doesnt' do anything if the text area does not have focus*/}
          <button
            hidden={true}
            data-hotkey={hotKey}
            onClick={() => onOverlayOpenChange(true)}
            data-hotkey-scope={textAreaId}
          />
        </>
      )}
      focusTrapSettings={focusTrapSettings}
      focusZoneSettings={useFocusZone ? {bindKeys: FocusKeys.ArrowAll | FocusKeys.Tab} : {disabled: true}}
    >
      <Box data-testid="overlay-content" aria-labelledby={buttonIdRef.current} id="selectPanel">
        {children}
      </Box>
    </AnchoredOverlay>
  )
}

try{ RefSelectorAnchoredOverlay.displayName ||= 'RefSelectorAnchoredOverlay' } catch {}