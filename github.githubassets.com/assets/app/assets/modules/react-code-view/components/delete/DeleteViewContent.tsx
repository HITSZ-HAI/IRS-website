import type {DeleteInfo, WebCommitInfo} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {DiffPlaceholder} from '@github-ui/diffs/DiffParts'
import {Box, Flash, Heading} from '@primer/react'

import {useFilesPageInfo, useReposAppPayload} from '../../hooks/FilesPageInfo'
import {EditingForkBanner} from '../blob-edit/banners/EditingForkBanner'
import {EditIssues} from '../blob-edit/EditIssues'
import {DiffEntry} from './DeleteViewEntry'

export function DeleteViewContent({deleteInfo, webCommitInfo}: {deleteInfo: DeleteInfo; webCommitInfo: WebCommitInfo}) {
  const {path} = useFilesPageInfo()
  const {helpUrl} = useReposAppPayload()
  const repo = useCurrentRepository()

  if (webCommitInfo.shouldFork || webCommitInfo.shouldUpdate || webCommitInfo.lockedOnMigration) {
    return <EditIssues binary={false} helpUrl={helpUrl} webCommitInfo={webCommitInfo} />
  }

  return (
    <Box sx={{maxWidth: '1280px', mx: 'auto'}}>
      <Heading as="h1" className="sr-only">{`Deleting ${deleteInfo.isBlob ? '' : 'directory '}${
        repo.name
      }/${path}. Commit changes to save.`}</Heading>
      <DiffPlaceholder />
      {webCommitInfo.forkedRepo && (
        <EditingForkBanner forkName={webCommitInfo.forkedRepo.name} forkOwner={webCommitInfo.forkedRepo.owner} />
      )}
      {deleteInfo.truncated && (
        <Flash variant="warning" className="mb-2">
          The diff you&apos;re trying to view is too large. We only load the first 1000 changed files.
        </Flash>
      )}

      {deleteInfo.diffs.map((diff, index) => {
        return <DiffEntry key={index} diff={diff} index={index} />
      })}
    </Box>
  )
}

try{ DeleteViewContent.displayName ||= 'DeleteViewContent' } catch {}