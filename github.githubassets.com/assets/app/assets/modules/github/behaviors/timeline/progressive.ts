import {isDetailsTargetExpanded, toggleDetailsTarget} from '../details'
import {fetchSafeDocumentFragment} from '@github-ui/fetch-utils'
import hashChange from '../hash-change'
import {loadDeferredContent} from '../include-fragment'
import {scrollIntoView} from '../../sticky-scroll-into-view'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'

const SCROLL_WAIT_MEDIA_TIMEOUT = 5000
const COMMENT_IMAGE = '.js-comment-body img'
const COMMENT_VIDEO = '.js-comment-body video'

hashChange(function () {
  focusOrLoadElement()
})

observe('.js-timeline-progressive-focus-container', scrollToFocusTimelineEvent)

window.addEventListener('sticky-header-rendered', () => {
  scrollToFocusTimelineEvent()
})

function scrollToFocusTimelineEvent() {
  const anchor = urlAnchor()
  if (!anchor) return

  const pullTimeline = document.querySelector<HTMLElement>('.js-pull-discussion-timeline')
  if (pullTimeline) return

  const target = document.getElementById(anchor)

  if (target) {
    focusElement(target)
  }
}

function focusOrLoadElement(shouldLoadElement = true): void {
  const anchor = urlAnchor()
  if (!anchor) return

  const target = document.getElementById(anchor)
  if (target) {
    focusElement(target)
  } else {
    if (loadComments(anchor)) return

    const loader = document.querySelector<HTMLElement>('#js-timeline-progressive-loader')

    if (loader && shouldLoadElement) {
      loadElement(anchor, loader)
    }
  }
}

function loadComments(anchor: string): boolean {
  return (
    loadResolvedComments(anchor) ||
    loadHiddenComments(anchor, '.js-thread-hidden-comment-ids') ||
    loadHiddenComments(anchor, '.js-review-hidden-comment-ids')
  )
}

function loadResolvedComments(anchor: string): boolean {
  const commentContainer = findCommentContainer(anchor, '.js-comment-container')
  if (!commentContainer) return false

  loadDeferredContent(commentContainer)
  return true
}

function loadHiddenComments(anchor: string, selector: string): boolean {
  const commentContainer = findCommentContainer(anchor, selector)
  if (!commentContainer) return false

  commentContainer.addEventListener('page:loaded', function () {
    focusOrLoadElement()
  })
  commentContainer.querySelector<HTMLButtonElement>('button[type=submit]')!.click()
  return true
}

function findCommentContainer(anchor: string, selector: string): Element | null {
  const commentContainers = document.querySelectorAll(selector)

  for (const commentContainer of commentContainers) {
    const threadCommentIds = commentContainer.getAttribute('data-hidden-comment-ids')

    if (threadCommentIds) {
      const commentIds = threadCommentIds.split(',')
      const anchorCommentId = anchor.match(/\d+/g)?.[0]

      if (anchorCommentId && commentIds.includes(anchorCommentId)) {
        return commentContainer
      }
    }
  }
  return null
}

observe('.js-inline-comments-container', function (container) {
  const anchor = urlAnchor()
  if (!anchor) return

  const target = document.getElementById(anchor)

  if (target && container.contains(target)) {
    focusElement(target)
  }
})

// adds support for deep-link loading discussion comments when the comment thread is nested
observe('#js-discussions-timeline-anchor-loader', {
  constructor: HTMLElement,
  add: element => {
    const existingProgressiveLoader = document.querySelector('#js-timeline-progressive-loader')
    if (existingProgressiveLoader) return

    const anchor = urlAnchor()
    if (!anchor) return

    const target = document.getElementById(anchor)
    if (!target) {
      loadElement(anchor, element)
    }
  },
})

// resolves when comment body videos have loaded enough data to render the preview image
async function videosReady(): Promise<unknown> {
  const videos: NodeListOf<HTMLVideoElement> = document.querySelectorAll(COMMENT_VIDEO)
  const videoLoads = Array.from(videos).map(v => {
    return new Promise<HTMLVideoElement>(resolve => {
      if (v.readyState >= v.HAVE_METADATA) {
        resolve(v)
      } else {
        // don't wait forever :)
        const timeout = setTimeout(() => resolve(v), SCROLL_WAIT_MEDIA_TIMEOUT)
        const done = () => {
          clearTimeout(timeout)
          resolve(v)
        }
        v.addEventListener('loadeddata', () => {
          if (v.readyState >= v.HAVE_METADATA) done()
        })
        v.addEventListener('error', () => done())
      }
    })
  })
  return Promise.all(videoLoads)
}

// resolves when comment body images are loaded
async function imagesReady(): Promise<unknown> {
  const images: NodeListOf<HTMLImageElement> = document.querySelectorAll(COMMENT_IMAGE)
  const imageLoads = Array.from(images).map(i => {
    new Promise<HTMLImageElement>(resolve => {
      if (i.complete) {
        resolve(i)
      } else {
        const timeout = setTimeout(() => resolve(i), SCROLL_WAIT_MEDIA_TIMEOUT)
        const done = () => {
          clearTimeout(timeout)
          resolve(i)
        }
        i.addEventListener('load', () => done())
        i.addEventListener('error', () => done())
      }
    })
  })
  return Promise.all(imageLoads)
}

async function mediaLoaded(): Promise<unknown> {
  return Promise.all([videosReady(), imagesReady()])
}

async function focusElement(element: HTMLElement): Promise<void> {
  await mediaLoaded()
  expandDetailsIfPresent(element)
  const link = element.querySelector<HTMLElement>(`[href='#${element.id}']`)

  scrollIntoView(element)
  if (link) {
    const oldValue = link.getAttribute('data-turbo')
    link.setAttribute('data-turbo', 'false')
    link.click()
    if (oldValue === null) {
      link.removeAttribute('data-turbo')
    } else {
      link.setAttribute('data-turbo', oldValue)
    }
  }
}

async function loadElement(anchor: string, loader: HTMLElement): Promise<void> {
  if (!loader) return

  const path = loader.getAttribute('data-timeline-item-src')
  if (!path) return

  const url = new URL(path, window.location.origin)
  const params = new URLSearchParams(url.search.slice(1))
  params.append('anchor', anchor)
  url.search = params.toString()

  let html
  try {
    html = await fetchSafeDocumentFragment(document, url.toString())
  } catch (err) {
    return
  }

  const newTimelineItem = html.querySelector('.js-timeline-item')
  if (!newTimelineItem) return

  const gid = newTimelineItem.getAttribute('data-gid')
  if (!gid) return

  const currentTimelineItem = document.querySelector(`.js-timeline-item[data-gid='${gid}']`)

  if (currentTimelineItem) {
    currentTimelineItem.replaceWith(newTimelineItem)

    focusOrLoadElement(false)
  } else {
    const container = document.getElementById('js-progressive-timeline-item-container')
    if (container) container.replaceWith(html)
    focusOrLoadElement(false)
  }
}

function expandDetailsIfPresent(element: HTMLElement): void {
  const detailsContainer = element.closest<HTMLElement>('details, .js-details-container')
  if (!detailsContainer) return
  if (detailsContainer.nodeName === 'DETAILS') {
    detailsContainer.setAttribute('open', 'open')
  } else if (!isDetailsTargetExpanded(detailsContainer)) {
    toggleDetailsTarget(detailsContainer)
  }
}

function urlAnchor(): string {
  return window.location.hash.slice(1)
}
