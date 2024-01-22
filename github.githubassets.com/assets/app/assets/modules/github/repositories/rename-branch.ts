// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

// The template literal here hides "<BRANCH>" from the linter (which otherwise
// would mistakenly think we're inserting HTML into the DOM).
const BRANCH_PLACEHOLDER = `<${'BRANCH'}>`

function updateRenameInstructions(input: HTMLInputElement) {
  const container = input.closest<HTMLElement>('.js-rename-branch-form')!
  let newName = input.value
  const wasNewNameGiven = newName !== input.defaultValue && newName !== ''

  const autocheckMessage = container.querySelector('.js-rename-branch-autocheck-message')
  if (autocheckMessage && wasNewNameGiven) {
    // If any of the names use a placholder (eg. "<BRANCH>"), we'll show a link
    // to our docs on how to escape special characters.
    let usingPlaceholder = false

    newName = autocheckMessage.getAttribute('data-shell-safe-name') || BRANCH_PLACEHOLDER
    if (newName.includes('<')) {
      usingPlaceholder = true
    }
    for (const newNameEl of container.querySelectorAll('.js-rename-branch-new-name')) {
      newNameEl.textContent = newName
    }

    newName = autocheckMessage.getAttribute('data-shell-safe-name-with-remote') || `origin/${BRANCH_PLACEHOLDER}`
    if (newName.includes('<')) {
      usingPlaceholder = true
    }
    for (const newNameEl of container.querySelectorAll('.js-rename-branch-new-name-with-remote')) {
      newNameEl.textContent = newName
    }

    const docsEl = container.querySelector<HTMLElement>('.js-rename-branch-special-characters-documentation')
    if (docsEl && usingPlaceholder) {
      docsEl.hidden = false
      docsEl.removeAttribute('aria-hidden')
    }
  }
}

on('auto-check-message-updated', '.js-rename-branch-input', function (event) {
  const input = event.currentTarget as HTMLInputElement
  updateRenameInstructions(input)
})
