import type {WebCommitInfo} from '@github-ui/code-view-types'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {useCSRFToken} from '@github-ui/use-csrf-token'
import {AlertIcon, GitBranchIcon, LockIcon, PencilIcon} from '@primer/octicons-react'
import {Box, Button, Link, Octicon, Text} from '@primer/react'

export function EditIssues({
  binary,
  helpUrl,
  webCommitInfo,
}: {
  binary: boolean
  helpUrl: string
  webCommitInfo: WebCommitInfo
}) {
  const {shouldFork, lockedOnMigration, shouldUpdate} = webCommitInfo

  let pathname = ssrSafeLocation.pathname

  // Slice trailing slash because the csrf token is generated without it
  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }

  const currentPath = pathname + ssrSafeLocation.search
  const token = useCSRFToken(currentPath, 'post')

  const issue = lockedOnMigration
    ? {
        message: 'This repository is currently being migrated.',
        description: 'Sorry, you’re not able to edit this repository while the migration is in progress.',
        icon: LockIcon,
      }
    : shouldFork
      ? {
          message: 'You need to fork this repository to propose changes.',
          description:
            'Sorry, you’re not able to edit this repository directly—you need to fork it and propose your changes from there instead.',
          icon: GitBranchIcon,
        }
      : shouldUpdate
        ? {
            message: 'Sorry, it looks like your fork is outdated!',
            description: 'You’ll have to bring it up to date before you can propose changes.',
            icon: AlertIcon,
          }
        : binary
          ? {
              message: 'Binary file content is not editable.',
              description: 'But you can still rename or move it.',
              icon: PencilIcon,
            }
          : null

  if (!issue) return null

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', m: 4}}>
      <Octicon icon={issue.icon} size="medium" sx={{color: 'fg.muted', mb: 2}} />
      <Text as="h3" sx={{mb: 1}}>
        {issue.message}
      </Text>
      <Text sx={{mb: 2}}>{issue.description}</Text>
      {(shouldFork || shouldUpdate) && (
        <form data-turbo="false" method="post" action={currentPath} data-testid="edit-issues-form">
          {/* eslint-disable-next-line github/authenticity-token */}
          <input hidden name="authenticity_token" value={token} readOnly />
          {/** Sumbit the page as a POST request so we can fork the repository for the user **/}
          <Button type="submit" variant="primary">
            {shouldFork ? 'Fork this repository' : 'Update your fork'}
          </Button>
        </form>
      )}
      {shouldFork && <Link href={`${helpUrl}/articles/fork-a-repo`}>Learn more about forks</Link>}
    </Box>
  )
}

try{ EditIssues.displayName ||= 'EditIssues' } catch {}