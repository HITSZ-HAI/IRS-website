// User list dialogs
//
// Handle user list creation, deletion, and editing.

// eslint-disable-next-line no-restricted-imports
import {fire, on} from 'delegated-events'
import type {SimpleResponse} from '@github/remote-form'
import {TemplateInstance} from '@github/template-parts'
import {dialog} from '@github-ui/details-dialog'
import {hasDirtyFields} from '../has-interactions'
import {onInput} from '../onfocus'
import {parseHTML} from '@github-ui/parse-html'
import {remoteForm} from '@github/remote-form'
import {requestSubmit} from '@github-ui/form-utils'
import {showGlobalError} from './ajax-error'
import {updateContent} from '../updatable-content'
import {updateSocialCounts} from './social'

// Communicate a generic error, not associated with a specific attribute, to the user. This is used if the
// server does something unexpected, like returning a 500 error or reporting an unrecognized attribute.
function setFlashError(form: HTMLFormElement, message?: string) {
  const flash = form.querySelector<HTMLElement>('.js-user-list-base')
  if (flash) {
    flash.textContent = message || flash.getAttribute('data-generic-message')
    flash.hidden = false
  }
}

// Clear any validation errors from the form. If a specific formGroup is provided, only clear errors from that
// group. Otherwise, clear errors from all groups. In either case, flash errors should be cleared as well.
function resetValidation(form: HTMLFormElement, formGroup?: HTMLElement) {
  const container = formGroup || form
  const notes = container.querySelectorAll<HTMLElement>('.js-user-list-error')
  for (const note of notes) {
    note.hidden = true
  }

  const groups = formGroup ? [formGroup] : form.querySelectorAll<HTMLElement>('.errored.js-user-list-input-container')
  for (const group of groups) {
    group.classList.remove('errored')
  }

  const flash = form.querySelector<HTMLElement>('.js-user-list-base')
  if (flash) {
    flash.hidden = true
  }
}

// Wire up remote form submission. Clear preexisting validation errors from the form, submit it with XHR, and interpret
// the server's response. On success, reload the page. On failure, attempt to interpret the response as validation
// errors and display them next to the appropriate inputs.
remoteForm('.js-user-list-form', async function (form, wants) {
  resetValidation(form)

  const submitButton = form.querySelector<HTMLButtonElement>('[data-submitting-message]')
  const originalButtonText = submitButton?.textContent
  if (submitButton) {
    // We can't use data-disable-with here because the button is re-enabled immediately after the response is received,
    // but before we have a chance to handle it and redirect or swap out the form contents. This results in a
    // disorienting jitter.
    submitButton.textContent = submitButton.getAttribute('data-submitting-message')
    submitButton.disabled = true
  }

  for (const input of form.querySelectorAll<HTMLInputElement>('.js-user-list-input')) {
    input.disabled = true
  }

  try {
    const response = await wants.html()

    // Let a containing element determine how to handle the response.
    fire(form, 'user-list-form:success', response.html)
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.response?.status === 422) {
      // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
      form.replaceWith(error.response.html)
    } else {
      setFlashError(form)

      if (submitButton) {
        if (originalButtonText) submitButton.textContent = originalButtonText
        submitButton.disabled = false
      }

      for (const input of form.querySelectorAll<HTMLInputElement>('.js-user-list-input')) {
        input.disabled = false
      }
    }
  }
})

on('user-list-form:success', '.js-follow-list', event => {
  const responseBody = event.detail
  const targetUrlElement =
    responseBody instanceof DocumentFragment ? responseBody.querySelector<HTMLAnchorElement>('.js-target-url') : null
  if (targetUrlElement?.href) {
    location.href = targetUrlElement.href
  } else {
    location.reload()
  }
})

// Dismiss a validation error from a form input when you start changing it.
function clearErrorsFromInput(event: Event) {
  if (!(event.currentTarget instanceof HTMLElement)) {
    return
  }

  const form = event.currentTarget.closest<HTMLFormElement>('.js-user-list-form')
  const formGroup = event.currentTarget.closest<HTMLElement>('.js-user-list-input-container')
  if (form && formGroup) {
    resetValidation(form, formGroup)
  }
}

onInput('.js-user-list-form input', clearErrorsFromInput)
onInput('.js-user-list-form textarea', clearErrorsFromInput)

// Unhide the .note element containing the validation error reported by <auto-check> when there's an error to show.
on('auto-check-error', '.js-user-list-form input', function (event) {
  const formGroup = event.currentTarget.closest<HTMLElement>('.js-user-list-input-container')
  const note = formGroup?.querySelector<HTMLElement>('.js-user-list-error')
  if (note) {
    note.hidden = false
  }
})

// Star button UserList menu

