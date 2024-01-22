import type {Client} from '@optimizely/optimizely-sdk'
import {createInstance} from './github/optimizely'
import {getCookies} from './github/cookies'
import {getOrCreateClientId} from '@github/hydro-analytics-client'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'
import {getUserAttributes} from './optimizely-utils'

let optimizely: Client
;(async function () {
  optimizely = createInstance()
  // onReady() is needed when you use an sdk key in createInstance() to initialize, right now we only use the datafile,
  // so the returned Promise will resolve immediately.
  // Since createInstance() can by sync/async depending on how to initialize
  // we are keeping this all in an async call and onReady() so we are prepared for either case.
  await optimizely.onReady()
})()

// Track an event with Optimizely
// Usage: add a 'data-optimizely-event' attribute to the element you want to track with the event
// key and user analytics_tracking_id.
//
// Example for a logged-in experiment:
//  <a data-optimizely-event="click.global_header.your_organizations, <%= current_user.analytics_tracking_id %>"
//     href="/settings/organizations">Your Organizations</a>
//
// Example for a logged-out experiment on a non-cached page:
//  <a data-optimizely-event="click.global_header.your_organizations, <%= current_visitor.unversioned_octolytics_id %>"
//     href="/settings/organizations">Your Organizations</a>
//
// Example for a logged-out experiment on a cached page:
//  <a data-optimizely-event="click.global_header.your_organizations"
//     href="/settings/organizations">Your Organizations</a>
//
on('click', '[data-optimizely-event]', function (event) {
  if (!optimizely) return

  const element = event.currentTarget as HTMLElement
  const optimizelyEvent = element.getAttribute('data-optimizely-event') || ''
  const [key, userId] = optimizelyEvent.trim().split(/\s*,\s*/)
  const userAttributes = getUserAttributes(element)

  if (key && userId) {
    optimizely.track(key, userId, userAttributes)
  } else if (key) {
    optimizely.track(key, getOrCreateClientId(), userAttributes)
  }
})

// Activate an optimizely experiment on page load and display the enabled variation
// Usage:
//   * Add a 'data-optimizely-experiment' attribute with the experiment key to the element that
//     contains the different experiment variations.
//   * Add a 'data-optimizely-variation' attribute with the variation key to each variation element.
//     Mark the control (e.g. the default) variation as visible, and all other variations as hidden.
//   * Add 'data-optimizely-meta-* attributes to the element so it can be sent to Optimizely when
//     the experiment is activated.
//
// Example:
//   <div data-optimizely-experiment="my_experiment" data-optimizely-meta-user-country="US">
//     <div data-optimizely-variation="control"></div>
//     <div data-optimizely-variation="variation1" hidden></div>
//     <div data-optimizely-variation="variation2" hidden></div>
//   </div>

observe('[data-optimizely-experiment]', container => {
  if (!optimizely) return

  const experimentKey = container.getAttribute('data-optimizely-experiment')
  // return if no experiment key provided or if the experiment container is not visible
  // e.g. if the experiment container is a dismissible prompt, it might be hidden if the user
  // previously dismissed it
  if (!experimentKey || (container as HTMLElement).hidden) return

  const userAttributes = getUserAttributes(container as HTMLElement)
  const enabledVariationKey = optimizely.activate(experimentKey, getOrCreateClientId(), userAttributes)
  // return if not enrolled in the experiment and leave the default variation visible
  if (!enabledVariationKey) return

  const variations = container.querySelectorAll<HTMLElement>('[data-optimizely-variation]')
  for (const variation of variations) {
    const variationKey = variation.getAttribute('data-optimizely-variation')
    variation.hidden = !(variationKey === enabledVariationKey)
  }
})

// BEGIN KOREAN HOMEPAGE TRANSLATION EXPERIMENT
// https://github.com/github/international-expansion/issues/126
// https://app.optimizely.com/v2/projects/16737760170/experiments/20121990335

// Look for a cookie set by varnish-iris-sidecar
const homepageLanguages =
  document.querySelector('meta[name="enabled-homepage-translation-languages"]')?.getAttribute('content')?.split(',') ||
  []
const enrolledInKoreanHomepageExperiment =
  getCookies('_locale_experiment').length > 0 &&
  getCookies('_locale_experiment')[0]!.value === 'ko' &&
  homepageLanguages.includes('ko')

if (enrolledInKoreanHomepageExperiment && window.location.pathname === '/') runKoreanHomepageExperiment()
if (enrolledInKoreanHomepageExperiment && window.location.pathname === '/join') trackSignupsFromKoreanHomepage()

async function runKoreanHomepageExperiment() {
  const experimentKey = 'ko_homepage_translation'
  const userId = getOrCreateClientId()
  const variationKey = getCookies('_locale')[0]?.value?.slice(0, 2) // en or ko

  optimizely.setForcedVariation(experimentKey, userId, variationKey!)
  optimizely.activate(experimentKey, userId)

  // hide or show control and candidate elements dependending on current variation
  const variations = document.querySelectorAll<HTMLElement>('[data-optimizely-variation]')
  for (const variation of variations) {
    variation.hidden = variationKey !== variation.getAttribute('data-optimizely-variation')
  }

  for (const element of document.querySelectorAll<HTMLElement>('form[action^="/join"]')) {
    element.addEventListener('submit', () => {
      optimizely.track('submit.homepage_signup', userId)
    })
  }

  for (const element of document.querySelectorAll<HTMLElement>('a[href^="/join"]')) {
    element.addEventListener('click', () => {
      optimizely.track('click.homepage_signup', userId)
    })
  }
}

async function trackSignupsFromKoreanHomepage() {
  document.getElementById('signup-form')?.addEventListener('submit', () => {
    const experimentKey = 'ko_homepage_translation'
    const userId = getOrCreateClientId()
    optimizely.activate(experimentKey, userId)
    optimizely.track('submit.create_account', userId)
  })
}

// END KOREAN HOMEPAGE TRANSLATION EXPERIMENT

// BEGIN TEST EXPERIMENT
// Test experiment used to test updates to the client-side optimizely integration
// in development, review-lab, and production
if (window.location.pathname === '/settings/profile') runTestExperiment()
async function runTestExperiment() {
  if (!optimizely) return

  const userId = getOrCreateClientId()

  optimizely.activate('test_experiment', userId)
  optimizely.track('test_event', userId)
}
// END TEST EXPERIMENT
