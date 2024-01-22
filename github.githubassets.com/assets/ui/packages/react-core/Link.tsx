import React from 'react'
import {Link as RouterLink, type LinkProps, resolvePath, matchRoutes} from 'react-router-dom'
import {AppContext} from './app-context'
import {ssrSafeLocation} from '@github-ui/ssr-utils'

export const Link = React.forwardRef(
  ({to, reloadDocument, ...props}: LinkProps, ref: React.ForwardedRef<HTMLAnchorElement>): React.ReactElement => {
    const {routes} = React.useContext(AppContext)
    const pathname = resolvePath(to, ssrSafeLocation.pathname).pathname
    reloadDocument = reloadDocument ?? !matchRoutes(routes, pathname)
    return <RouterLink to={to} {...props} reloadDocument={reloadDocument} ref={ref} />
  },
)

Link.displayName = 'Link'