// Given a collection of UserList menu root elements, construct a map grouping them by the repository ID each
// corresponds to.
function groupRootsByRepositoryId(roots: Iterable<HTMLElement>): Map<string, HTMLElement[]> {
  const rootsByRepositoryId = new Map<string, HTMLElement[]>()
  for (const root of roots) {
    const repositoryId = root
      .querySelector<HTMLInputElement>('.js-user-lists-create-trigger')
      ?.getAttribute('data-repository-id')
    if (repositoryId) {
      const existingRoots = rootsByRepositoryId.get(repositoryId)
      if (existingRoots) {
        existingRoots.push(root)
      } else {
        rootsByRepositoryId.set(repositoryId, [root])
      }
    }
  }
  return rootsByRepositoryId
}

// Perform a POST request to the batch-render endpoint to render a collection of UserList menus corresponding to the
// repositories. Asynchronously returns a Map<repository ID> => rendered HTML generated for that repository.
//
// Rejects its promise on network errors, but returns an empty map on server errors.
async function requestMenuBatchRender(
  batchUpdateUrl: string,
  csrfToken: string,
  repositoryIds: Iterable<string>,
): Promise<Map<string, DocumentFragment>> {
  const postData = new FormData()

  // eslint-disable-next-line github/authenticity-token
  postData.set('authenticity_token', csrfToken)
  for (const repositoryId of repositoryIds) {
    postData.append('repository_ids[]', repositoryId)
  }

  const response = await fetch(batchUpdateUrl, {
    method: 'POST',
    body: postData,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  const updatedMenuContents = new Map<string, DocumentFragment>()
  if (response.ok) {
    const json = await response.json()
    for (const key in json) {
      updatedMenuContents.set(key, parseHTML(document, json[key]))
    }
  }
  return updatedMenuContents
}

// Replace the contents of UserList menus in the DOM with the updated, rendered HTML generated for each by the batch
// render endpoint.
function replaceUserListMenuRoots(
  renderedMenuContents: Map<string, DocumentFragment>,
  rootsByRepositoryId: Map<string, HTMLElement[]>,
) {
  for (const [repositoryId, updatedMenu] of renderedMenuContents.entries()) {
    const matchingRoots = rootsByRepositoryId.get(repositoryId) || []
    for (const root of matchingRoots) {
      root.replaceWith(matchingRoots.length === 1 ? updatedMenu : updatedMenu.cloneNode(true))
    }
  }
}

// Perform a single request to replace all UserList menus currently present in the DOM with updated versions from the
// server.
//
// Expects a response in form of:
//
// {
//   "<repo id 0>": "<div> <!-- markup for menu for repo 0 --></div>",
//   "<repo id 1>": "<div> <!-- markup for menu for repo 1 --></div>",
//   "<repo id 2>": "<div> <!-- markup for menu for repo 2 --></div>"
// }
async function updateAllUserListMenus() {
  const roots = document.querySelectorAll<HTMLElement>('.js-user-list-menu-content-root')
  if (roots.length === 0) return

  const batchUpdateUrl = roots[0]!.getAttribute('data-batch-update-url')
  if (!batchUpdateUrl) return

  const csrfToken = roots[0]!.querySelector<HTMLInputElement>('.js-user-list-batch-update-csrf')?.value
  if (!csrfToken) return

  const rootsByRepositoryId = groupRootsByRepositoryId(roots)
  const repositoryIds = rootsByRepositoryId.keys()
  const renderedMenuContents = await requestMenuBatchRender(batchUpdateUrl, csrfToken, repositoryIds)
  if (renderedMenuContents.size > 0) {
    replaceUserListMenuRoots(renderedMenuContents, rootsByRepositoryId)
  }
}

function requestUserListMenuFormSubmit(form: HTMLFormElement) {
  const promise = new Promise<void>((resolve, reject) => {
    form.addEventListener('user-list-menu-form:success', () => resolve())
    form.addEventListener('user-list-menu-form:error', error => reject(error))
  })
  requestSubmit(form)
  return promise
}

function submitUserListFormOnToggle(event: Event) {
  const detailsElement = event.target
  if (!(detailsElement instanceof HTMLDetailsElement)) return
  if (detailsElement.hasAttribute('open')) return

  const form = detailsElement.querySelector<HTMLFormElement>('.js-user-list-menu-form')
  if (form && hasDirtyFields(form)) requestSubmit(form)

  const triggerText = detailsElement.querySelector('.js-user-list-create-trigger-text')
  if (triggerText) triggerText.textContent = ''
}

on('toggle', '.js-user-list-menu', submitUserListFormOnToggle, {capture: true})

onInput('.js-user-lists-menu-filter', (event: Event) => {
  const target = event.currentTarget as HTMLInputElement
  const value = target.value.trim()
  const root = target.closest('.js-user-list-menu-content-root')
  const triggerText = root?.querySelector('.js-user-list-create-trigger-text')

  if (!triggerText) return
  triggerText.textContent = value ? `"${value}"` : ''
})

remoteForm('.js-user-list-menu-form', async function (form, wants) {
  let response: SimpleResponse
  try {
    response = await wants.json()
  } catch (error) {
    showGlobalError()
    fire(form, 'user-list-menu-form:error', error)
    return
  }

  // Update the star button state and counts if necessary.
  // We only update the star count if the repo was just starred. Otherwise the count could jump every time you dismiss
  // the menu, which would be jarring.
  if (response.json.didStar) {
    const togglerContainer = form.closest<HTMLElement>('.js-toggler-container')
    if (togglerContainer) togglerContainer.classList.add('on')

    const starCount = response.json.starCount
    if (starCount) {
      const socialContainer = form.closest<HTMLElement>('.js-social-container')
      if (socialContainer) updateSocialCounts(socialContainer, starCount)
    }
  }

  const menuContentRoot = form.closest<HTMLElement>('.js-user-list-menu-content-root[data-update-after-submit]')
  if (menuContentRoot) {
    // Reset checkbox state before potentially calling updateContent() to avoid the checkboxes being detected as "dirty"
    // and terminating the update. They'll be checked in the updated content, assuming the repo was in fact added
    // successfully.
    for (const input of form.querySelectorAll<HTMLInputElement>('.js-user-list-menu-item')) {
      input.checked = input.defaultChecked
    }
  }

  if (response.json.didCreate) {
    // There's a new UserList to include in the menus now. Let's batch-update them all.
    await updateAllUserListMenus()
  } else if (menuContentRoot) {
    // Otherwise, only update our local menu.
    await updateContent(menuContentRoot)
  }

  fire(form, 'user-list-menu-form:success')
})

// Delete dialog

on('click', '.js-user-list-delete-confirmation-trigger', event => {
  const {currentTarget} = event
  const templateID = currentTarget.getAttribute('data-template-id')
  if (!templateID) return

  const template = document.getElementById(templateID)
  if (!template || !(template instanceof HTMLTemplateElement)) return

  const editDialog = currentTarget.closest<HTMLDetailsElement>('.js-edit-user-list-dialog')
  if (editDialog) {
    editDialog.open = false
  }
  const content = template.content.cloneNode(true)
  const labelledBy = template.getAttribute('data-labelledby')!

  dialog({content, labelledBy})
})

// Create dialog

on('click', '.js-user-lists-create-trigger', async function (event) {
  const {currentTarget} = event
  const template = document.querySelector<HTMLTemplateElement>('.js-user-list-create-dialog-template')
  const repositoryId = event.currentTarget.getAttribute('data-repository-id')
  const userListMenuRoot = currentTarget.closest<HTMLElement>('.js-user-list-menu-content-root')
  const filter = userListMenuRoot?.querySelector<HTMLInputElement>('.js-user-lists-menu-filter')
  const placeholderName = filter?.value.trim()

  if (!template || !(template instanceof HTMLTemplateElement) || !repositoryId) {
    // No template rendered on the page, or malformed button markup.
    // Disable the button as something marginally better than silently doing nothing.
    if (currentTarget instanceof HTMLButtonElement) {
      currentTarget.disabled = true
    }
    return
  }

  const label = template.getAttribute('data-label')!

  // Submit the form first if there are any dirty fields.
  if (userListMenuRoot && hasDirtyFields(userListMenuRoot)) {
    const userListMenuForm = userListMenuRoot.querySelector<HTMLFormElement>('.js-user-list-menu-form')
    if (userListMenuForm) await requestUserListMenuFormSubmit(userListMenuForm)
  }

  const content = new TemplateInstance(template, {repositoryId, placeholderName})
  const dialogElement = await dialog({content, label})

  dialogElement.addEventListener('user-list-form:success', async formEvent => {
    const payload = (formEvent as CustomEvent).detail
    if (!(payload instanceof DocumentFragment)) return

    // Update the star button.
    const urlTargetElement = payload.querySelector('.js-target-url')

    const didStar = urlTargetElement?.getAttribute('data-did-star') === 'true'
    if (!didStar) return

    const togglerContainer = currentTarget.closest<HTMLElement>('.js-toggler-container')
    if (togglerContainer) togglerContainer.classList.add('on')

    const starCount = urlTargetElement?.getAttribute('data-star-count')
    if (starCount) {
      const socialContainer = currentTarget.closest<HTMLElement>('.js-social-container')
      if (socialContainer) updateSocialCounts(socialContainer, starCount)
    }

    // Update all currently loaded user list menu contents to include the created list.
    await updateAllUserListMenus()

    // Then, dismiss the dialog.
    const detailsElement = dialogElement.closest<HTMLDetailsElement>('details')
    if (detailsElement) detailsElement.open = false
  })
})
