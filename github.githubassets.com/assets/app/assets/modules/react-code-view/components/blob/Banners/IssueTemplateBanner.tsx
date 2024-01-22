import {SafeHTMLText} from '@github-ui/safe-html'
import {AlertIcon} from '@primer/octicons-react'
import {Flash, Label, Link, Octicon} from '@primer/react'
import type React from 'react'

import {useCurrentBlob} from '../../../hooks/CurrentBlob'

export function IssueTemplateBanner() {
  const payload = useCurrentBlob()

  const issueTemplate = payload.issueTemplate

  if (!payload.loggedIn || (!issueTemplate && !payload.isValidLegacyIssueTemplate && !payload.showIssueFormWarning)) {
    return null
  }

  let content: React.ReactNode = null

  let flashType: 'success' | 'danger' | 'default' | 'warning' | undefined = undefined
  const errorMessageLinkText: string[] = []

  if (issueTemplate) {
    if (issueTemplate.valid === false) {
      flashType = 'danger'
      if (issueTemplate.errors) {
        if (issueTemplate.errors.length === 1) {
          errorMessageLinkText.push('Learn more about this error.')
        } else {
          issueTemplate.errors.map((error, index) => {
            errorMessageLinkText.push(`Learn more about error ${index + 1}.`)
          })
        }
      }

      content = (
        <>
          <p>
            <Octicon icon={AlertIcon} />
            <strong>
              There {issueTemplate.errors?.length === 1 ? 'is a problem' : 'are some problems'} with this template
            </strong>
          </p>

          {issueTemplate.errors?.map((error, index) => {
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
        </>
      )
    } else {
      if (issueTemplate.structured) {
        content = (
          <>
            <Label sx={{mr: 2}} variant="success">
              Beta
            </Label>
            This file is used as an Issue Form template.{' '}
            <a href="https://github.com/orgs/community/discussions/categories/projects-and-issues">Give Feedback.</a>
          </>
        )
      } else {
        content = 'This file is used as a markdown issue template.'
      }
    }
  } else if (payload.showIssueFormWarning) {
    content = 'Issue form templates are not supported on private repositories.'
    flashType = 'warning'
  }

  return (
    <>
      {(issueTemplate || payload.showIssueFormWarning) && (
        <Flash variant={flashType} sx={{mt: 3}}>
          {content}
        </Flash>
      )}
      {payload.isValidLegacyIssueTemplate && <LegacyIssueTemplateBanner helpUrl={payload.issueTemplateHelpUrl} />}
    </>
  )
}

function LegacyIssueTemplateBanner({helpUrl}: {helpUrl: string}) {
  return (
    <Flash variant="warning" sx={{mt: 3}}>
      You are using an old version of issue templates. Please update to the new issue template workflow.{' '}
      <Link href={helpUrl} target="_blank">
        Learn more about issue templates.
      </Link>
    </Flash>
  )
}

try{ IssueTemplateBanner.displayName ||= 'IssueTemplateBanner' } catch {}
try{ LegacyIssueTemplateBanner.displayName ||= 'LegacyIssueTemplateBanner' } catch {}