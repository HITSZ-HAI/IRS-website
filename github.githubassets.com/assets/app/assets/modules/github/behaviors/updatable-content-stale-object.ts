import {registerStaleRecords, replaceContent} from '../updatable-content'
import {ready} from '@github-ui/document-ready'
import {replaceState} from '../history'

async function reapplyPreviouslyUpdatedContent() {
  if (!history.state || !history.state.staleRecords) return
  await ready
  for (const url in history.state.staleRecords) {
    for (const urlTarget of document.querySelectorAll(
      `.js-updatable-content [data-url='${url}'], .js-updatable-content[data-url='${url}']`,
    )) {
      const data = history.state.staleRecords[url]
      if (urlTarget instanceof HTMLElement) replaceContent(urlTarget, data, true)
    }
  }
  replaceState(null, '', location.href)
}

window.addEventListener('pagehide', registerStaleRecords)

try {
  reapplyPreviouslyUpdatedContent()
} catch {
  // ignore
}
