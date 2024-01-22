import '../notifications/configure-thread-subscription-dialog'
import './sidebar-widget'
import './sidebar-memex-input'

import {getPageID} from '../session-resume-helpers'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {parseHTML} from '@github-ui/parse-html'
import {remoteForm} from '@github/remote-form'
import {requestSubmit} from '@github-ui/form-utils'

function submitForm(form: Element, skipTeamsCheck = false) {
  if (skipTeamsCheck || !reviewerTeamsCheckRequired(form)) {
    if (form instanceof HTMLFormElement) {
      requestSubmit(form)
    } else {
      previewSubmit(form)
    }
  }
}

function submitOnMenuClose(event: Event) {
  const currentTarget = event.currentTarget as Element
  const form = currentTarget.closest('.js-issue-sidebar-form') || currentTarget.querySelector('.js-issue-sidebar-form')
  submitForm(form!)
}

// On item selection, submit the form
on(
  'details-menu-selected',
  '.js-discussion-sidebar-menu',
  function (event) {
    const item = event.detail.relatedTarget
    const menu = event.currentTarget
    const form = item.closest('.js-issue-sidebar-form')
    const multiple = menu.hasAttribute('data-multiple')

    if (item.hasAttribute('data-clear-assignees')) {
      const selectedInputs = menu.querySelectorAll<HTMLInputElement>('input[name="issue[user_assignee_ids][]"]:checked')
      for (const el of selectedInputs) {
        el.disabled = false
        el.checked = false
      }

      submitForm(form)
    } else if (multiple) {
      menu.closest<HTMLElement>('details')!.addEventListener('toggle', submitOnMenuClose, {once: true})
    } else {
      submitForm(form)
    }
  },
  {capture: true},
)

function updateSidebar(container: Element, html: string) {
  container.replaceWith(parseHTML(document, html))
}

function returnFocusToTrigger(container: HTMLElement, menuTriggerId: string) {
  const currentSidebarTriggerEl = container.querySelector<HTMLElement>(`[data-menu-trigger="${menuTriggerId}"]`)

  // Returns focus to triggering element after HTML is replaced
  currentSidebarTriggerEl?.focus()
}

// TODO Replace with data-replace-remote-form behavior.
remoteForm('.js-issue-sidebar-form', async function (form, wants) {
  let error: Error | undefined

  try {
    const response = await wants.html()
    // Gets the specific sidebar element (i.e. assignees, labels) before the HTML is replaced inside
    const currentSidebarItemEl = form.closest<HTMLElement>('.js-discussion-sidebar-item')
    // Gets the unique ID of the current sidebar element to use to reference the trigger
    const currentSidebarDetailsId = currentSidebarItemEl?.querySelector<HTMLElement>('.select-menu')?.getAttribute('id')
    const container = currentSidebarItemEl?.parentElement

    currentSidebarItemEl!.replaceWith(response.html)

    if (container && currentSidebarDetailsId) returnFocusToTrigger(container, currentSidebarDetailsId)
  } catch (err) {
    if (err instanceof Error) {
      error = err
      throw error
    }
  } finally {
    form.dispatchEvent(new CustomEvent('submit:complete', {bubbles: true, detail: {error}}))
  }
})

// Prevent suggested reviewer button on new pull request form from submitting the main form.
on('click', 'div.js-issue-sidebar-form .js-suggested-reviewer', function (event) {
  const button = event.currentTarget as HTMLButtonElement

  const form = button.closest<HTMLElement>('.js-issue-sidebar-form')!
  previewSubmit(form, 'post', {name: button.name, value: button.value})
  event.preventDefault()
})

// Prevent "assign yourself" button on the issue#new form from submitting the main form.
on('click', 'div.js-issue-sidebar-form .js-issue-assign-self', function (event) {
  const button = event.currentTarget as HTMLButtonElement

  const form = button.closest<HTMLElement>('.js-issue-sidebar-form')!
  previewSubmit(form, 'post', {name: button.name, value: button.value})
  button.remove()
  // do not persist in the UI
  document.querySelector('form#new_issue .js-submit-button-value')?.remove()
  event.preventDefault()
})

