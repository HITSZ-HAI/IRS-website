// Commenting: AJAX form submission
//
// Markup
//
//     <form class="js-new-comment-form">
//       <div class="js-comment-form-error" hidden>
//       </div>
//
//       <textarea class="js-comment-field"></textarea>
//
//       <button type="submit">
//         Comment
//       </button>
//     </form>
//
// Primer Validation example:
// see: https://primer.style/css/components/forms#form-group-validation
//
//   <form class="js-new-comment-form">
//     <div class="form-group js-remove-error-state-on-click">
//       <textarea class="js-comment-field" aria-describedby="body-input-validation",
//       </textarea>
//
//       <p class="note error js-comment-form-error" id="body-input-validation" hidden></p>
//
//       <button type="submit">
//         Comment
//       </button>
//     </div>
//   </form>

// eslint-disable-next-line no-restricted-imports
import {fire, on} from 'delegated-events'
import type {ErrorWithResponse} from '@github/remote-form'
import {changeValue} from '@github-ui/form-utils'
import {remoteForm} from '@github/remote-form'
import {replaceContent} from '../../updatable-content'
import {reportError} from '@github-ui/failbot'

// Check if element is in viewport
function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// Hide any comment errors on retry.
function clearFormError(form: Element) {
  const formError = form.querySelector('.js-comment-form-error')
  if (formError instanceof HTMLElement) {
    formError.hidden = true
  }
}

// Remove error state when Primer Form Validation enabled field is clicked on
on('click', '.errored.js-remove-error-state-on-click', function ({currentTarget}) {
  currentTarget.classList.remove('errored')
})

// Reset form after AJAX request is successful
remoteForm('.js-new-comment-form', async function (form, wants) {
  let response
  clearFormError(form)
  try {
    response = await wants.json()
  } catch (error) {
    reportError(error)
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    handleFormError(form, error)
  }

  if (!response) {
    return
  }

  form.reset()
  for (const field of form.querySelectorAll<HTMLInputElement>('.js-resettable-field')) {
    changeValue(field, field.getAttribute('data-reset-value') || '')
  }
  const writeTab = form.querySelector('.js-write-tab')
  if (writeTab instanceof HTMLElement) {
    const inViewPort = isInViewport(writeTab)
    if (inViewPort) {
      writeTab.click()
    }
  }
  const ref = response.json.updateContent

  for (const selector in ref) {
    const html = ref[selector]
    const el = document.querySelector(selector)
    if (el instanceof HTMLElement) {
      replaceContent(el, html)
    } else {
      // eslint-disable-next-line no-console
      console.warn(`couldn't find ${selector} for immediate update`)
    }
  }

  fire(form, 'comment:success')
})

// Show comment error if ajax request fails.
function handleFormError(form: Element, error: ErrorWithResponse) {
  // eslint-disable-next-line i18n-text/no-en
  let message = 'There was a problem saving your comment.'
  // eslint-disable-next-line i18n-text/no-en
  let messageSuffix = 'Please try again.'
  if (error.response) {
    if (error.response.status === 422) {
      const data = error.response.json
      if (data.errors) {
        if (Array.isArray(data.errors)) {
          message += ` Your comment ${data.errors.join(', ')}.`
        } else {
          message = data.errors
        }
      }
    } else if (error.response.status === 200) {
      // eslint-disable-next-line i18n-text/no-en
      messageSuffix = 'Please reload the page and try again.'
    }
  }

  message += ` ${messageSuffix}`

  const formError = form.querySelector('.js-comment-form-error')
  if (formError instanceof HTMLElement) {
    formError.textContent = message
    formError.hidden = false

    const formGroupValidationFormWrapper = formError.closest('div.form-group.js-remove-error-state-on-click')

    if (formGroupValidationFormWrapper) {
      formGroupValidationFormWrapper.classList.add('errored')
    }
  }
}
