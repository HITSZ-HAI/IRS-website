// ### Example Markup
//
//   <div class="js-task-list-container">
//     <task-lists disabled sortable>
//       <div class="js-comment-body">
//         <ul class="contains-task-list">
//           <li class="task-list-item">
//             <input type="checkbox" class="task-list-item-checkbox" disabled>
//             text
//           </li>
//         </ul>
//       </div>
//     </task-lists>
//     <form class="js-comment-update">
//       <textarea class="js-task-list-field">- [ ] text</textarea>
//     </form>
//   </div>
//
// ### Specification
//
// TaskLists MUST be contained in a `(div).js-task-list-container`.
//
// TaskList Items SHOULD be an a list (`UL`/`OL`) element.
//
// Task list items MUST match `(input).task-list-item-checkbox` and MUST be
// `disabled` by default.
//
// TaskLists MUST have a `(textarea).js-task-list-field` form element whose
// `value` attribute is the source (Markdown) to be updated. The source MUST
// follow the syntax guidelines.
//
// ### NOTE
//
// Task list checkboxes are rendered as disabled by default because rendered
// user content is cached without regard for the viewer.

import {compose, fromEvent} from '@github-ui/subscription'
// eslint-disable-next-line no-restricted-imports
import {fire, on} from 'delegated-events'

import TaskListsElement from '@github/task-lists-element'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {remoteForm} from '@github/remote-form'
import {requestSubmit} from '@github-ui/form-utils'

type Position = [number, number]

interface CheckPayload {
  operation: 'check'
  position: Position
  checked: boolean
}

interface ConvertPayload {
  operation: 'convert_to_block'
  position: number
}

interface MovePayload {
  operation: 'move'
  src: Position
  dst: Position
}

// Enable task lists with persistence fields. Otherwise, the viewer lacks
// permission to update the comment so task lists remain disabled.
observe('.js-task-list-container .js-task-list-field', function (el) {
  const container = el.closest<HTMLElement>('.js-task-list-container')!
  enableTaskList(container)
  updateProgress(container)
})

// Add the task list conversion button to the container
observe('.js-convert-tasklist-to-block-enabled .contains-task-list', function (el) {
  const parentContainer = findTopLevelTasklistContainer(el)
  if (!parentContainer) return
  const alreadyContainsButton = Array.from(parentContainer.children).some(child =>
    child.classList.contains('task-list-item-convert-container'),
  )
  if (alreadyContainsButton) return
  const template = el.ownerDocument.querySelector<HTMLTemplateElement>('.js-convert-to-block-template')
  const clonedNode = template?.content.cloneNode(true)
  if (!clonedNode) return
  parentContainer.appendChild(clonedNode)
})

on('task-lists-move', 'task-lists', function (event) {
  const {src, dst} = event.detail
  const container = event.currentTarget.closest<HTMLElement>('.js-task-list-container')!
  saveTaskList(container, 'reordered', {operation: 'move', src, dst})
})

on('task-lists-check', 'task-lists', function (event) {
  const {position, checked} = event.detail
  const container = event.currentTarget.closest<HTMLElement>('.js-task-list-container')!
  saveTaskList(container, `checked:${checked ? 1 : 0}`, {operation: 'check', position, checked})
})

on('click', '.js-convert-to-block-button', function (event) {
  const parentContainer = findTopLevelTasklistContainer(event.target! as Element)
  if (!parentContainer) return
  const taskListContainer = parentContainer.closest('task-lists')
  if (!taskListContainer) throw new Error('parent not found')
  const position = listIndex(parentContainer)
  const container = event.currentTarget.closest<HTMLElement>('.js-task-list-container')!
  saveTaskList(container, `converted`, {operation: 'convert_to_block', position})
})

export function enableTaskList(container: Element) {
  if (container.querySelector('.js-task-list-field')) {
    const taskLists = container.querySelectorAll('task-lists')
    for (const el of taskLists) {
      if (el instanceof TaskListsElement) {
        el.disabled = false
        const buttons = el.querySelectorAll('button')
        for (const button of buttons) {
          button.disabled = false
        }
      }
    }
  }
}

