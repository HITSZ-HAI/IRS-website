import type {RecentlyTouchedBranch} from '@github-ui/code-view-types'
import type {Repository} from '@github-ui/current-repository'
import {branchPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {useAlive} from '@github-ui/use-alive'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {GitBranchIcon} from '@primer/octicons-react'
import {Box, Flash, LinkButton, Octicon} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {agoString} from '../../../../react-shared/Ago'

export function RecentlyTouchedBranches({channel, repo}: {channel: string; repo: Repository}) {
  const [branches, setBranches] = useState<RecentlyTouchedBranch[]>([])

  const fetchRecentlyTouchedBranches = useCallback(async () => {
    const response = await verifiedFetchJSON(`/${repo.ownerLogin}/${repo.name}/recently-touched-branches`)

    if (response.ok) {
      setBranches(await response.json())
    }
  }, [repo.name, repo.ownerLogin])

  const timeout = useRef<number | null>(null)

  const handleAliveEvent = useCallback(() => {
    // We get a lot of events for one push, so we debounce them.
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current)
    }

    timeout.current = window.setTimeout(() => {
      fetchRecentlyTouchedBranches()
    }, 500)
  }, [fetchRecentlyTouchedBranches])

  useAlive(channel, handleAliveEvent)

  useEffect(() => {
    fetchRecentlyTouchedBranches()
  }, [fetchRecentlyTouchedBranches])

  return (
    <>
      {branches?.map((branch, index) => (
        <Flash
          key={branch.branchName + index}
          variant="warning"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: index === branches.length - 1 ? 3 : 2,
          }}
        >
          <Box sx={{mr: 1, overflowWrap: 'anywhere', 'a:not(:hover)': {color: 'inherit'}}}>
            <Octicon icon={GitBranchIcon} sx={{mr: 1}} />
            <Link
              to={branchPath({owner: branch.repoOwner, repo: branch.repoName, branch: branch.branchName})}
              reloadDocument={true}
              style={{fontWeight: 'bold'}}
            >
              {repo.ownerLogin !== branch.repoOwner ? `${branch.repoOwner}:` : ''}
              {branch.branchName}
            </Link>
            {` had recent pushes ${agoString(new Date(branch.date))}`}
          </Box>

          <LinkButton href={branch.comparePath} variant="primary">
            Compare & pull request
          </LinkButton>
        </Flash>
      ))}
    </>
  )
}

try{ RecentlyTouchedBranches.displayName ||= 'RecentlyTouchedBranches' } catch {}