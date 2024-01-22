import {useCurrentRepository} from '@github-ui/current-repository'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {AlertIcon} from '@primer/octicons-react'
import {Flash, Octicon, Text} from '@primer/react'

import {useFilesPageInfo} from '../../hooks/FilesPageInfo'

export function SpoofedCommitWarning() {
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const [latestCommit] = useLatestCommit(repo.ownerLogin, repo.name, refInfo.name, path)
  if (!latestCommit?.isSpoofed) {
    return null
  }

  return (
    <Flash variant="warning" sx={{mt: 3}}>
      <Octicon icon={AlertIcon} />
      <Text>
        This commit does not belong to any branch on this repository, and may belong to a fork outside of the
        repository.
      </Text>
    </Flash>
  )
}

try{ SpoofedCommitWarning.displayName ||= 'SpoofedCommitWarning' } catch {}