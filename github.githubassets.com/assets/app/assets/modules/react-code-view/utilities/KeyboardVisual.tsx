import type {Shortcut} from '../hooks/shortcuts'

export function KeyboardVisual({shortcut}: {shortcut: Shortcut}) {
  return (
    <>
      {shortcut.text?.split(' ').map(keyValue => {
        return (
          <>
            <kbd key={keyValue}>{keyValue}</kbd>{' '}
          </>
        )
      })}
    </>
  )
}

try{ KeyboardVisual.displayName ||= 'KeyboardVisual' } catch {}