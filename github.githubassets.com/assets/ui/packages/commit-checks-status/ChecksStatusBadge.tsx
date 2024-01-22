import {
  CheckCircleFillIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleIcon,
  DotFillIcon,
  type Icon,
  XCircleFillIcon,
  XCircleIcon,
  XIcon,
} from '@primer/octicons-react'
import {Box, Button, type ButtonProps, IconButton, Octicon, Text, Tooltip} from '@primer/react'
import {useId, useRef, useState} from 'react'

import type {CombinedStatusResult} from './index'
import {CheckStatusDialog} from './CheckStatusDialog'

interface ChecksStatusBadgeProps {
  statusRollup: string
  combinedStatus?: CombinedStatusResult
  variant?: 'circled' | 'filled' | 'default'
  onWillOpenPopup?: () => void
  disablePopover?: boolean
  buttonSx?: ButtonProps['sx']
  size?: ButtonProps['size']
  descriptionText?: string
}

interface IconProps {
  icon: Icon
  iconColor: string
}

const ICON_STYLE = {
  success: {
    circled: CheckCircleIcon,
    filled: CheckCircleFillIcon,
    default: CheckIcon,
    color: 'checks.donutSuccess',
  },
  pending: {
    circled: CircleIcon,
    filled: DotFillIcon,
    default: DotFillIcon,
    color: 'checks.donutPending',
  },
  error: {
    circled: XCircleIcon,
    filled: XCircleFillIcon,
    default: XIcon,
    color: 'checks.donutError',
  },
}

function IconOnlyStatus({
  descriptionText,
  icon,
  iconColor,
}: Pick<ChecksStatusBadgeProps, 'descriptionText'> & IconProps) {
  return (
    <span data-testid="checks-status-badge-icon-only">
      <Octicon
        icon={icon}
        aria-label={'See all checks'}
        sx={{
          color: iconColor,
        }}
      />
      {descriptionText && <Text> {descriptionText}</Text>}
    </span>
  )
}

export function ChecksStatusBadge(props: ChecksStatusBadgeProps) {
  const {
    statusRollup,
    combinedStatus,
    variant = 'default',
    disablePopover,
    buttonSx,
    size = 'medium',
    descriptionText = '',
  } = props
  const [isOpen, setIsOpen] = useState(false)
  const tooltipId = useId()
  const checkButtonRef = useRef<HTMLButtonElement>(null)
  const iconStyle = ICON_STYLE[statusRollup as keyof typeof ICON_STYLE]
  const {icon, iconColor} = {
    icon: iconStyle?.[variant] || ICON_STYLE.error[variant],
    iconColor: iconStyle?.color || ICON_STYLE.error.color,
  }

  if (disablePopover) {
    return <IconOnlyStatus descriptionText={descriptionText} icon={icon} iconColor={iconColor} />
  }

  return (
    <>
      <Box
        onClick={() => {
          setIsOpen(true)
          props.onWillOpenPopup
        }}
        onMouseEnter={props.onWillOpenPopup}
      >
        {descriptionText ? (
          <Button
            data-testid="checks-status-badge-button"
            leadingVisual={icon}
            variant="invisible"
            size={size}
            aria-label={combinedStatus?.checksStatusSummary ?? `Status checks: ${statusRollup}`}
            sx={{
              p: 1,
              color: 'fg.default',
              fontWeight: 'normal',
              svg: {color: iconColor},
              ...buttonSx,
            }}
            ref={checkButtonRef}
          >
            {descriptionText}
          </Button>
        ) : (
          <Tooltip
            id={tooltipId}
            aria-label={combinedStatus?.checksStatusSummary ?? statusRollup}
            direction="se"
            sx={{mr: 2}}
          >
            <IconButton
              data-testid="checks-status-badge-icon"
              icon={icon}
              variant="invisible"
              size={size}
              aria-labelledby={tooltipId}
              sx={{
                py: 0,
                px: 0,
                svg: {color: iconColor},
                ':hover:not([disabled])': {bg: 'pageHeaderBg'},
                ...buttonSx,
              }}
              ref={checkButtonRef}
            />
          </Tooltip>
        )}
      </Box>
      {isOpen && (
        <CheckStatusDialog
          combinedStatus={combinedStatus}
          isOpen={isOpen}
          onDismiss={() => {
            setIsOpen(false)
            setTimeout(() => {
              checkButtonRef.current?.focus()
            }, 0)
          }}
        />
      )}
    </>
  )
}

try{ IconOnlyStatus.displayName ||= 'IconOnlyStatus' } catch {}
try{ ChecksStatusBadge.displayName ||= 'ChecksStatusBadge' } catch {}