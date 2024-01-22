import React from 'react'
import {
  matchRoutes,
  type NavigateOptions,
  resolvePath,
  type To,
  useNavigate as useReactRouterNavigate,
} from 'react-router-dom'

import isHashNavigation from '@github-ui/is-hash-navigation'
import {AppContext} from '@github-ui/react-core/app-context'
import {startSoftNav} from '@github-ui/soft-nav/state'

export const useNavigate = (): ((to: To, options?: NavigateOptions) => void) => {
  const {routes, history} = React.useContext(AppContext)
  const reactRouterNavigate = useReactRouterNavigate()
  return React.useCallback(
    (to, options) => {
      const pathname = resolvePath(to).pathname
      const isExternalToApp = !matchRoutes(routes, pathname)

      if (isExternalToApp) {
        const href = history.createHref(to)
        ;(async () => {
          const {softNavigate: turboSoftNavigate} = await import('@github-ui/soft-navigate')
          turboSoftNavigate(href)
        })()
      } else {
        if (!isHashNavigation(location.href, to.toString())) {
          startSoftNav('react')
        }
        reactRouterNavigate(to, options)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {turbo, ...state} = window.history.state
        window.history.replaceState({...state, skipTurbo: true}, '', location.href)
      }
    },
    [history, reactRouterNavigate, routes],
  )
}
