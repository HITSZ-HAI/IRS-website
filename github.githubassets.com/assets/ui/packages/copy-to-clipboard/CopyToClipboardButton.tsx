import {usePortalTooltip} from '@github-ui/portal-tooltip/use-portal-tooltip'
import useIsMounted from '@github-ui/use-is-mounted'
import type {Icon} from '@primer/octicons-react'
import {CheckIcon, CopyIcon} from '@primer/octicons-react'
import type {SxProp, TooltipProps} from '@primer/react'
import {Box, IconButton} from '@primer/react'
import React from 'react'
import {Tooltip} from '@primer/react/experimental'

import {copyText} from './copy'

const copyConfirmationMsDelay = 2000
const padding = 1

export interface CopyToClipboardButtonProps extends SxProp {
  /**
   * Component that will be shown for a few seconds after the user clicks copy.
   * By default, tooltip props and sx styles will be passed to the CopyConfirmationCheck default component.
   *
   * @default CopyConfirmationCheck
   */
  confirmationComponent?: React.ReactNode
  /**
   * Octocon that is displayed on the copy button
   *
   * @default CopyIcon
   */
  icon?: Icon
  /**
   * Size of the button, passed to IconButton
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * Optional callback that is invoked when the user clicks the copy button
   */
  onCopy?: () => void
  /**
   * Text that will be copied to the clipboard
   */
  textToCopy: string
  /**
   * Props that will be applied to tooltips
   */
  tooltipProps?: TooltipProps
  /**
   * Text that will be displayed in the tooltip
   */
  ariaLabel?: string | null
  /**
   * If the button should be accessible or not
   */
  accessibleButton?: boolean
  /**
   * Whether or not to use the portal tooltip
   */
  hasPortalTooltip?: boolean
}

const CopyConfirmationCheck = ({sx}: SxProp) => (
  <Box aria-label="Copied!" sx={{display: 'inline-block', color: 'success.fg', p: padding, mr: 1, ...sx}}>
    <CheckIcon />
  </Box>
)

export function CopyToClipboardButton({
  icon = CopyIcon,
  size = 'medium',
  onCopy,
  sx,
  textToCopy,
  tooltipProps,
  confirmationComponent = <CopyConfirmationCheck sx={sx} />,
  ariaLabel,
  accessibleButton,
  hasPortalTooltip = false,
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const isMounted = useIsMounted()
  const onClickCopy = () => {
    setCopied(true)
    void copyText(textToCopy)
    onCopy?.()
    setTimeout(() => isMounted() && setCopied(false), copyConfirmationMsDelay)
  }

  const label = ariaLabel ?? `Copy ${textToCopy} to clipboard`

  if (hasPortalTooltip) {
    return (
      <PortalTooltipCopyButton
        label={label}
        textToCopy={textToCopy}
        copied={copied}
        onClickCopy={onClickCopy}
        confirmationComponent={confirmationComponent}
        tooltipProps={tooltipProps}
        sx={{...sx}}
      />
    )
  }

  return copied ? (
    <>{confirmationComponent}</>
  ) : (
    <Tooltip text={label} aria-label={label} {...tooltipProps} sx={{position: 'absolute'}}>
      <IconButton
        aria-label={label}
        icon={icon}
        variant="invisible"
        size={size}
        tabIndex={accessibleButton === false ? -1 : 0}
        sx={{
          ...sx,
        }}
        onClick={onClickCopy}
      />
    </Tooltip>
  )
}

interface PortalTooltipCopyButtonProps extends CopyToClipboardButtonProps {
  /**
   * Text that will be displayed in the tooltip
   */
  label: string
  /**
   * Copy state
   */
  copied: boolean
  /**
   * Function to call when copy button is clicekd
   */
  onClickCopy: () => void
}

function PortalTooltipCopyButton({
  icon = CopyIcon,
  size = 'medium',
  label,
  accessibleButton,
  copied,
  onClickCopy,
  tooltipProps,
  sx,
}: PortalTooltipCopyButtonProps) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [buttonContentProps, buttonTooltipElement] = usePortalTooltip({
    contentRef,
    'aria-label': copied ? 'Copied!' : label,
    ...tooltipProps,
  })

  return (
    <Box ref={contentRef} {...buttonContentProps}>
      {copied ? (
        <Box sx={{...sx}}>
          <Box as="span" sx={{display: 'inline-block', color: 'success.fg', p: padding, mr: 1}}>
            <CheckIcon />
          </Box>
        </Box>
      ) : (
        <IconButton
          aria-label={label}
          icon={icon}
          variant="invisible"
          size={size}
          tabIndex={accessibleButton === false ? -1 : 0}
          sx={{...sx}}
          onClick={onClickCopy}
        />
      )}
      {buttonTooltipElement}
    </Box>
  )
}

try{ CopyConfirmationCheck.displayName ||= 'CopyConfirmationCheck' } catch {}
try{ CopyToClipboardButton.displayName ||= 'CopyToClipboardButton' } catch {}
try{ PortalTooltipCopyButton.displayName ||= 'PortalTooltipCopyButton' } catch {}