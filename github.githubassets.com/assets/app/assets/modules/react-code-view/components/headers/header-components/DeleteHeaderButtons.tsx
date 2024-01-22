import type {WebCommitInfo} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {Box, Button} from '@primer/react'
import {lazy, startTransition, Suspense, useRef, useState} from 'react'

import {useFilesPageInfo, useReposAppPayload} from '../../../hooks/FilesPageInfo'
import type {WebCommitDialogState} from '../../blob-edit/WebCommitDialog'

const WebCommitDialog = lazy(() => import('../../blob-edit/WebCommitDialog'))

export function DeleteHeaderButtons({webCommitInfo, isBlob}: {webCommitInfo: WebCommitInfo; isBlob: boolean}) {
  const [webCommitDialogState, setWebCommitDialogState] = useState<WebCommitDialogState>('closed')
  const commitChangesOpen = webCommitDialogState === 'pending' || webCommitDialogState === 'saving'

  const returnFocusRef = useRef<HTMLButtonElement>(null)
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const {helpUrl} = useReposAppPayload()

  const cancelUrl = repositoryTreePath({repo, commitish: refInfo.name, action: isBlob ? 'blob' : 'tree', path})

  if (webCommitInfo.shouldFork || webCommitInfo.shouldUpdate || webCommitInfo.lockedOnMigration) {
    return null
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap-reverse', justifyContent: 'flex-end'}}>
      <Button as={Link} to={cancelUrl}>
        Cancel changes
      </Button>
      <Button
        variant="primary"
        ref={returnFocusRef}
        onClick={() => {
          startTransition(() => {
            setWebCommitDialogState('pending')
          })
        }}
      >
        Commit changes...
      </Button>
      {commitChangesOpen && (
        <Suspense fallback={null}>
          <WebCommitDialog
            isNewFile={false}
            isDelete={true}
            helpUrl={helpUrl}
            ownerName={repo.ownerLogin}
            dialogState={webCommitDialogState}
            setDialogState={setWebCommitDialogState}
            refName={refInfo.name}
            placeholderMessage={`Delete ${path}${isBlob ? '' : ' directory'}`}
            webCommitInfo={webCommitInfo}
            returnFocusRef={returnFocusRef}
          />
        </Suspense>
      )}
    </Box>
  )
}

try{ WebCommitDialog.displayName ||= 'WebCommitDialog' } catch {}
try{ DeleteHeaderButtons.displayName ||= 'DeleteHeaderButtons' } catch {}