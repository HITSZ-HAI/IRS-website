/*
 * This module is responsible for showing the spoof commit warning banner on
 * the commit details page.
 *
 * This banner is displayed if the commit is not reachable from any named ref,
 * to warn the user that they may be looking at a commit from another fork of
 * the repo.
 *
 * We indicate that the commit is unreachable by including an element with the
 * ID `js-spoofed-commit-warning-trigger` in the page, instead of links to the
 * branches and tags that the commit belongs to.
 */

// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const showSpoofCommitBanner = () => {
  const banner = document.getElementById('spoof-warning') as HTMLElement
  if (!banner) {
    // If the banner isn't present in the DOM, there's no way we can display
    // it. This indicates we're not on a commit detail page.
    return
  }

  const commitTitle = document.querySelector<HTMLElement>('.commit-title')!
  if (commitTitle) {
    commitTitle.classList.add('pb-1')
  }

  banner.hidden = false
  banner.removeAttribute('aria-hidden')
}

observe('#js-spoofed-commit-warning-trigger', {
  add: showSpoofCommitBanner,
})