// Allow "unassign me" to submit form with method DELETE
on('click', '.js-issue-unassign-self', function (event) {
  const form = event.currentTarget.closest<HTMLElement>('.js-issue-sidebar-form')!
  previewSubmit(form, 'delete')
  event.preventDefault()
})

function getCacheKey(el: Element, pageId: string) {
  const formName = el.getAttribute('data-cache-name')
  return `${pageId}:sidebar:${formName}`
}

function cacheValues(form: Element, formData: FormData, cacheKey: string) {
  const formName = form.getAttribute('data-cache-name')
  if (!formName) return

  const data: Array<[string, FormDataEntryValue]> = []
  for (const [key, value] of formData.entries()) {
    if (key.indexOf(formName) === -1) continue
    data.push([key, value])
  }

  const updated = data.filter(datum => datum[1] !== '')
  if (updated.length > 0) {
    sessionStorage.setItem(cacheKey, JSON.stringify(updated))
  } else {
    sessionStorage.removeItem(cacheKey)
  }
}

const hasFired = new Set<string>()
function clearHasFired() {
  hasFired.clear()
}

async function restoreCachedValues(el: Element, cacheKey: string) {
  const formName = el.getAttribute('data-cache-name')
  const cache = sessionStorage.getItem(cacheKey)
  if (!formName || !cache || hasFired.has(formName)) return
  hasFired.add(formName)
  const formData: Array<[string, FormDataEntryValue]> = JSON.parse(cache)
  const inputs: HTMLInputElement[] = []
  for (const [key, value] of formData) {
    // Only cache string values
    if (Object.prototype.toString.call(value) !== '[object String]') continue

    const newInput = document.createElement('input')
    newInput.type = 'hidden'
    // The guard clause above ensures that this is a string, but the TS complier doesn't know that.
    newInput.value = value as string
    newInput.name = key
    el.appendChild(newInput)
    inputs.push(newInput)
  }
  try {
    await requestPreview(el)
    for (const input of inputs) {
      input.remove()
    }
  } catch (error) {
    hasFired.delete(formName)
  }
}

let isSubmitting = false
function cacheValuesOnHide(form: Element, cacheKey: string) {
  if (isSubmitting) return

  const body = scopedFormData(form)
  cacheValues(form, body, cacheKey)
  clearHasFired()
}

observe('[data-cacher]', {
  add(el) {
    const cacheKey = getCacheKey(el, getPageID())
    restoreCachedValues(el, cacheKey)
    window.addEventListener('pagehide', () => cacheValuesOnHide(el, cacheKey))
    window.addEventListener('turbo:before-visit', () => cacheValuesOnHide(el, cacheKey))
    window.addEventListener(
      'submit',
      event => {
        if (!event.defaultPrevented) {
          isSubmitting = true
          // Defer the write operation to the next tick
          setTimeout(() => {
            for (const key of Object.keys(sessionStorage)) {
              if (key.indexOf(cacheKey) === -1) continue
              sessionStorage.removeItem(key)
              clearHasFired()
            }
          }, 0)
        }
      },
      {capture: true},
    )
  },
})

// Submit dummy sidebar preview "form".
//
// form - DIV element tagged with .js-issue-sidebar-form
// extra - Array of extra form data to pass along
async function previewSubmit(form: Element, method = 'post', extra?: {name: string; value: string}) {
  await requestPreview(form, method, extra)
  // Gets the specific sidebar element (i.e. assignees, labels) before the HTML is replaced inside
  const currentSidebarItemEl = form.closest<HTMLElement>('.js-discussion-sidebar-item')
  // Gets the unique ID of the current sidebar element to use to reference the trigger
  const currentSidebarDetailsId = currentSidebarItemEl?.querySelector<HTMLElement>('.select-menu')?.getAttribute('id')
  const container = currentSidebarItemEl?.parentElement

  if (container && currentSidebarDetailsId) returnFocusToTrigger(container, currentSidebarDetailsId)
}

