import {dialog} from '@github-ui/details-dialog'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

on('upload:setup', '.js-upload-avatar-image', function (event) {
  const {form} = event.detail
  const orgId = event.currentTarget.getAttribute('data-alambic-organization')
  const ownerType = event.currentTarget.getAttribute('data-alambic-owner-type')
  const ownerId = event.currentTarget.getAttribute('data-alambic-owner-id')
  if (orgId) {
    form.append('organization_id', orgId)
  }
  if (ownerType) {
    form.append('owner_type', ownerType)
  }
  if (ownerId) {
    form.append('owner_id', ownerId)
  }
})

on('upload:complete', '.js-upload-avatar-image', function (event) {
  const {attachment} = event.detail
  const url = `/settings/avatars/${attachment.id}`
  dialog({content: fetchSafeDocumentFragment(document, url), detailsClass: 'upload-avatar-details'})
})

on('dialog:remove', '.upload-avatar-details', async function (element) {
  const cropForm = element.currentTarget.querySelector('#avatar-crop-form')!
  const id = cropForm.getAttribute('data-alambic-avatar-id')!
  const url = `/settings/avatars/${id}?op=destroy`

  const csrfToken = element.currentTarget.querySelector('.js-avatar-post-csrf')!.getAttribute('value')!

  const request = new Request(url, {
    method: 'POST',
    headers: {
      'Scoped-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  await self.fetch(request)
})
