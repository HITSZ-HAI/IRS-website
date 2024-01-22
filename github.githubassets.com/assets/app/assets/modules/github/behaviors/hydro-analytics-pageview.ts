import {loaded} from '@github-ui/document-ready'
import {sendPageView} from '@github-ui/hydro-analytics'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {getSoftNavMechanism} from '@github-ui/soft-nav/utils'
;(async function () {
  // Turbo loads should be treated like pageloads
  document.addEventListener(SOFT_NAV_STATE.FRAME_UPDATE, () =>
    sendPageView({
      turbo: 'true',
    }),
  )

  document.addEventListener(SOFT_NAV_STATE.SUCCESS, () => {
    if (getSoftNavMechanism() === 'turbo.frame') {
      return
    } else {
      sendPageView({
        turbo: 'true',
      })
    }
  })

  // Send a page view as soon as the page is loaded
  await loaded
  sendPageView()
})()