async function requestPreview(form: Element, method = 'post', extra?: {name: string; value: string}) {
  const body = scopedFormData(form)
  if (extra) {
    body.append(extra.name, extra.value)
  }

  const url = form.getAttribute('data-url')!
  if (!url) return

  const token = form.querySelector<HTMLInputElement>('.js-data-url-csrf')!

  const response = await fetch(url, {
    method,
    body: method === 'delete' ? '' : body,
    mode: 'same-origin',
    headers: {
      'Scoped-CSRF-Token': token.value,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
  if (!response.ok) {
    return
  }
  const html = await response.text()
  updateSidebar(form.closest<HTMLElement>('.js-discussion-sidebar-item')!, html)
}

// Returns true (and triggers a reviewer check for "notification spam") if the
// form (or div, in new PRs) contains at least one new review request for a team
function reviewerTeamsCheckRequired(form: Element) {
  // We only care about reviewers...
  const url = form.getAttribute('data-reviewers-team-size-check-url')
  if (!url) return false

  // ...and whether there is at least one newly-selected team
  const previouslyRequestedTeams = [...document.querySelectorAll<HTMLElement>('.js-reviewer-team')].map(elem =>
    elem.getAttribute('data-id'),
  )
  const formData = form instanceof HTMLFormElement ? new FormData(form) : scopedFormData(form)
  const allSelectedTeams = new URLSearchParams(formData as FormData & Record<string, string>).getAll(
    'reviewer_team_ids[]',
  )
  const newlySelectedTeams = allSelectedTeams.filter(team => !previouslyRequestedTeams.includes(team))
  if (newlySelectedTeams.length === 0) return false

  const params = new URLSearchParams(newlySelectedTeams.map(s => ['reviewer_team_ids[]', s]))
  triggerTeamReviewerCheck(form, `${url}?${params}`)
  return true
}

// Asks the server if any of the newly-selected teams is too large;
// show the dialog if so, move on and request reviews otherwise.
async function triggerTeamReviewerCheck(form: Element, reviewerCheckUrl: string) {
  const response = await fetch(reviewerCheckUrl)
  if (!response.ok) {
    return
  }

  const dialogHtml = await response.text()
  if (dialogHtml.match(/[^\w-]js-large-team[^\w-]/)) {
    showTeamReviewerConfirmationDialog(form, dialogHtml)
  } else {
    submitForm(form, true)
    return
  }
}

// Shows dialog that requests confirmation for review requests to large teams
function showTeamReviewerConfirmationDialog(form: Element, dialogHtml: string) {
  // Add dialog to DOM
  const container = form.querySelector<HTMLElement>('.js-large-teams-check-warning-container')!
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }
  container.appendChild(parseHTML(document, dialogHtml))

  // Wire dialog actions and open it
  const dialog = container.querySelector<HTMLDetailsElement>('details')!
  function dialogAction(event: Event) {
    if (!(event.target instanceof Element)) return
    dialog.open = false
    // Unless the user explicitly confirms, un-select the large teams before submitting
    if (!event.target.classList.contains('js-large-teams-confirm-button')) {
      const reviewerInputs = form.querySelectorAll<HTMLInputElement>("input[name='reviewer_team_ids[]']")
      for (const reviewerInput of reviewerInputs) {
        if (container.querySelector(`.js-large-team[data-id='${reviewerInput.value}']`)) {
          reviewerInput.checked = false
        }
      }
    }
    submitForm(form, true)
    event.preventDefault()
  }
  container
    .querySelector<HTMLElement>('.js-large-teams-confirm-button')!
    .addEventListener('click', dialogAction, {once: true})
  container
    .querySelector<HTMLElement>('.js-large-teams-cancel-button')!
    .addEventListener('click', dialogAction, {once: true})
  dialog.addEventListener('details-dialog-close', dialogAction, {once: true})
  dialog.open = true
}

on('click', 'div.js-project-column-menu-container .js-project-column-menu-item button', async function (event) {
  const currentTarget = event.currentTarget
  updateProjectColumnMenuSummary(currentTarget)
  const moveUrl = currentTarget.getAttribute('data-url')!
  const token = currentTarget.parentElement!.querySelector<HTMLInputElement>('.js-data-url-csrf')!
  const cardId = currentTarget.getAttribute('data-card-id')!
  const form = new FormData()

  form.append('card_id', cardId)
  form.append('use_automation_prioritization', 'true')

  event.preventDefault()
  const response = await fetch(moveUrl, {
    method: 'PUT',
    mode: 'same-origin',
    body: form,
    headers: {
      'Scoped-CSRF-Token': token.value,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
  if (!response.ok) {
    return
  }
  // blur any active elements if they are contained within the detail
  // to allow update-content to reload the dropdown
  const activeElement = document.activeElement as HTMLElement
  const container = currentTarget.closest<HTMLElement>('.js-project-column-menu-dropdown')!
  if (activeElement && container.contains(activeElement)) {
    try {
      // eslint-disable-next-line github/no-blur
      activeElement.blur()
    } catch (e) {
      // ignore
    }
  }
})

function updateProjectColumnMenuSummary(element: Element) {
  const dropdown = element.closest<HTMLElement>('.js-project-column-menu-dropdown')!
  const summary = dropdown.querySelector<HTMLElement>('.js-project-column-menu-summary')!
  const columnName = element.getAttribute('data-column-name')!

  summary.textContent = columnName
}

on('click', '.js-prompt-dismiss', function (event) {
  event.currentTarget.closest<HTMLElement>('.js-prompt')!.remove()
})

// Similar to serializeArray, but maybe scoped to a non-form.
//
// container - Element contained by a form to serialize the child fields for
function scopedFormData(container: Element): FormData {
  const form = container.closest<HTMLFormElement>('form')!
  if (!form) return new FormData()
  const formData = new FormData(form)
  const params = formData.entries()
  const results = new FormData()
  for (const [name, value] of params) {
    if (form.contains(findParam(form, name, value.toString()))) {
      results.append(name, value)
    }
  }
  return results
}

function findParam(form: HTMLFormElement, name: string, value: string): Element | null {
  for (const el of form.elements) {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLButtonElement) {
      if (el.name === name && el.value === value) {
        return el
      }
    }
  }
  return null
}

on('click', '.js-convert-to-draft', function (event) {
  const convertToDraftUrl = event.currentTarget.getAttribute('data-url')!
  const token = event.currentTarget.parentElement!.querySelector<HTMLInputElement>('.js-data-url-csrf')!

  fetch(convertToDraftUrl, {
    method: 'POST',
    mode: 'same-origin',
    headers: {
      'Scoped-CSRF-Token': token.value,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
})

on('click', 'div.js-restore-item', async function (event) {
  const unarchiveItemUrl = event.currentTarget.getAttribute('data-url')!
  const projectItemID = event.currentTarget.getAttribute('data-column')!
  const token = event.currentTarget.querySelector<HTMLInputElement>('.js-data-url-csrf')!
  const form = new FormData()

  form.set('memexProjectItemIds[]', projectItemID)

  const result = await fetch(unarchiveItemUrl, {
    method: 'PUT',
    mode: 'same-origin',
    body: form,
    headers: {
      'Scoped-CSRF-Token': token.value,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  if (!result.ok) {
    throw new Error('connection error')
  }

  submitOnMenuClose(event)
})
