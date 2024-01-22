import {TemplateInstance} from '@github/template-parts'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

// Encrypt plain text with a public key.
export async function encrypt(publicKey: Uint8Array, value: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const messageBytes = encoder.encode(value)
  const {seal} = await import('../tweetsodium')
  return seal(messageBytes, publicKey)
}

// Decode base64 data into a byte array.
export function decode(encoded: string): Uint8Array {
  const bytes = atob(encoded)
    .split('')
    .map(x => x.charCodeAt(0))
  return Uint8Array.from(bytes)
}

// Encode a byte array as a base64 string.
export function encode(bytes: Uint8Array): string {
  let str = ''
  for (const byte of bytes) {
    str += String.fromCharCode(byte)
  }
  return btoa(str)
}

on('submit', 'form.js-encrypt-submit', async function (event) {
  const form = event.currentTarget as HTMLFormElement

  if (event.defaultPrevented || !form.checkValidity()) return
  const plainText = form.elements.namedItem('secret_value') as HTMLTextAreaElement

  // Prevent serializing plain text value in form submission.
  plainText.disabled = true

  if (!plainText.value) return

  event.preventDefault()

  // Submit encrypted value in hidden input.
  const publicKey = decode(form.getAttribute('data-public-key')!)

  ;(form.elements.namedItem('encrypted_value') as HTMLInputElement).value = encode(
    await encrypt(publicKey, plainText.value),
  )

  form.submit()
})

// Submit multiple encrypted values in hidden inputs. If an unencrypted field is empty,
// its associated hidden encrypted field is disabled.
on('submit', 'form.js-encrypt-bulk-submit', submitBulk(true))

// Submit multiple encrypted values in hidden inputs. If an unencrypted field is empty,
// its associated hidden encrypted field is not disabled.
on('submit', 'form.js-encrypt-bulk-submit-enable-empty', submitBulk(false))

// Submit multiple encrypted values. If an unencrypted field is empty,
// its associated hidden encrypted field is enabled or disabled depending on "disableEmptyValues".
function submitBulk(disableEmptyValues: boolean) {
  return async function (event: Event) {
    const form = event.currentTarget as HTMLFormElement

    if (event.defaultPrevented || !form.checkValidity()) return

    // Submit encrypted value in hidden input.
    const publicKey = decode(form.getAttribute('data-public-key')!)

    event.preventDefault()
    for (const element of form.elements) {
      // Prevent serializing plain text value in form submission.
      const formElement = element as HTMLInputElement
      if (formElement.id.endsWith('secret')) {
        formElement.disabled = true

        if (formElement.required && !formElement.value) {
          const message = `${formElement.name} is invalid!`
          const template = document.querySelector<HTMLTemplateElement>('template.js-flash-template')!
          template.after(new TemplateInstance(template, {className: 'flash-error', message}))
          return
        }

        const encryptedValueElementName = `${formElement.name}_encrypted_value`
        if (!formElement.value) {
          ;(form.elements.namedItem(encryptedValueElementName) as HTMLInputElement).disabled = disableEmptyValues
          continue
        }

        ;(form.elements.namedItem(encryptedValueElementName) as HTMLInputElement).value = encode(
          await encrypt(publicKey, formElement.value),
        )
      }
    }
    form.submit()
  }
}
