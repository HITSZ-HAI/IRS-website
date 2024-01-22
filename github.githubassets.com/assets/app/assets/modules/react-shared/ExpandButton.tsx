import {SidebarCollapseIcon, SidebarExpandIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import React from 'react'

interface ExpandButtonProps {
  expanded?: boolean
  onToggleExpanded: React.MouseEventHandler<HTMLButtonElement>
  testid: string
  alignment: 'left' | 'right'
  ariaLabel: string
  ariaControls: string
  sx?: Record<string, unknown>
  dataHotkey?: string
  className?: string
}

export const ExpandButton = React.forwardRef(
  (
    {
      expanded,
      testid,
      ariaLabel,
      ariaControls,
      onToggleExpanded,
      sx,
      alignment,
      dataHotkey,
      className,
    }: ExpandButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => (
    <IconButton
      ref={ref}
      data-testid={expanded ? `collapse-${testid}` : `expand-${testid}`}
      aria-label={ariaLabel}
      aria-expanded={expanded}
      aria-controls={ariaControls}
      icon={
        expanded
          ? alignment === 'left'
            ? SidebarExpandIcon
            : SidebarCollapseIcon
          : alignment === 'left'
            ? SidebarCollapseIcon
            : SidebarExpandIcon
      }
      sx={{color: 'fg.muted', ...sx}}
      data-hotkey={dataHotkey}
      onClick={e => {
        onToggleExpanded(e)
      }}
      variant="invisible"
      className={className}
    />
  ),
)

ExpandButton.displayName = 'ExpandButton'