export function disableTaskList(container: Element) {
  for (const el of container.querySelectorAll('task-lists')) {
    if (el instanceof TaskListsElement) {
      el.disabled = true

      const buttons = el.querySelectorAll('button')
      for (const button of buttons) {
        button.disabled = true
      }
    }
  }
}

// Persist task list source changes.
//
// Adds a hidden tracking input to the form to trigger server-side
// instrumentation.
function saveTaskList(container: Element, track: string, payload: CheckPayload | MovePayload | ConvertPayload) {
  const form = container.querySelector<HTMLFormElement>('.js-comment-update')!

  disableTaskList(container)
  updateProgress(container)

  const previousTracking = form.elements.namedItem('task_list_track')
  if (previousTracking instanceof Element) previousTracking.remove()

  const previousOperation = form.elements.namedItem('task_list_operation')
  if (previousOperation instanceof Element) previousOperation.remove()

  const tracking = document.createElement('input')
  tracking.setAttribute('type', 'hidden')
  tracking.setAttribute('name', 'task_list_track')
  tracking.setAttribute('value', track)
  form.appendChild(tracking)

  const operation = document.createElement('input')
  operation.setAttribute('type', 'hidden')
  operation.setAttribute('name', 'task_list_operation')
  operation.setAttribute('value', JSON.stringify(payload))
  form.appendChild(operation)

  if (!form.elements.namedItem('task_list_key')) {
    const field = form.querySelector('.js-task-list-field')!
    const name = field.getAttribute('name')!
    const value = name.split('[')[0]!
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', 'task_list_key')
    input.setAttribute('value', value)
    form.appendChild(input)
  }

  // If the user has ran into a stale error and is now re-submitting, hide it
  container.classList.remove('is-comment-stale')

  requestSubmit(form)
}

remoteForm('.js-task-list-container .js-comment-update', async function (form, wants) {
  const container = form.closest('.js-task-list-container')!
  const tracking = form.elements.namedItem('task_list_track')
  if (tracking instanceof Element) tracking.remove()

  const operation = form.elements.namedItem('task_list_operation')
  if (operation instanceof Element) operation.remove()

  let response
  try {
    response = await wants.json()
  } catch (error) {
    let data
    try {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      data = JSON.parse(error.response.text)
    } catch (e) {
      // Do nothing
    }

    if (data && data.stale) {
      const commentField = container.querySelector<HTMLTextAreaElement>('.js-task-list-field')!

      // Prevent the stale value of this field from being persisted (and, eventually, erroneously
      // restored) if the page is refreshed. We will undo this (and restore the session-resumable
      // behaviour) if the user clicks the 'Cancel' button to discard the stale edits in this field.
      commentField.classList.add('session-resumable-canceled')
      commentField.classList.remove('js-session-resumable')
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    } else if (error.response.status === 422) {
      // Do nothing
    } else {
      window.location.reload()
    }
  }

  if (response) {
    if (operation) {
      // Store reordered Markdown source in textarea.
      if (response.json.source) {
        container.querySelector<HTMLTextAreaElement>('.js-task-list-field')!.value = response.json.source
      }
    }
    enableTaskList(container)
    requestAnimationFrame(() => updateProgress(container))
  }
})

// This flag specifies whether `beforeinput` handler is called before `input` event
// This logic is needed because Chrome (Version 86.0.4240.198) has a bug with event.inputType == 'insertText' && event.data == null in textarea
// But Firefox does not support `beforeinput` yet (as of 9th December 2020)
let handleAutocomplete = false

// This flag is used to track if a text composition system (as the helper for JP kanji symbols)
// has popped up on the screen or not.
// This is needed because the custom tabbing behavior implemented here interferes with the system element
let isIMEVisible = false

// This flag is used to track if the document.execCommand functionality is available
// This is prefered to use the native execCommand because it allow the use of the undo/redo functionality
let canUseExecCommand: boolean | null = null

// This handler will set the handleAutocomplete flag so that all browsers except Firefox can handle the event correctly in autoCompleteOnInput
function tryAutoCompleteOnBeforeInput(ev: Event) {
  const event = ev as InputEvent

  const isNewLine = event.inputType === 'insertLineBreak'
  if (!isNewLine) {
    handleAutocomplete = false
  } else {
    handleAutocomplete = true
  }
}

