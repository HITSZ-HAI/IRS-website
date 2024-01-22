import {PortalTooltip, type PortalTooltipProps} from '@github-ui/portal-tooltip/portalled'
import {useCallback, useState} from 'react'

export function useAlertTooltip(
  id: string,
  contentRef: React.RefObject<HTMLElement>,
  portalTooltipProps?: Partial<PortalTooltipProps>,
): [(newMessage: string) => void, () => void, JSX.Element] {
  const [message, setMessage] = useState('')

  const clearMessage = useCallback(() => {
    setMessage('')
  }, [])

  const updateMessage = useCallback(
    (newMessage: string) => {
      setMessage(newMessage)
      if (contentRef.current !== document.activeElement) {
        setTimeout(clearMessage, 3000)
      }
    },
    [clearMessage, contentRef],
  )

  return [
    updateMessage,
    clearMessage,
    <AlertTooltip
      key={id}
      message={message}
      id={id}
      contentRef={contentRef}
      clearMessage={clearMessage}
      portalTooltipProps={portalTooltipProps}
    />,
  ]
}

function AlertTooltip({
  message,
  id,
  contentRef,
  clearMessage,
  portalTooltipProps,
}: {
  message: string
  id: string
  contentRef: React.RefObject<HTMLElement>
  clearMessage: () => void
  portalTooltipProps?: Partial<PortalTooltipProps>
}) {
  return message ? (
    <PortalTooltip
      id={id}
      contentRef={contentRef}
      aria-label={message}
      open={!!message}
      onMouseLeave={clearMessage}
      aria-live="assertive"
      {...portalTooltipProps}
    />
  ) : null
}

try{ AlertTooltip.displayName ||= 'AlertTooltip' } catch {}