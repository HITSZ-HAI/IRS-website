import {IconButton, type IconButtonProps} from '@primer/react'

/**
 * An icon button that can handle disabled accessibility
 * This component does not support polymorphic forwarding refs (aka "as" prop) at this time
 */
export default function AccessibleIconButton({disabled, ...props}: IconButtonProps) {
  // the btn className is needed from Primer to trigger the btn[aria-disabled] visual styles
  const ariaDisabledProps: Pick<IconButtonProps, 'className' | 'onClick' | 'aria-disabled'> = disabled
    ? {className: 'btn', 'aria-disabled': true, onClick: e => e.preventDefault()}
    : {}

  return <IconButton size="small" {...props} {...ariaDisabledProps} />
}

try{ AccessibleIconButton.displayName ||= 'AccessibleIconButton' } catch {}