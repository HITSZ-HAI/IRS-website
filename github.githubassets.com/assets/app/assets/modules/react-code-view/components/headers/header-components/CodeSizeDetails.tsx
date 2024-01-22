import type {Blame, CodeOwnerInfo} from '@github-ui/code-view-types'
import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {blamePath, blobPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import type {RefInfo} from '@github-ui/repos-types'
import {QuestionIcon, ShieldLockIcon} from '@primer/octicons-react'
import {Box, Link as PrimerLink, Octicon, Text, Tooltip, Truncate} from '@primer/react'

import {useDeferredMetadata} from '../../../contexts/DeferredMetadataContext'
import {useCurrentBlame} from '../../../hooks/CurrentBlame'
import {useCurrentBlob} from '../../../hooks/CurrentBlob'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'

export default function CodeSizeDetails({className}: {className?: string}) {
  const {codeownerInfo} = useDeferredMetadata()
  const payload = useCurrentBlob()
  const {path, refInfo} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const blame = useCurrentBlame()

  const {
    headerInfo: {
      blobSize,
      gitLfsPath,
      lineInfo: {truncatedLoc, truncatedSloc},
      mode,
    },
    viewable,
    rawLines,
  } = payload

  const symlinkUrl = mode === 'symbolic link' ? getSymlinkUrl({rawLines, blame, repo, refInfo, path}) : undefined

  return (
    <Box className={className} sx={{alignItems: 'center'}}>
      {codeownerInfo && <CodeOwnersBadge codeownerInfo={codeownerInfo} />}
      <Box sx={{fontSize: 0, flex: 'auto', pr: 3, color: 'fg.muted', minWidth: 0}} className="text-mono">
        {mode !== 'file' && !symlinkUrl && (
          <>
            <Truncate title={mode} inline sx={{ml: 1, mr: 2, textTransform: 'capitalize'}}>
              <Text>{mode}</Text>
            </Truncate>
            {viewable && <Text sx={{color: 'fg.muted', mr: 1}}>·</Text>}
          </>
        )}
        {viewable ? (
          <>
            {symlinkUrl && (
              <>
                <PrimerLink as={Link} muted to={symlinkUrl} sx={{ml: 1, mr: 2}}>
                  Symbolic Link
                </PrimerLink>
                <Text sx={{color: 'fg.muted', mr: 1}}>·</Text>
              </>
            )}
            <Truncate title={blobSize} inline sx={{maxWidth: '100%'}} data-testid="blob-size">
              <Text>{`${truncatedLoc} lines (${truncatedSloc} loc) · ${blobSize}`}</Text>
            </Truncate>
          </>
        ) : (
          <Text>{blobSize}</Text>
        )}
        {gitLfsPath && (
          <>
            <Text className="file-info-divider" />
            <PrimerLink muted href={gitLfsPath} aria-label="Learn more about Git LFS" sx={{ml: 2}}>
              <Octicon icon={QuestionIcon} />
            </PrimerLink>
            <Text> Stored with Git LFS</Text>
          </>
        )}
      </Box>
    </Box>
  )
}

function CodeOwnersBadge({
  codeownerInfo: {codeownerPath, ownedByCurrentUser, ownersForFile, ruleForPathLine},
}: {
  codeownerInfo: CodeOwnerInfo
}) {
  if (!(ownedByCurrentUser || ownersForFile)) {
    return null
  }
  const tooltipAriaLabel = getCodeownersText(ownedByCurrentUser, ownersForFile, ruleForPathLine)
  const sx = ownedByCurrentUser ? {color: 'var(--fgColor-accent, var(--color-accent-fg))'} : {}

  return (
    <Tooltip id="codeowners-tooltip" aria-label={tooltipAriaLabel}>
      {codeownerPath ? (
        <PrimerLink aria-labelledby="codeowners-tooltip" href={codeownerPath} muted={!ownedByCurrentUser} sx={{...sx}}>
          <Octicon icon={ShieldLockIcon} sx={{mr: 2, mt: 1}} />
        </PrimerLink>
      ) : (
        <Octicon icon={ShieldLockIcon} sx={{mr: 2, mt: 1, ...sx}} />
      )}
    </Tooltip>
  )
}

function getCodeownersText(
  ownedByCurrentUser: boolean | null,
  ownersForFile: string | null,
  ruleForPathLine: string | null,
) {
  let tooltipAriaLabel = 'Owned by '
  if (ownedByCurrentUser) {
    tooltipAriaLabel += 'you'
    if (ownersForFile) {
      tooltipAriaLabel += ' along with '
    }
  }
  tooltipAriaLabel += ownersForFile
  if (ruleForPathLine) {
    tooltipAriaLabel += ` (from CODEOWNERS line ${ruleForPathLine})`
  }

  return tooltipAriaLabel
}

function getSymlinkUrl({
  rawLines,
  blame,
  repo,
  refInfo,
  path: currentPath,
}: {
  rawLines: string[] | null
  blame: Blame | undefined
  repo: Repository
  refInfo: RefInfo
  path: string
}) {
  if (!rawLines || !rawLines[0]) {
    return null
  }

  // if the symlink is absolute, we just use it from the root of the repo (ie - `foo/bar`)
  // if the symlink is relative, we need to combine it with the current path to build the right path to the linked file
  // e.g. if the symlink is `../foo/bar` and the current path is `baz/current_file`, the url should be `baz/../foo/bar`
  // this logic makes sure that we don't relative path out of base blob `[nwo]/[blob]/[ref]` url
  let filePath = rawLines[0]

  if (filePath.startsWith('../') || filePath.startsWith('./')) {
    // needs an extra ../ to get to the current file's directory where the symlink was created
    filePath = `${currentPath}/../${filePath}`
  }

  const params = {
    owner: repo.ownerLogin,
    repo: repo.name,
    commitish: refInfo.name,
    filePath,
  }

  return blame ? blamePath(params) : blobPath(params)
}

try{ CodeSizeDetails.displayName ||= 'CodeSizeDetails' } catch {}
try{ CodeOwnersBadge.displayName ||= 'CodeOwnersBadge' } catch {}