// This handler will try autocomplete the text in textarea in all browsers
function autoCompleteOnInput(ev: Event) {
  const event = ev as InputEvent

  // in Firefox this check will always pass
  if (!handleAutocomplete) {
    // this block will be called only in Firefox
    // when `beforeinput` support is added to Firefox, this whole check can be removed
    const isNewLine = event.inputType === 'insertLineBreak'
    if (!isNewLine) return
  }

  const element = event.target as HTMLInputElement
  listAutocomplete(element)
  handleAutocomplete = false
}

function listAutocomplete(element: HTMLInputElement) {
  const result = autocompletedList(element.value, [element.selectionStart, element.selectionEnd])
  if (result === undefined) return

  updateElementText(element, result)
}

function updateElementText(element: HTMLInputElement, updatedText: UpdatedText) {
  if (canUseExecCommand === null || canUseExecCommand === true) {
    element.contentEditable = 'true'
    try {
      handleAutocomplete = false // disable autocomplete due to recursion from insert text event
      let value = undefined
      if (updatedText.commandId === Command.insertText) {
        value = updatedText.autocompletePrefix
        // check if a specific part of the text should be overwritten
        if (updatedText.writeSelection[0] !== null && updatedText.writeSelection[1] !== null) {
          element.selectionStart = updatedText.writeSelection[0]
          element.selectionEnd = updatedText.writeSelection[1]
        }
      } else {
        // set the selection to delete the current row
        element.selectionStart = updatedText.selection[0]
      }
      canUseExecCommand = document.execCommand(updatedText.commandId, false, value)
    } catch (error) {
      canUseExecCommand = false
    }
    element.contentEditable = 'false'
  }

  if (!canUseExecCommand) {
    try {
      document.execCommand('ms-beginUndoUnit')
    } catch (e) {
      // Do nothing.
    }
    element.value = updatedText.text
    try {
      document.execCommand('ms-endUndoUnit')
    } catch (e) {
      // Do nothing.
    }
    element.dispatchEvent(new CustomEvent('input', {bubbles: true, cancelable: true}))
  }

  if (updatedText.selection[0] != null && updatedText.selection[1] != null) {
    element.selectionStart = updatedText.selection[0]
    element.selectionEnd = updatedText.selection[1]
  }
}

function handleShiftEnter(ev: Event) {
  // TODO: Refactor to use data-hotkey
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (isIMEVisible) {
    return
  }

  const event = ev as KeyboardEvent

  if (event.key === 'Enter' && event.shiftKey && !event.metaKey) {
    const element = event.target as HTMLInputElement

    const result = addSoftNewline(element.value, [element.selectionStart, element.selectionEnd])
    if (result === undefined) return

    updateElementText(element, result)

    event.preventDefault()
    // Trigger size-to-fit (see github/github#15696)
    fire(element, 'change')
  }
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
}

function onCompositionStart() {
  isIMEVisible = true
}

function onCompositionEnd() {
  isIMEVisible = false
}

function updateIndentation(ev: Event) {
  // TODO: Refactor to use data-hotkey
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  if (isIMEVisible) {
    return
  }

  const event = ev as KeyboardEvent
  if (event.key === 'Escape') {
    deselectText(ev)
    return
  }

  if (event.key !== 'Tab') return

  const element = event.target as HTMLInputElement

  const result = indent(element.value, [element.selectionStart, element.selectionEnd], event.shiftKey)
  if (result === undefined) return

  event.preventDefault()

  updateElementText(element, result)
}

observe('.js-task-list-field', {
  subscribe: el =>
    compose(
      fromEvent(el, 'keydown', updateIndentation),
      fromEvent(el, 'keydown', handleShiftEnter),
      fromEvent(el, 'beforeinput', tryAutoCompleteOnBeforeInput),
      fromEvent(el, 'input', autoCompleteOnInput),
      fromEvent(el, 'compositionstart', onCompositionStart),
      fromEvent(el, 'compositionend', onCompositionEnd),
    ),
})

// subset of https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#commands
enum Command {
  insertText = 'insertText',
  delete = 'delete',
}

type UpdatedText = {
  text: string
  autocompletePrefix: string
  selection: SelectionRange
  writeSelection: SelectionRange
  commandId: Command
}

type SelectionRange = [number | null, number | null]

