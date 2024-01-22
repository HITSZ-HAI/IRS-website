import {Dialog} from '@primer/react/experimental'
import {createPortal} from 'react-dom'

import {useShortcut} from '../../../../hooks/shortcuts'

export function TextAreaHelpDialog({onDismiss}: {onDismiss: () => void}) {
  const {expandAndFocusLineContextMenu, cursorNavigationEnter, cursorNavigationHighlightLine} = useShortcut()
  return createPortal(
    <Dialog width="large" aria-label="Code Blob Focused Hotkeys" onClose={onDismiss} title="Code Blob Focused Hotkeys">
      <div>
        <div>
          <div className="p-1">
            Select the line the cursor is on <kbd>{cursorNavigationHighlightLine.text}</kbd>
          </div>
          <div className="p-1">
            Select the symbol under the cursor <kbd>{cursorNavigationEnter.text}</kbd>
          </div>
          <div className="p-1">
            Move focus to the highlighted line menu <kbd>{expandAndFocusLineContextMenu.text}</kbd>
          </div>
        </div>
      </div>
    </Dialog>,
    document.body,
  )
}

try{ TextAreaHelpDialog.displayName ||= 'TextAreaHelpDialog' } catch {}