import {onFocus, onKey} from '../onfocus'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {install, uninstall} from '@github-ui/hotkey'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const MD_BREAKPOINT = 768

function isJumpToAvailable(field: Element): boolean {
  return !!field.closest('.js-jump-to-field')
}

function toggleSearchScope(field: HTMLElement, enabled: boolean) {
  // We don't want legacy search behaviour of changing scope on backspace when using Jump To.
  if (isJumpToAvailable(field)) {
    return
  }
  const form = document.querySelector<HTMLFormElement>('.js-site-search-form')!
  document.querySelector<HTMLElement>('.js-site-search')!.classList.toggle('scoped-search', enabled)

  let url
  let placeholder
  if (enabled) {
    url = form.getAttribute('data-scoped-search-url')!
    placeholder = field.getAttribute('data-scoped-placeholder')!
  } else {
    url = form.getAttribute('data-unscoped-search-url')!
    placeholder = field.getAttribute('data-unscoped-placeholder')!
  }

  form.setAttribute('action', url)
  field.setAttribute('placeholder', placeholder)
}

function toggleSearchInputHotkey(element: HTMLElement, isRegularSearchInput: boolean) {
  if (window.innerWidth < MD_BREAKPOINT) {
    isRegularSearchInput ? uninstall(element) : install(element)
  } else if (window.innerWidth >= MD_BREAKPOINT) {
    isRegularSearchInput ? install(element) : uninstall(element)
  }
}

onKey('keyup', '.js-site-search-field', function (event: KeyboardEvent) {
  // TODO: Refactor to use data-hotkey
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
  const field = event.target as HTMLInputElement

  const emptyQuery = field.value.length === 0
  if (emptyQuery && event.key === 'Backspace' && field.classList.contains('is-clearable')) {
    toggleSearchScope(field, false)
  }
  if (emptyQuery && event.key === 'Escape') {
    toggleSearchScope(field, true)
  }
  field.classList.toggle('is-clearable', emptyQuery)
  /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
})

onFocus('.js-site-search-focus', function (field) {
  const container = field.closest<HTMLElement>('.js-chromeless-input-container')!
  container.classList.add('focus')

  // Restore scope on blur
  function blurHandler() {
    container.classList.remove('focus')
    if ((field as HTMLInputElement).value.length === 0 && field.classList.contains('js-site-search-field')) {
      toggleSearchScope(field, true)
    }
    field.removeEventListener('blur', blurHandler)
  }

  field.addEventListener('blur', blurHandler)
})

on('submit', '.js-site-search-form', function (event) {
  if (!(event.target instanceof Element)) return
  const input = event.target.querySelector<HTMLInputElement>('.js-site-search-type-field')!
  input.value = new URLSearchParams(window.location.search).get('type') || ''
})

const observer = new ResizeObserver(entries => {
  for (const {target} of entries) {
    const isRegularSearchInput = target.classList.contains('regular-search-input')
    if (target.classList.contains('sm-search-input') || isRegularSearchInput) {
      toggleSearchInputHotkey(target as HTMLElement, isRegularSearchInput)
    }
  }
})

// install/uninstall hotkeys on regular search input when screen size reaches medium breakpoint
observe('.regular-search-input', {
  constructor: HTMLElement,
  add(element) {
    observer.observe(element)
  },
  remove(element) {
    uninstall(element)
    observer.unobserve(element)
  },
})

// install/uninstall hotkeys on search input in collapsed menu when screen size reaches medium breakpoint
observe('.sm-search-input', {
  constructor: HTMLElement,
  add(element) {
    observer.observe(element)
  },
  remove(element) {
    uninstall(element)
    observer.unobserve(element)
  },
})

on('click', '.js-toggle-appheader-search', function () {
  const searchBar = document.querySelector<HTMLElement>('.js-global-bar-second-row')!

  if (searchBar) {
    searchBar.toggleAttribute('hidden')

    if (!searchBar.getAttribute('hidden')) {
      const searchInput = searchBar.querySelector<HTMLInputElement>('.js-site-search-focus')!

      if (searchInput) {
        searchInput.focus()
      }
    }
  }
})
