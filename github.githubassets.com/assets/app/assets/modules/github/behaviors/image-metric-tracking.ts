import {sendStats} from '@github-ui/stats'
import {isFeatureEnabled} from '@github-ui/feature-flags'

document.addEventListener('DOMContentLoaded', onDOMContentLoaded)

async function onDOMContentLoaded() {
  if (isFeatureEnabled('IMAGE_METRIC_TRACKING') === false) return

  const images = Array.from(document.querySelectorAll('img.js-img-time')).slice(0, 5)
  const startTime = Date.now()
  const stats: PlatformBrowserPerformanceTransparentRedirectTiming[] = []

  await Promise.all(images.map(image => measureRedirectTiming(image, startTime, stats)))

  if (stats.length > 0) sendStats({transparentRedirectTimings: stats})
}

async function measureRedirectTiming(
  image: Element,
  startTime: number,
  stats: PlatformBrowserPerformanceTransparentRedirectTiming[],
) {
  const LOCAL_STORAGE_PATH_REGEX =
    /\/assets\/storage\/user\/([0-9]+)\/files\/([{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?)/
  const PROD_STORAGE_PATH_REGEX = /assets\/([0-9]+)\/([{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?)/

  const source = image.getAttribute('src')
  if (!source) return

  const url = new URL(source, window.location.origin)
  const pathRegex = LOCAL_STORAGE_PATH_REGEX.test(url.pathname) ? LOCAL_STORAGE_PATH_REGEX : PROD_STORAGE_PATH_REGEX
  const [, userID, fileGUID] = url.pathname.match(pathRegex) || []
  if (!userID || !fileGUID) return

  await fetch(`/assets/measure/${userID}/${fileGUID}`)

  const duration = Date.now() - startTime
  const stat: PlatformBrowserPerformanceTransparentRedirectTiming = {duration, fileGUID, userID}
  stats.push(stat)
}
