import {announce} from '@github-ui/aria-live'
import {getCurrentSize, ScreenSize} from '@github-ui/screen-size'
import {useCodeViewOptions} from '@github-ui/use-code-view-options'
import {useState} from 'react'

import {useBlobFocusedModifierShortcuts, useBlobFocusedShortcuts, useShortcut} from '../../../../hooks/shortcuts'
import {useCurrentLineHeight} from '../../../../hooks/use-current-line-height'
import {minLeftOffsetBlob, useIsCursorEnabled} from '../../../../hooks/use-cursor-navigation'
import {calculateLineNumberFromOffset, textAreaId} from '../../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../../DuplicateOnKeydownButton'
import {TextAreaHelpDialog} from './TextAreaHelpDialog'

//this is the height of the content that exists above where the code lines begin. This is also the
//approximation for users that do not have the staff bar enabled, which I think is the better choice to use
//it also highly likely will never be needed, but in the off chance something goes wrong this fallback is here
//to help approximate the correct offset
const approximateBlobYOffsetDesktop = 354
const approximateBlobYOffsetMobile = 423

export function TextArea({
  textAreaRef,
  setTextOverlayShouldBeVisible,
  setTextSelection,
  setAdditionalTextAreaInstructions,
  cursorClickStartRef,
  parentRef,
  tabSize,
  plainTextLinesAsString,
  numLines,
  setIsTextAreaFocused,
}: {
  textAreaRef: React.RefObject<HTMLTextAreaElement>
  setTextOverlayShouldBeVisible: (shouldRender: boolean) => void
  setTextSelection: ({
    start,
    end,
    keyboard,
  }: {
    start: number
    end: number
    keyboard: boolean
    displayStart: boolean
  }) => void
  setAdditionalTextAreaInstructions: (instructions: string) => void
  cursorClickStartRef: React.MutableRefObject<{startX: number; startY: number}> | undefined
  parentRef: React.RefObject<HTMLDivElement>
  tabSize: number
  plainTextLinesAsString: string
  numLines: number
  setIsTextAreaFocused: (value: React.SetStateAction<boolean>) => void
}) {
  const shouldUseCursor = useIsCursorEnabled()
  const wrapOption = useCodeViewOptions().codeWrappingOption
  const blobFocusShortcuts = useBlobFocusedShortcuts()
  const blobFocusModifierShortcuts = useBlobFocusedModifierShortcuts()
  const lineHeight = useCurrentLineHeight('react-code-lines')

  const textAreaHeight = lineHeight * (numLines + 1)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const {cursorNavigationOpenHelpDialog} = useShortcut()

  //we wonly want an exact regex match of a single character, not a substring match
  function exactRegexMatch(regex: RegExp, text: string) {
    const match = regex.exec(text)
    return match && match[0] === text
  }

  function handleKeydownWithinTextArea(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // we need to use the e.key syntax here because we need to know when to preventDefault and when not to
    if (
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      blobFocusShortcuts.includes(e.key) ||
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      (blobFocusModifierShortcuts.includes(e.key) &&
        (e.getModifierState('Control') ||
          e.getModifierState('Alt') ||
          e.getModifierState('Shift') ||
          e.getModifierState('Meta')))
    ) {
      //handle the scrolling for space and shift space (can't do it with data-hotkey because space is not a usable hotkey)
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === ' ') {
        e.preventDefault()
        if (e.shiftKey) {
          //appending the date.now to the end so that pressing the same key multiple times in a row still triggers
          //a sate update
          setAdditionalTextAreaInstructions(`PageUp${Date.now()}`)
        } else {
          setAdditionalTextAreaInstructions(`PageDown${Date.now()}`)
        }
      }

      //need to explicitly call out the dot hotkey because data-hotkey doesn't work with the dot character, like space
      //and because macs are weird, when you press option + a letter, it changes it to be some weird symbol by defualt
      //instead of just showing up as alt + the letter
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.altKey && e.ctrlKey && e.key === '˙') {
        setHelpDialogOpen(true)
      }
      setTextOverlayShouldBeVisible(false)
      setTimeout(() => {
        if (textAreaRef.current) {
          setTextSelection({
            start: textAreaRef.current.selectionStart,
            end: textAreaRef.current.selectionEnd,
            keyboard: true,
            displayStart: false,
          })
        }
      }, 5)
      //don't do anything because we want the hotkey behavior to be handled by the data-hotkey handlers
      //max line length requiring the eslint disable to be used multiple times
    } else if (
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      !e.ctrlKey &&
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      !e.metaKey &&
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      !e.altKey &&
      !e.shiftKey &&
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      (exactRegexMatch(/[a-zA-Z0-9-_ ]{1,1}/, e.key) || e.key === 'Backspace' || e.key === 'Enter')
    ) {
      //add the you can't edit this popup
      announce('Code view is read only.')
      setTextOverlayShouldBeVisible(true)
      e.preventDefault()
    } else {
      //don't do anything because we want the regular key press to work (tab, etc)
    }
  }

  return (
    <>
      <textarea
        id={textAreaId}
        ref={textAreaRef}
        onMouseUp={event =>
          mouseUpHandler(
            event,
            textAreaRef,
            setTextOverlayShouldBeVisible,
            setTextSelection,
            cursorClickStartRef,
            shouldUseCursor,
            parentRef,
            lineHeight,
          )
        }
        onMouseDown={event => mouseDownHandler(event, parentRef, shouldUseCursor, cursorClickStartRef, lineHeight)}
        aria-label={'file content'}
        aria-readonly={true}
        //this prevents the virtual keyboard from being popped up when a user is on mobile
        inputMode={'none'}
        tabIndex={0}
        aria-multiline={true}
        aria-haspopup={false}
        //needed to disable grammarly so that random code snippets don't get highlighted as grammar errors
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        style={{
          resize: 'none',
          marginTop: -2,
          paddingLeft: minLeftOffsetBlob,
          display: 'hidden',
          width: '100%',
          backgroundColor: 'unset',
          color: 'transparent',
          position: 'absolute',
          border: 'none',
          tabSize,
          outline: 'none',
          overflowX: 'auto',
          height: textAreaHeight,
          fontSize: '12px',
          lineHeight: '20px',
          overflowY: 'hidden',
          overflowWrap: wrapOption.enabled ? 'anywhere' : 'normal',
          whiteSpace: wrapOption.enabled ? 'pre-wrap' : 'pre',
        }}
        value={plainTextLinesAsString}
        onKeyDown={handleKeydownWithinTextArea}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        data-ms-editor="false"
        onDrop={e => {
          //if a user dropped a URL on the text area, open it in a new tab like it normally would instead of eating it
          const text = e.dataTransfer.getData('Text')
          try {
            // eslint-disable-next-line no-restricted-syntax
            const url = new URL(text)
            window.open(url, '_blank')?.focus()
          } catch (error) {
            //the thing dropped was not a URL, catch but don't do anything
          }
          return false
        }}
        onPaste={e => {
          e.preventDefault()
          return false
        }}
        onChange={() => {
          //need an empty on change handler to prevent react from complaining about a controlled component
          //we don't actually want to change the value on the textarea because it's readonly
          //but we can't put the readonly attribute on the textarea because then it won't be focusable
        }}
        className="react-blob-print-hide"
        onFocus={() => {
          setIsTextAreaFocused(true)
        }}
      />
      {helpDialogOpen && (
        <TextAreaHelpDialog
          onDismiss={() => {
            setHelpDialogOpen(false)
          }}
        />
      )}
      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={cursorNavigationOpenHelpDialog.hotkey}
        onButtonClick={() => {
          setHelpDialogOpen(true)
        }}
        onlyAddHotkeyScopeButton={true}
      />
    </>
  )
}

