import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import {CopilotIcon} from '@primer/octicons-react'
import {ButtonGroup, IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type {ComponentProps} from 'react'
import {useRef} from 'react'

// For some reason the tooltip makes these icons 16x18px which makes them off-center in the button
// Explicitly set the height to 16px to fix this
export const squareHeightSx = {
  height: '28px',
  width: '28px',
  'span[role=tooltip]': {
    height: '16px',
  },
}

export interface BaseCopilotChatButtonProps
  extends Omit<ComponentProps<typeof IconButton>, 'icon' | 'aria-label' | 'aria-labelledby'> {
  referenceType: string
  children?: JSX.Element
  containerSx?: BetterSystemStyleObject
}
const defaultContainerSx = {pr: 3} satisfies BetterSystemStyleObject
export function BaseCopilotChatButton({
  children,
  containerSx = defaultContainerSx,
  referenceType,
  ...props
}: BaseCopilotChatButtonProps) {
  const contentRef = useRef<HTMLButtonElement>(null)

  const label = `Ask Copilot about this ${referenceType}`

  const [attrs, portalElement] = usePortalTooltip({
    'aria-label': label,
    contentRef,
    direction: 'sw',
    anchorSide: 'outside-bottom',
  })

  return (
    <ButtonGroup sx={containerSx}>
      <IconButton
        ref={contentRef}
        icon={CopilotIcon}
        size="small"
        sx={{...squareHeightSx, color: children ? 'fg.muted' : 'fg.default'}}
        aria-label={label}
        data-testid="copilot-ask-menu"
        {...attrs}
        {...props}
      />
      {children}
      {portalElement}
    </ButtonGroup>
  )
}

try{ BaseCopilotChatButton.displayName ||= 'BaseCopilotChatButton' } catch {}