const INDENTATION_RE = /^(\s*)?/
export function addSoftNewline(text: string, selection: SelectionRange): UpdatedText | undefined {
  const offset = selection[0]
  if (!offset || !text) return undefined

  const lines = text.substring(0, offset).split('\n')
  const currentLine = lines[lines.length - 1]
  const match = currentLine?.match(INDENTATION_RE)
  if (!match) return undefined

  const indentation = match[1] || ''
  const autocompletePrefix = `\n${indentation}`
  return {
    text: text.substring(0, offset) + autocompletePrefix + text.substring(offset),
    autocompletePrefix,
    selection: [offset + autocompletePrefix.length, offset + autocompletePrefix.length],
    commandId: Command.insertText,
    writeSelection: [null, null],
  }
}

// matches '- ', '* ', '12. ', '- [ ]', '- [x]', `* [ ] `, `* [x] `, '12. [ ] ', '12. [x] '
const TASK_LIST_RE = /^(\s*)([*-]|(\d+)\.)\s(\[[\sx]\]\s)?/

function updateRemainingNumberBullets(text: string, currentNumber: number): string {
  let lines = text.split('\n')

  lines = lines.map(line => {
    // regexp to check if string starts with number
    if (line.replace(/^\s+/, '').startsWith(`${currentNumber}.`)) {
      const result = line.replace(`${currentNumber}`, `${currentNumber + 1}`)
      currentNumber += 1
      return result
    }
    return line
  })

  return lines.join('\n')
}

export function autocompletedList(text: string, selection: SelectionRange): UpdatedText | undefined {
  const offset = selection[0]
  if (!offset || !text) return undefined

  const lines = text.substring(0, offset).split('\n')
  const previousLine = lines[lines.length - 2]

  // Check for task list existence
  const match = previousLine?.match(TASK_LIST_RE)
  if (!match) return undefined

  const listPrefix = match[0]
  const indentation = match[1]
  const bullet = match[2]
  const numericBullet = parseInt(match[3]!, 10)
  const hasCheckbox = Boolean(match[4])
  const isNumericBullet = !isNaN(numericBullet)
  const newBullet = isNumericBullet ? `${numericBullet + 1}.` : bullet
  let newPrefix = `${newBullet} ${hasCheckbox ? '[ ] ' : ''}`

  let currentLineEnd = text.indexOf('\n', offset)
  if (currentLineEnd < 0) {
    currentLineEnd = text.length
  }
  const currentLine = text.substring(offset, currentLineEnd)
  // do not append list item if already present
  if (currentLine.startsWith(newPrefix)) {
    newPrefix = ''
  }
  /*
    Autocomplete list element on next line if current line has list element containing text.
    or there's text on the line after the cursor (|):
    ```
    - | some text
    ```
    becomes:
    ```
    -
    - | some text
    ```
   */
  const shouldAutocomplete = previousLine!.replace(listPrefix, '').trim().length > 0 || currentLine.trim().length > 0
  if (shouldAutocomplete) {
    let autocompletePrefix = `${indentation}${newPrefix}`
    let autocompletePostfix = text.substring(offset)
    const autocompletePrefixLength = autocompletePrefix.length

    let writeSelection = [null, null] as SelectionRange
    const whiteSpaceRegex = /^\s*$/g
    let resultText = text.substring(0, offset) + autocompletePrefix + autocompletePostfix

    if (isNumericBullet && !text.substring(offset).match(whiteSpaceRegex)) {
      autocompletePostfix = updateRemainingNumberBullets(text.substring(offset), numericBullet + 1)
      autocompletePrefix += autocompletePostfix
      writeSelection = [offset, offset + autocompletePrefix.length] as SelectionRange
      resultText = text.substring(0, offset) + autocompletePrefix
    }

    return {
      text: resultText,
      autocompletePrefix,
      selection: [offset + autocompletePrefixLength, offset + autocompletePrefixLength],
      commandId: Command.insertText,
      writeSelection,
    }
  } else {
    // This case clears the autocompleted list element if user hits an enter without adding any text to it.
    const offsetWithoutPrefix = offset - `\n${listPrefix}`.length
    return {
      autocompletePrefix: '',
      text: text.substring(0, offsetWithoutPrefix) + text.substring(offset),
      selection: [offsetWithoutPrefix, offsetWithoutPrefix],
      commandId: Command.delete,
      writeSelection: [null, null],
    }
  }
}

