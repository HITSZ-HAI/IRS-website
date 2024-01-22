// eslint-disable-next-line no-restricted-imports
import {fire, on} from 'delegated-events'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {replaceState} from '../history'
import {focusTrap} from '@primer/behaviors'
import {announce, announceFromElement} from '@github-ui/aria-live'

// Save a release as a draft.
export async function saveDraft(button: HTMLButtonElement): Promise<unknown> {
  const form = button.form!

  const draftField = form.querySelector<HTMLInputElement>('#release_draft')!
  draftField.value = '1'

  setState(button, 'saving')

  const response = await fetch(form.action, {
    method: form.method,
    body: new FormData(form),
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
  if (!response.ok) {
    setState(button, 'failed')
    return
  }
  const release = await response.json()
  setState(button, 'saved')
  announceFromElement(button)
  setTimeout(setState, 5000, button, 'default')
  fire(form, 'release:saved', {release})
  return release
}

on('change', '.js-releases-marketplace-publish-field', function (event) {
  processMarketplacePublishCheckbox(event.currentTarget as HTMLInputElement)
})

observe('.js-releases-marketplace-publish-field', function (input) {
  processMarketplacePublishCheckbox(input as HTMLInputElement)
})

function processMarketplacePublishCheckbox(input: HTMLInputElement) {
  const container = input.closest<HTMLElement>('.js-releases-marketplace-publish-container')!
  const previewPane = container.querySelector<HTMLElement>('.js-releases-marketplace-publish-preview')!

  if (input.checked) {
    /* eslint-disable-next-line github/no-d-none */
    previewPane.classList.remove('d-none')
  } else {
    /* eslint-disable-next-line github/no-d-none */
    previewPane.classList.add('d-none')
  }
}

on('click', '.js-save-draft', function (event) {
  const button = event.currentTarget as HTMLButtonElement
  if (button.disabled) {
    return
  }
  saveDraft(button)
  event.preventDefault()
})

function setState(el: HTMLButtonElement, state: string) {
  for (const message of el.querySelectorAll<HTMLElement>('.js-save-draft-button-state')) {
    message.hidden = message.getAttribute('data-state') !== state
  }
  el.disabled = state === 'saving'
}

// PreReleases cannot be set as latest release.
// Disable the latest release checkbox if prerelease checkbox is checked
on('click', '.js-prerelease-checkbox', event => {
  const preReleaseCheckbox = event.currentTarget as HTMLInputElement
  // hidden input set on pageload for whether this release is stored as latest
  const isStoredLatest = event.currentTarget
    .closest<HTMLElement>('form')!
    .querySelector<HTMLInputElement>('#is_stored_latest')!

  // This input will not be present when FF is off
  const latestReleaseCheckbox = document.querySelector<HTMLInputElement>('.js-latest-release-checkbox')

  if (latestReleaseCheckbox) {
    if (preReleaseCheckbox.checked) {
      latestReleaseCheckbox.checked = false
      latestReleaseCheckbox.disabled = true
    } else if (isStoredLatest.value === '1') {
      latestReleaseCheckbox.checked = true
      latestReleaseCheckbox.disabled = true
    } else {
      latestReleaseCheckbox.disabled = false
    }
  }
})

// When latest release checkbox is checked & disabled on pageload
// we are editting the release that is stored as latest
observe('.js-latest-release-checkbox', function initialize(el) {
  const latestReleaseCheckbox = el as HTMLInputElement
  const isStoredLatest = el.closest<HTMLElement>('form')!.querySelector<HTMLInputElement>('#is_stored_latest')!

  const wasCheckedAndDisabled = latestReleaseCheckbox.checked && latestReleaseCheckbox.disabled === true

  // Keep track of whether this release is stored as latest
  isStoredLatest.value = wasCheckedAndDisabled ? '1' : '0'
})

// TODO: This can be removed if the form submission reloads the page or fresh
// form markup is served and replaced in the tree rather than a JSON response.
on('release:saved', '.js-release-form', function (event) {
  const release = event.detail.release
  const form = event.currentTarget

  form.setAttribute('action', release.update_url)

  if (release.update_authenticity_token) {
    // eslint-disable-next-line github/authenticity-token
    const tokenInput = form.querySelector('input[name=authenticity_token]') as HTMLInputElement
    tokenInput.value = release.update_authenticity_token
  }

  replaceState(history.state, document.title, release.edit_url)

  const input = form.querySelector('#release_id') as HTMLInputElement
  if (!input.value) {
    input.value = release.id
    const methodInput = document.createElement('input')
    methodInput.type = 'hidden'
    methodInput.name = '_method'
    methodInput.value = 'put'
    form.appendChild(methodInput)
  }
})

// Publish a release
on('click', '.js-publish-release', function () {
  document.querySelector<HTMLInputElement>('#release_draft')!.value = '0'
})

// Tag validations
function setTagWrapperState(state: string) {
  const wrapper = document.querySelector<HTMLElement>('.js-release-target-wrapper')

  if (wrapper == null) {
    return
  }

  setTagState(state)

  switch (state) {
    case 'valid':
    case 'invalid':
    case 'duplicate':
    case 'branch_exists':
      wrapper.hidden = true
      break
    case 'loading':
      break
    default:
      wrapper.hidden = false
  }

  for (const status of document.querySelectorAll<HTMLElement>('.js-tag-status-message')) {
    status.hidden = status.getAttribute('data-state') !== state
    if (status.getAttribute('data-state') === state) {
      status.setAttribute('role', 'status')
    } else {
      status.removeAttribute('role')
    }
  }

  refreshGenerateNotesButton()
  setGeneratedNotesFetchState('pending')
}

export function getTagState() {
  const tagInput = document.querySelector('.js-release-tag')!
  return tagInput.getAttribute('data-state')
}

function setTagState(state: string) {
  const tagInput = document.querySelector('.js-release-tag')!
  tagInput.setAttribute('data-state', state)
}

const lastChecked = new WeakMap()

function getTagName(container: ParentNode) {
  const selectedRadio = container.querySelector<HTMLInputElement>('input[name="release[tag_name]"]:checked')
  return selectedRadio?.value
}

export async function checkTag(tagElement: Element) {
  const tagValue = getTagName(tagElement)
  if (!tagValue) {
    setTagWrapperState('empty')
    return
  }

  if (tagValue === lastChecked.get(tagElement)) {
    return
  }

  setTagWrapperState('loading')
  lastChecked.set(tagElement, tagValue)

  const urlStr = tagElement.getAttribute('data-url')!
  const url = new URL(urlStr, window.location.origin)
  const params = new URLSearchParams(url.search.slice(1))
  params.append('tag_name', tagValue)
  url.search = params.toString()

  type Data = {status: string; release_id: string; url: string}
  const response = await fetch(url.toString(), {
    headers: {Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
  })
  if (!response.ok) {
    setTagWrapperState('invalid')
    return
  }
  const data: Data = await response.json()
  if (
    data.status === 'duplicate' &&
    parseInt(tagElement.getAttribute('data-existing-id')!) === parseInt(data.release_id)
  ) {
    setTagWrapperState('valid')
  } else {
    document.querySelector<HTMLElement>('.js-release-tag .js-edit-release-link')!.setAttribute('href', data['url'])
    setTagWrapperState(data.status)
  }

  processChangedTag(tagElement)
}

on('click', '.js-generate-release-notes', function (event) {
  const button = event.currentTarget as HTMLButtonElement
  if (button.getAttribute('aria-disabled') === 'true') return
  generateNotes(button)
})

export async function generateNotes(button: HTMLButtonElement) {
  const desiredButtonWidth = button.offsetWidth
  button.style.width = `${desiredButtonWidth}px`
  setGeneratedNotesFetchState('loading')
  button.setAttribute('aria-disabled', 'true')

  const repoUrl = button.getAttribute('data-repo-url')!
  const notesUrl = `${repoUrl}/releases/notes`
  const url = new URL(notesUrl, window.location.origin)
  const params = new URLSearchParams(url.search.slice(1))
  params.append('commitish', getCommitish())
  params.append('tag_name', getTagName(document) || '')
  params.append('previous_tag_name', getPreviousTagName())
  url.search = params.toString()

  type NotesData = {body: string; commitish: string; previous_tag_name: string; title: string; warning_message: string}
  const response = await fetch(url.toString(), {
    headers: {Accept: 'application/json'},
  })

  if (response.ok) {
    const data: NotesData = await response.json()

    if (data.commitish === getCommitish()) {
      const bodyInput = document.getElementById('release_body') as HTMLInputElement

      // Keep any existing body content if present, and append the generated notes to the end
      // If the content is previously generated and unedited content, we will replace it
      const existingBody = getNotesTrackingState() === 'generated' ? '' : bodyInput.value.trim()
      if (existingBody) {
        bodyInput.value = existingBody.concat('\n\n', data.body)
      } else {
        bodyInput.value = data.body
      }

      const titleInput = document.getElementById('release_name') as HTMLInputElement
      if (!titleInput.value) {
        titleInput.value = data.title
      }

      setGeneratedNotesFetchState('succeed')
      // eslint-disable-next-line i18n-text/no-en
      announce('Successfully generated release notes')

      setNotesTrackingState(existingBody ? 'generated-and-edited' : 'generated')
      refreshGenerateNotesButton(true)

      const warningDisplay = document.querySelector<HTMLElement>('.js-release-body-warning')!
      warningDisplay.textContent = data.warning_message
      warningDisplay.hidden = !data.warning_message
    }
  } else {
    setGeneratedNotesFetchState('failed')
    button.setAttribute('aria-disabled', 'false')
    const data: {error: string} = await response.json()
    if (data && data.error) {
      const errorDisplay = document.getElementById('form-error-alert')!
      errorDisplay.textContent = data.error
      errorDisplay.hidden = false
    }
  }
}

type GeneratedNotesFetchState = 'pending' | 'loading' | 'succeed' | 'failed'
const generatedNotesFetchStates = ['pending', 'loading', 'succeed', 'failed']

function setGeneratedNotesFetchState(newState: GeneratedNotesFetchState) {
  generatedNotesFetchStates.map((state: string) => {
    const icon = document.getElementById(`generate-icon-${state}`)
    const buttonText = document.getElementById(`generate-btn-txt`)
    if (icon) {
      if (state === newState) {
        buttonText && buttonText.setAttribute('hidden', 'true')
        if (newState === 'succeed' || newState === 'failed') {
          setTimeout(() => {
            icon.setAttribute('hidden', 'true')
            buttonText && buttonText.removeAttribute('hidden')
          }, 2000)
        }
        icon.removeAttribute('hidden')
      } else {
        icon.setAttribute('hidden', 'true')
      }
    }
  })

  if (newState !== 'failed') {
    const errorDisplay = document.getElementById('form-error-alert')!
    errorDisplay.textContent = ''
    errorDisplay.hidden = true
  }
}

/**
 * State used to track how the user interacts with generated notes
 * i.e. whether they generate notes at all, or generate them and edit them.
 */
type NotesTrackingState = 'initial' | 'generated' | 'generated-and-edited'

/**
 * Set generated notes state on hidden tracking input
 */
function setNotesTrackingState(state: NotesTrackingState) {
  const input = document.getElementById('generated_notes_state') as HTMLInputElement
  input.value = state
}

/**
 * Get generated notes state from hidden tracking input
 */
function getNotesTrackingState() {
  const input = document.getElementById('generated_notes_state') as HTMLInputElement
  return input.value
}

/**
 * The ref to use to generate notes.
 * If we have an existing tag, use it. Use branch instead.
 */
function getCommitish() {
  if (getTagState() === 'valid') {
    return getTagName(document) || ''
  }

  return document.querySelector<HTMLInputElement>('input[name="release[target_commitish]"]:checked')?.value || ''
}

/**
 * The ref to use as the previous_tag_name when generating notes.
 */
function getPreviousTagName() {
  return document.querySelector<HTMLInputElement>('input[name="release[previous_tag_name]"]:checked')?.value || ''
}

observe('.js-release-tag', function initialize(tagElement) {
  checkTag(tagElement)
})

// We need to manually focus trap keyboard navigation in details-menu dropdowns
observe('details-menu', function initialize(detailsMenu) {
  focusTrap(detailsMenu as HTMLElement)
})

function processChangedTag(tagElement: Element) {
  const form = tagElement.closest<HTMLFormElement>('form')!
  const previewable = form.querySelector('.js-previewable-comment-form')
  if (!previewable) return

  let baseUrl = previewable.getAttribute('data-base-preview-url')
  if (!baseUrl) {
    baseUrl = String(previewable.getAttribute('data-preview-url'))
    previewable.setAttribute('data-base-preview-url', baseUrl)
  }

  const inputs = tagElement.querySelectorAll<HTMLInputElement>(
    'input[name="release[tag_name]"], input[name="release[target_commitish]"]:checked',
  )
  const url = new URL(baseUrl, window.location.origin)
  const params = new URLSearchParams(url.search.slice(1))
  for (const input of inputs) {
    if (input.value) {
      params.append(input.name, input.value)
    }
  }
  url.search = params.toString()
  previewable.setAttribute('data-preview-url', url.toString())
}

function refreshGenerateNotesButton(forceDisabled = false) {
  const generateNotesButton = document.querySelector<HTMLButtonElement>('.js-generate-release-notes')!
  const previousTagPicker = document.getElementById('prev-tag-picker')
  const toolTip = document.querySelector("tool-tip[for='generate-notes-btn']")

  const tagState = getTagState()
  const tagIsInvalid = tagState !== 'valid' && tagState !== 'pending'
  const disabledState = forceDisabled || tagIsInvalid
  generateNotesButton.setAttribute('aria-disabled', disabledState.toString())

  if (toolTip) {
    if (disabledState) {
      toolTip.textContent = `${
        tagIsInvalid ? 'Select a valid tag to a' : 'Clear existing notes to a'
      }utomatically add the Markdown for all the merged pull requests from this diff and contributors of this release`
    } else {
      toolTip.textContent =
        // eslint-disable-next-line i18n-text/no-en
        'Automatically add the Markdown for all the merged pull requests from this diff and contributors of this release'
    }
  }
  //Hide the previous tag picker if the target tag is invalid
  previousTagPicker && (previousTagPicker.hidden = disabledState)
}

function processChangedBody(body: HTMLInputElement) {
  if (body.value === '') {
    refreshGenerateNotesButton()
    setGeneratedNotesFetchState('pending')
    setNotesTrackingState('initial')
  } else {
    const notesState = getNotesTrackingState()
    // Generate notes button should remain disabled if the notes have been generated
    const disableGenerateNotesButton = notesState !== 'initial'
    refreshGenerateNotesButton(disableGenerateNotesButton)
    if (notesState === 'generated') {
      setNotesTrackingState('generated-and-edited')
    }
  }
}

on('click', '.js-release-expand-btn', async function (event) {
  const card = event.currentTarget.closest('.js-release-expandable')!
  const expandedCardUrl = card.getAttribute('data-expand-url')!
  const html = await fetchSafeDocumentFragment(document, expandedCardUrl)
  card?.replaceWith(html)
})

on('click', '.js-release-asset-untruncate-btn', async function (event) {
  event.currentTarget.setAttribute('hidden', 'true')
  const truncateSpinner = event.currentTarget.parentNode?.querySelector('.js-truncate-assets-spinner')
  truncateSpinner && truncateSpinner.removeAttribute('hidden')
  // set the src on the include-fragment element to prompt loading the new fragment
  const includeFragmentElement = event.currentTarget.closest('.js-truncated-assets-fragment')
  const url = includeFragmentElement?.getAttribute('data-deferred-src')
  url && includeFragmentElement?.setAttribute('src', encodeURI(url))
})

// initial check for body content
observe('#release_body', function (el) {
  const input = el as HTMLInputElement
  input.addEventListener('input', function () {
    processChangedBody(input)
  })

  // call once for initialization
  processChangedBody(input)
})

// Dynamically update "data-preview-url" attribute when "tag_name" or "target_commitish" change
on('change', '.js-release-check-tag', function (event) {
  const container = event.currentTarget.closest<HTMLElement>('.js-release-tag')!
  checkTag(container)
})

observe('.js-release-form .js-previewable-comment-form', function (el) {
  const tag = el.closest<HTMLElement>('form')!.querySelector<HTMLElement>('.js-release-tag')!
  processChangedTag(tag)
})

// Dynamically update the page title if one is provided by the server
// This happens when a user uses the search box
observe('#release_page_title', function (el) {
  const pageTitleContainer = el as HTMLElement
  const pageTitle = pageTitleContainer.textContent?.trim() || ''
  if (pageTitle.length) {
    document.title = pageTitle
  }
})

// PJAX/Turbo removes focus from the search input when loading search results
// We need to manually focus it again and ensure the cursor is in the right place
observe('#release-filter', function (el) {
  const releaseFilter = el as HTMLInputElement
  if (releaseFilter.value.length > 0) {
    releaseFilter.focus()
    releaseFilter.setSelectionRange(releaseFilter.value.length, releaseFilter.value.length)
  }
})
