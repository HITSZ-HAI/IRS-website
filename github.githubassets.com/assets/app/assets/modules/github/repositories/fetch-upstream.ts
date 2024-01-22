// The UI for the "Fetch upstream" drop down (in fork branches) depends on whether
// the base is cleanly mergeable. This script makes that check asynchronously,
// only once, and only if the drop down is clicked.
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

observe('.js-fetch-upstream-details-content', {
  constructor: HTMLElement,
  initialize(content) {
    content.hidden = true
  },
})

on('click', '.js-fetch-upstream-summary', async function () {
  const parent: HTMLDetailsElement = document.querySelector('details.js-fetch-upstream-details')!
  const spinner: HTMLElement = parent.querySelector('.js-fetch-upstream-details-spinner')!
  const content: HTMLElement = parent.querySelector('.js-fetch-upstream-details-content')!

  // We render the spinner in a visible state when the page loads. Once the user has opened the dialog for the first
  // time, we set `spinner.hidden = true`. This early return keeps us from fetching the mergeability
  // data from the server more than once.
  if (spinner.hidden && !content.hidden) {
    return
  }

  // We need to ensure the spinner is visible. If the user navigated away then hit the back button, the spinner may not be visible.
  spinner.hidden = false

  const conflictsUI: HTMLElement = content.querySelector('.js-fetch-upstream-conflicts-ui')!
  const noConflictsUI: HTMLElement = content.querySelector('.js-fetch-upstream-no-conflicts-ui')!

  const behind = parseInt(content.getAttribute('data-behind')!)
  if (behind === 0) {
    conflictsUI.hidden = true
    noConflictsUI.hidden = false
    content.hidden = false
    spinner.hidden = true
    return
  }
  const url = content.getAttribute('data-mergeability-check-url')!
  const response = await fetch(url, {headers: {Accept: 'application/json'}})
  content.hidden = false
  spinner.hidden = true
  if (response.ok) {
    const data = await response.json()
    if (data.state === 'clean') {
      noConflictsUI.hidden = false
    } else {
      conflictsUI.hidden = false
    }
  } else {
    conflictsUI.hidden = false
  }
})
