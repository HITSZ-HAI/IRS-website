import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {RefSelector} from '@github-ui/ref-selector'
import type {ButtonProps} from '@primer/react'

import {useRefCreateErrorHandling} from '../../../react-shared/Repos/use-ref-create-error-handling'
import {useFilesPageInfo} from '../../hooks/FilesPageInfo'
import {useShortcut} from '../../hooks/shortcuts'
import {useReposAnalytics} from '../../hooks/use-repos-analytics'

export function ReposHeaderRefSelector({
  size,
  buttonClassName,
  allowResizing,
  idEnding,
}: {
  size?: ButtonProps['size']
  buttonClassName?: string
  allowResizing?: boolean
  idEnding?: string
}) {
  const repo = useCurrentRepository()
  const {refInfo, path, action} = useFilesPageInfo()
  const onCreateError = useRefCreateErrorHandling()
  const {sendRepoClickEvent} = useReposAnalytics()
  const {refSelectorShortcut} = useShortcut()

  let refNameOrCommit = refInfo.name
  if (refNameOrCommit === refInfo.currentOid) {
    // truncate the commit OID to 7 characters
    refNameOrCommit = refInfo.name.slice(0, 7)
  }

  return (
    <RefSelector
      currentCommitish={refNameOrCommit}
      defaultBranch={repo.defaultBranch}
      owner={repo.ownerLogin}
      repo={repo.name}
      canCreate={repo.currentUserCanPush}
      cacheKey={refInfo.listCacheKey}
      selectedRefType={refInfo.refType === 'tree' ? 'branch' : refInfo.refType}
      getHref={refName => `${repositoryTreePath({repo, commitish: refName, action, path})}${window.location.search}`}
      hotKey={refSelectorShortcut.hotkey}
      onBeforeCreate={refName => sendRepoClickEvent('REF_SELECTOR_MENU.CREATE_BRANCH', {['ref_name']: refName})}
      onCreateError={onCreateError}
      onOpenChange={open => open && sendRepoClickEvent('REF_SELECTOR_MENU')}
      size={size}
      buttonClassName={buttonClassName}
      allowResizing={allowResizing}
      idEnding={idEnding || 'repos-header-ref-selector'}
      useFocusZone={true}
    />
  )
}

try{ ReposHeaderRefSelector.displayName ||= 'ReposHeaderRefSelector' } catch {}