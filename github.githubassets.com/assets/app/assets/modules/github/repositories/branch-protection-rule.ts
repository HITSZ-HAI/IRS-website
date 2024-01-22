// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const toggleSubmit = (el: HTMLInputElement): void => {
  const formSubmit = document.querySelector<HTMLFormElement>(formSubmitSelector)
  if (formSubmit) {
    const isEmpty = el.value.length === 0
    formSubmit.disabled = isEmpty
  }
}

const formSubmitSelector = 'form.js-protected-branch-settings button[type="submit"]'
observe(formSubmitSelector, {
  add() {
    const branchNameInput = <HTMLInputElement>document.getElementById('rule_field')
    if (branchNameInput) {
      toggleSubmit(branchNameInput) // initialize
      branchNameInput.addEventListener('input', () => toggleSubmit(branchNameInput))
    }
  },
})
