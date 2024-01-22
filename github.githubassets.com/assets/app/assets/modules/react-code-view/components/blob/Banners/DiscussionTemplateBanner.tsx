import type {YamlTemplate} from '@github-ui/code-view-types'
import {SafeHTMLText} from '@github-ui/safe-html'
import {AlertIcon} from '@primer/octicons-react'
import {Flash, Link, Octicon} from '@primer/react'

export function DiscussionTemplateBanner({errors}: YamlTemplate) {
  if (!errors || errors.length === 0) {
    return null
  }

  const errorMessageLinkText: string[] = []
  if (errors.length === 1) {
    errorMessageLinkText.push('Learn more about this error.')
  } else {
    errors.map((error, index) => {
      errorMessageLinkText.push(`Learn more about error ${index + 1}.`)
    })
  }

  return (
    <Flash variant={'danger'} sx={{mt: 3}}>
      <p>
        <Octicon icon={AlertIcon} />
        <strong>There {errors.length === 1 ? 'is a problem' : 'are some problems'} with this template</strong>
      </p>
      {errors.map((error, index) => {
        return (
          <p key={`error-${index}`}>
            <SafeHTMLText html={error.message} />
            {'. '}
            <Link href={error.link} target="_blank">
              {errorMessageLinkText[index]}
            </Link>
          </p>
        )
      })}
    </Flash>
  )
}

try{ DiscussionTemplateBanner.displayName ||= 'DiscussionTemplateBanner' } catch {}