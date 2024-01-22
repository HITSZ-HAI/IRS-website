// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

observe('#clear-project-search-button', button => {
  button?.setAttribute('type', 'button')

  button?.addEventListener('click', () => {
    const input = document.getElementById('project-search-input') as HTMLInputElement
    if (input) {
      input.value = ''
      input.focus()
    }
  })
})
