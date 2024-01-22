import {ready} from '@github-ui/document-ready'
;(async function () {
  if ('serviceWorker' in navigator) {
    await ready
    const serviceWorkerPath = document.querySelector<HTMLLinkElement>('link[rel="service-worker-src"]')?.href
    if (serviceWorkerPath) {
      navigator.serviceWorker.register(serviceWorkerPath, {scope: '/'})
    } else {
      await unregisterAllServiceWorkers()
    }
  }
})()

async function unregisterAllServiceWorkers() {
  let registrations: readonly ServiceWorkerRegistration[] = []
  try {
    registrations = await navigator.serviceWorker.getRegistrations()
  } catch (error) {
    // @ts-expect-error catch blocks are bound to `unknown` so we need to validate the type before using it
    if (error.name === 'SecurityError') return
  }

  for (const registration of registrations) {
    registration.unregister()
  }
}
