// Support linking to named anchors in user content
//
// Named elements in user content are prefixed with "user-content-" to prevent
// DOM clobbering. This allows users to link to the unprefixed named anchors by
// listening for hashchange and, when when no elements with an ID or name of the
// given hash exist, looks for an element with a prefixed name.
//
// See https://github.com/github/github/issues/23103 for more information.

import {decodeFragmentValue, findElementByFragmentName} from '../fragment-target'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {ready} from '@github-ui/document-ready'
import {scrollIntoView} from '../sticky-scroll-into-view'
import {getUserContentScrolling} from '@github-ui/allow-user-content-scrolling'

function hashchange() {
  if (!getUserContentScrolling()) {
    return
  }

  if (document.querySelector(':target')) {
    return
  }
  const hash = decodeFragmentValue(location.hash)

  // Auto-generated wiki ToCs prefix the hash with "user-content-". This allows users to link to the unprefixed named
  // by clicking the markdown header 🔗 or by copying the link from the ToC.
  const normalizedHash = hash.startsWith('user-content-') ? hash : `user-content-${hash}`

  // Check for an element with the given hash as is to support links from auto-generated wiki ToCs, if not found,
  // check for an element with the hash in lowercase to support markdown links i.e. [text](url).
  const target =
    findElementByFragmentName(document, normalizedHash) ??
    findElementByFragmentName(document, normalizedHash.toLowerCase())

  if (target) {
    scrollIntoView(target)
  }
}

// Scroll to anchor when clicked on page.
window.addEventListener('hashchange', hashchange)

// Scroll to anchor on turbo navigation
document.addEventListener('turbo:load', hashchange)

// Scroll to anchor on page load.
;(async function () {
  await ready
  hashchange()
})()

// Scroll to anchor when clicking on a link that has the exact same fragment
// identifier as already present in the URL. This won't trigger `hashchange`,
// so we need to scroll manually.
on('click', 'a[href]', function (event) {
  const {currentTarget} = event
  if (!(currentTarget instanceof HTMLAnchorElement)) return

  if (currentTarget.href === location.href && location.hash.length > 1) {
    setTimeout(function () {
      if (!event.defaultPrevented) hashchange()
    })
  }
})