export function indent(text: string, selection: SelectionRange, substract: boolean): UpdatedText | undefined {
  // Perform indentation manipulations only when more than one character was selected.
  const selectionStart = selection[0] || 0
  const selectionEnd = selection[1] || selectionStart
  if (selection[0] === null || selectionStart === selectionEnd) return undefined

  const startOffset = text.substring(0, selectionStart).lastIndexOf('\n') + 1
  const endOffsetPreNormalization = text.indexOf('\n', selectionEnd - 1)
  const endOffset = endOffsetPreNormalization > 0 ? endOffsetPreNormalization : text.length - 1
  const selectedLines = text.substring(startOffset, endOffset).split('\n')

  let startUpdated = false
  let selectionStartDiff = 0
  let selectionEndDiff = 0
  const updatedSelectedLines: string[] = []
  for (const line of selectedLines) {
    const match = line.match(/^\s*/)
    if (match) {
      let indentation = match[0]
      const lineText = line.substring(indentation.length)
      if (substract) {
        const prevLength = indentation.length
        indentation = indentation.slice(0, -2)

        // Update selectionStart for first line only.
        selectionStartDiff = startUpdated ? selectionStartDiff : indentation.length - prevLength
        startUpdated = true
        selectionEndDiff += indentation.length - prevLength
      } else {
        indentation += '  '
        selectionStartDiff = 2
        selectionEndDiff += 2
      }
      updatedSelectedLines.push(indentation + lineText)
    }
  }

  const linesString = updatedSelectedLines.join('\n')
  const newText = text.substring(0, startOffset) + linesString + text.substring(endOffset)
  const newRange: SelectionRange = [
    Math.max(startOffset, selectionStart + selectionStartDiff),
    selectionEnd + selectionEndDiff,
  ]
  return {
    text: newText,
    selection: newRange,
    autocompletePrefix: linesString,
    commandId: Command.insertText,
    writeSelection: [startOffset, endOffset],
  }
}

export function listIndex(list: Element): number {
  const container = list.closest('task-lists')
  if (!container) throw new Error('parent not found')
  // TODO: De-duplicate this query with respect to https://github.com/github/task-lists-element/pull/32/files#diff-bea14c7a32797e69e22afe268a352c644b1286e415a79e1cf35ef9ebea42b3a3R178-R183
  const lists = Array.from(container.querySelectorAll('ol, ul')).filter(item => {
    return !item.closest('tracking-block')
  })
  return lists.indexOf(list)
}

function deselectText(ev: Event) {
  const event = ev as KeyboardEvent
  const element = event.target as HTMLInputElement
  if (element.selectionDirection === 'backward') {
    element.selectionEnd = element.selectionStart
  } else {
    element.selectionStart = element.selectionEnd
  }
}

function updateProgress(container: Element) {
  if (document.querySelectorAll('tracked-issues-progress').length === 0) return

  const isInTimeline = container.closest<HTMLElement>('.js-timeline-item')
  if (isInTimeline) return

  const checkboxes = container.querySelectorAll<HTMLInputElement>('.js-comment-body [type=checkbox]')
  const total = checkboxes.length
  const completed = Array.from(checkboxes).filter(checkbox => checkbox.checked).length
  const progressComponents = document.querySelectorAll('tracked-issues-progress[data-type=checklist]')
  for (const progress of progressComponents) {
    progress.setAttribute('data-completed', String(completed))
    progress.setAttribute('data-total', String(total))
  }
}

// Finds the task-list ul that is furthest up the DOM tree from the given element
function findTopLevelTasklistContainer(listElement: Element): Element | null {
  let parentLi = listElement.closest<HTMLLIElement>('.contains-task-list')!
  let nextParent = parentLi
  // traverse up to find the list item furthest up in the tree, which will allow us to flatten a multi-tiered
  // tasklist into a single level
  while (
    (nextParent = nextParent.parentElement!.closest<HTMLLIElement>('.contains-task-list')!) !== parentLi &&
    nextParent !== null
  ) {
    parentLi = nextParent
  }
  return parentLi
}
