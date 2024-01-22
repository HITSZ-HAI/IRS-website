// Disable
//
// Disables clicked buttons with text in `data-disable-with`.
//
// `<input type=submit>` or `<button type=submit>`
//
// `data-disable-with` - Message to set `<input>` value or `<button>` innerHTML to.
//
//     <input type="submit" data-disable-with="Submitting...">

import {afterRemote} from '@github/remote-form'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

const originalText = new WeakMap()

// Get button text.
function getButtonText(el: Element) {
  if (el instanceof HTMLInputElement) {
    return el.value || 'Submit'
  } else {
    return el.innerHTML || ''
  }
}

function getButtons(form: HTMLFormElement): Array<HTMLInputElement | HTMLButtonElement> {
  return [
    Array.from(form.querySelectorAll('input[type=submit][data-disable-with], button[data-disable-with]')),
    Array.from(document.querySelectorAll(`button[data-disable-with][form="${form.id}"]`)),
  ].flat() as Array<HTMLInputElement | HTMLButtonElement>
}

// Sets a button text.
function setButtonText(el: Element, text: string) {
  if (el instanceof HTMLInputElement) {
    el.value = text
  } else {
    el.innerHTML = text
  }
}

on(
  'submit',
  'form',
  function (event) {
    const form = event.currentTarget as HTMLFormElement
    for (const button of getButtons(form)) {
      originalText.set(button, getButtonText(button))
      const disabledText = button.getAttribute('data-disable-with')
      if (disabledText) {
        setButtonText(button, disabledText)
      }
      button.disabled = true
    }
  },
  {capture: true},
)

// Revert a form to it's previous state.
function revert(form: HTMLFormElement) {
  for (const button of getButtons(form)) {
    const text = originalText.get(button)
    if (text != null) {
      setButtonText(button, text)
      // Button doesn't have a `data-disable-invalid` property or form is valid
      if (!button.hasAttribute('data-disable-invalid') || form.checkValidity()) {
        // Enable the button
        button.disabled = false
      }
      originalText.delete(button)
    }
  }
}

// Enable controls when AJAX request finishes
on('deprecatedAjaxComplete', 'form', function ({currentTarget, target}) {
  if (currentTarget === target) {
    revert(currentTarget as HTMLFormElement)
  }
})

afterRemote(revert)