//mouseUpHandler will always fire before the onClick handler, so we will reset the information in the click handler
//if the user did a double or triple click
function mouseUpHandler(
  event: React.MouseEvent,
  textAreaRef: React.RefObject<HTMLTextAreaElement> | undefined,
  setTextOverlayShouldBeVisible: (shouldRender: boolean) => void,
  setTextSelection: ({
    start,
    end,
    keyboard,
  }: {
    start: number
    end: number
    keyboard: boolean
    displayStart: boolean
  }) => void,
  cursorClickStartRef: React.MutableRefObject<{startX: number; startY: number}> | undefined,
  shouldUseCursor: boolean,
  parentRef: React.RefObject<HTMLDivElement>,
  lineHeight: number,
) {
  if (!shouldUseCursor || event.defaultPrevented || !cursorClickStartRef) return

  if (event.button === 2) {
    event.preventDefault()
    event.stopPropagation()
    //it was a right click
  } else if (event.button === 0) {
    setTextOverlayShouldBeVisible(false)

    const screenSize = getCurrentSize(window.innerWidth)

    const isSmallScreen = screenSize < ScreenSize.medium
    const scrollTopOffset = parentRef.current?.getBoundingClientRect().top
      ? window.scrollY + parentRef.current?.getBoundingClientRect().top
      : isSmallScreen
        ? approximateBlobYOffsetMobile
        : approximateBlobYOffsetDesktop
    // Check if it the click is in the lines excluding the scroll bar
    if (parentRef.current && event.pageY > scrollTopOffset + parentRef.current?.clientHeight) {
      cursorClickStartRef.current = {startX: -2, startY: -2}
      return
    }
    const lineNumberOfClick = calculateLineNumberFromOffset(event.pageY, scrollTopOffset, lineHeight)
    const leftClickOffset = parentRef.current?.getBoundingClientRect().left || 0
    const xOffset = event.clientX - leftClickOffset - minLeftOffsetBlob

    let displayAtStart = false
    if (
      lineNumberOfClick < cursorClickStartRef.current.startY ||
      (lineNumberOfClick === cursorClickStartRef.current.startY && xOffset < cursorClickStartRef.current.startX)
    ) {
      displayAtStart = true
    }
    setTimeout(() => {
      if (textAreaRef && textAreaRef.current) {
        setTextSelection({
          start: textAreaRef.current.selectionStart,
          end: textAreaRef.current.selectionEnd,
          keyboard: false,
          displayStart: displayAtStart,
        })
      }
    }, 0)
  }
}
function mouseDownHandler(
  event: React.MouseEvent,
  parentRef: React.RefObject<HTMLDivElement>,
  shouldUseCursor: boolean,
  cursorClickStartRef: React.MutableRefObject<{startX: number; startY: number}> | undefined,
  lineHeight: number,
) {
  if (!shouldUseCursor || event.defaultPrevented || !cursorClickStartRef) return
  if (event.button === 2) {
    event.preventDefault()
    event.stopPropagation()
    return
    //it was a right click
  } else if (event.button === 0) {
    //it was a left click

    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.ctrlKey) {
      //it was a right click essentially
      event.preventDefault()
      event.stopPropagation()
      return
    }

    const screenSize = getCurrentSize(window.innerWidth)

    const isSmallScreen = screenSize < ScreenSize.medium
    const scrollTopOffset = parentRef.current?.getBoundingClientRect().top
      ? window.scrollY + parentRef.current?.getBoundingClientRect().top
      : isSmallScreen
        ? approximateBlobYOffsetMobile
        : approximateBlobYOffsetDesktop
    // Check if it the click is in the lines excluding the scroll bar
    if (parentRef.current && event.pageY > scrollTopOffset + parentRef.current?.clientHeight) {
      cursorClickStartRef.current = {startX: -2, startY: -2}
      return
    }
    const lineNumberOfClick = calculateLineNumberFromOffset(event.pageY, scrollTopOffset, lineHeight)
    const leftClickOffset = parentRef.current?.getBoundingClientRect().left || 0
    const xOffset = event.clientX - leftClickOffset - minLeftOffsetBlob
    cursorClickStartRef.current = {startX: xOffset, startY: lineNumberOfClick}
  }
}

try{ TextArea.displayName ||= 'TextArea' } catch {}