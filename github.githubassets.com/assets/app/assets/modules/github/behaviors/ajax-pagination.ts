// eslint-disable-next-line no-restricted-imports
import {fire} from 'delegated-events'
import {remoteForm} from '@github/remote-form'

// Dashboard event stream ajax pagination
remoteForm('form.js-ajax-pagination, .js-ajax-pagination form', async function (form, wants) {
  const container = form.closest<HTMLElement>('.js-ajax-pagination')!
  let response
  try {
    response = await wants.html()
  } catch (err) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (err.response && err.response.status === 404) {
      container.remove()
      return
    } else {
      throw err
    }
  }
  container.replaceWith(response.html)
  fire(form, 'page:loaded')
})
