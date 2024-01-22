// Installs observer to account for sticky/fixed overlay offsets when navigating
// to a fragment.
import {computeFixedYOffset, scrollToFragmentTarget} from '../sticky-scroll-into-view'
import hashChange from './hash-change'
// eslint-disable-next-line no-restricted-imports
import {on} from 'delegated-events'

function scrollTargetIntoViewIfNeeded() {
  const root = <HTMLHtmlElement>document.firstElementChild!
  if (root.classList.contains('js-skip-scroll-target-into-view')) return

  if (computeFixedYOffset(document)) {
    scrollToFragmentTarget(document)
  }
}

hashChange(scrollTargetIntoViewIfNeeded)

on('click', 'a[href^="#"]', function (event) {
  const {currentTarget} = event
  if (!(currentTarget instanceof HTMLAnchorElement)) return

  // this defers the execution of scrollTargetIntoViewIfNeeded until after all the click stuff happened, including after scroll
  setTimeout(scrollTargetIntoViewIfNeeded, 0)
})
