// The current pixel height of the base sticky headers - currently only set by notification shelf
let baseStickyHeaderHeight = 0

type StickyHeightObserver = (newHeight: number) => void
const stickyHeaderHeightObservers = new Set<StickyHeightObserver>()

export function observeStickyHeaderHeight(observer: StickyHeightObserver): void {
  stickyHeaderHeightObservers.add(observer)
}

export function unobserveStickyHeaderHeight(observer: StickyHeightObserver): void {
  stickyHeaderHeightObservers.delete(observer)
}

export function getBaseStickyHeaderHeight() {
  return baseStickyHeaderHeight
}

export function setBaseStickyHeaderHeight(height: number) {
  baseStickyHeaderHeight = height

  // set a css variable on the body for calculations within other sticky headers
  if (height) {
    document.body.style.setProperty('--base-sticky-header-height', `${height}px`)
  } else {
    document.body.style.removeProperty('--base-sticky-header-height')
  }

  for (const observer of stickyHeaderHeightObservers) {
    observer(height)
  }
}

export const baseStickyHeaderHeightCss = 'var(--base-sticky-header-height, 0px)'
