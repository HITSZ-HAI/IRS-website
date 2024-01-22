import {Tooltip} from '@primer/react'
import type {PropsWithChildren} from 'react'
import type {Author} from '../commit-attribution-types'

type AuthorTooltipProps = {
  author: Author
  renderTooltip?: boolean
}

export function AuthorTooltip({renderTooltip, author, children}: PropsWithChildren<AuthorTooltipProps>) {
  if (renderTooltip === false) return <>{children}</>

  return (
    <Tooltip aria-label={`commits by ${author.login}`} direction={'se'}>
      {children}
    </Tooltip>
  )
}

try{ AuthorTooltip.displayName ||= 'AuthorTooltip' } catch {}