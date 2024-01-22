import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import useIsomorphicLayoutEffect from '@primer/react/lib-esm/utils/useIsomorphicLayoutEffect'
import {useCallback, useEffect, useMemo, useRef} from 'react'
import {CommandEvent, CommandEventHandlersMap} from '../command-event'
import type {CommandId} from '../commands'
import {CommandsContextProvider, useCommandsContext} from '../commands-context'
import {recordCommandTriggerEvent} from '../metrics'
import {useDetectConflicts} from '../use-detect-conflicts'
import {useOnKeyDown} from '../use-on-key-down'
import {useRegisterCommands} from '../commands-registry'

export interface ScopedCommandsProps {
  /** Map of command IDs to the corresponding event handler. */
  commands: CommandEventHandlersMap
  children: React.ReactNode
}

/**
 * Provide command handlers that only work when focus is within a certain part of the React component tree.
 * @example
 * <ScopedCommands commands={{
 *   'commentBox:formatBold': handleFormatBold
 * }}>
 *   <textarea></textarea>
 * </ScopedCommands>
 */
export const ScopedCommands = ({commands, children}: ScopedCommandsProps) => {
  // We store the commands object in a ref so the context won't change on every render and recalculate the whole child tree
  const commandsRef = useRef(commands)
  useIsomorphicLayoutEffect(() => {
    commandsRef.current = commands
  }, [commands])

  const parentContext = useCommandsContext()

  const triggerCommand = useCallback(
    <T extends CommandId>(commandId: T, domEvent: KeyboardEvent | MouseEvent) => {
      const handler = commandsRef.current[commandId]

      if (handler) {
        const event = new CommandEvent(commandId)
        try {
          handler(event)
        } finally {
          recordCommandTriggerEvent(event, domEvent)
        }
      } else {
        // no handler here, pass it on up
        parentContext.triggerCommand(commandId, domEvent)
      }
    },
    [parentContext],
  )

  useDetectConflicts('scoped', commands)

  useRegisterCommands(commands)

  const contextValue = useMemo(() => ({triggerCommand}), [triggerCommand])

  const onKeyDown = useOnKeyDown(CommandEventHandlersMap.keys(commands), triggerCommand)

  const keyDownProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  // Events first bubble up the DOM tree, then React handles them at the document level and rebuilds a 'synthetic'
  // JSX tree. If we only handle our events with React, we cannot stop native DOM handlers from capturing those events
  // first, even if we `stopPropagation`. For example, `@primer/behaviors` uses DOM handlers. So must handle events
  // with DOM handlers so we can 'get to them first'. However, this is not good enough because with scoped commands we
  // want the user to be able to fire commands when their focus is inside a menu overlay. This only works with React
  // handlers because overlays are rendered inside Portals. So we must bind _both_ DOM and React handlers, allowing
  // `useOnKeyDown` to handle ignoring duplicates.
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const target = containerRef.current
    // we are lying by passing DOM events to a React handler, but it works in this case because the handler we passed in can accept DOM events
    const handler = keyDownProps.onKeyDown as unknown as (e: KeyboardEvent) => void
    if (!target) return

    target.addEventListener('keydown', handler)
    return () => target.removeEventListener('keydown', handler)
  })

  // Typically we want to avoid `display: contents` due to its rocky history in terms of web browser accessibility
  // support. We've seen bugs appear, get fixed, and then regress again with this property. Unfortunately, there's no
  // good alternative here. We must wrap contents in some element to intercept keyboard shortcuts, and wrapping
  // contents in an element inherently introduces potential style and layout breaks. The only way to avoid that is
  // with `display: contents`; otherwise consumers will have to deal with fixing everything that this breaks every time
  // they use this component and they will be discouraged from adopting the new platform.
  return (
    <CommandsContextProvider value={contextValue}>
      <div style={{display: 'contents'}} ref={containerRef} {...keyDownProps}>
        {children}
      </div>
    </CommandsContextProvider>
  )
}

try{ ScopedCommands.displayName ||= 'ScopedCommands' } catch {}