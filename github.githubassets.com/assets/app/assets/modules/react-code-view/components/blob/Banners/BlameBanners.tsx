import type {Blame, FileBlobPagePayload, FilePagePayload} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {blobPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {InfoIcon, XIcon} from '@primer/octicons-react'
import {Box, Flash, Octicon, Text} from '@primer/react'
import React from 'react'

import {CurrentBlameProvider, useCurrentBlame} from '../../../hooks/CurrentBlame'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import {assertNever} from '../../../utilities/assert-never'

export function BlameBanners() {
  const payload = useRoutePayload<FilePagePayload>()
  const blame = 'blame' in payload ? (payload as FileBlobPagePayload).blame : undefined
  return (
    <CurrentBlameProvider blame={blame}>
      <BlameErrorBanner />
      <IgnoreRevsBanner />
    </CurrentBlameProvider>
  )
}

function BlameErrorBanner() {
  const repo = useCurrentRepository()
  const refName = useFilesPageInfo().refInfo.name
  const blame = useCurrentBlame()
  const [shouldDisplay, setShouldDisplay] = React.useState(true)

  if (!blame) return null

  const ignoreRefsInfo = blame?.ignoreRevs
  const blameErrorType = blame?.errorType
  if (!blameErrorType) return null

  const renderIgnoreRefsLink = () => (
    <Link
      to={blobPath({
        repo: repo.name,
        owner: repo.ownerLogin,
        commitish: refName,
        filePath: ignoreRefsInfo.path,
      })}
    >
      {ignoreRefsInfo.path}
    </Link>
  )

  return (
    <>
      {shouldDisplay && (
        <Flash variant="warning" sx={{mt: 3}}>
          <Octicon icon={InfoIcon} />
          <BlameErrorText blameErrorType={blameErrorType} renderIgnoreRefsLink={renderIgnoreRefsLink} />
          <Box sx={{float: 'right', cursor: 'pointer'}} onClick={() => setShouldDisplay(false)}>
            <Octicon icon={XIcon} />
          </Box>
        </Flash>
      )}
    </>
  )
}

function BlameErrorText({
  blameErrorType,
  renderIgnoreRefsLink,
}: {
  blameErrorType: NonNullable<Blame['errorType']>
  renderIgnoreRefsLink: () => JSX.Element
}) {
  switch (blameErrorType) {
    case 'invalid_ignore_revs':
      return <Text>Your {renderIgnoreRefsLink()} file is invalid.</Text>
    case 'ignore_revs_too_big':
      return <Text>Your {renderIgnoreRefsLink()} file is too large.</Text>
    case 'symlink_disallowed':
      return <Text>Symlinks are not supported.</Text>
    case 'blame_timeout':
      return <Text>Your blame took too long to compute.</Text>
    default:
      assertNever(blameErrorType)
  }
}

function IgnoreRevsBanner() {
  const repo = useCurrentRepository()
  const refName = useFilesPageInfo().refInfo.name
  const ignoreRefsInfo = useCurrentBlame()?.ignoreRevs
  const [shouldDisplay, setShouldDisplay] = React.useState(true)

  if (!ignoreRefsInfo?.present) return null

  const ignoreRefsLink = (
    <Link
      to={blobPath({
        repo: repo.name,
        owner: repo.ownerLogin,
        commitish: refName,
        filePath: ignoreRefsInfo.path,
      })}
    >
      {ignoreRefsInfo.path}
    </Link>
  )

  return (
    <>
      {shouldDisplay && (
        <Flash sx={{mt: 3}}>
          <Octicon icon={InfoIcon} />
          {ignoreRefsInfo.timedOut ? (
            <Text>Failed to ignore revisions in {ignoreRefsLink}.</Text>
          ) : (
            <Text>Ignoring revisions in {ignoreRefsLink}.</Text>
          )}
          <Box sx={{float: 'right', cursor: 'pointer'}} onClick={() => setShouldDisplay(false)}>
            <Octicon icon={XIcon} />
          </Box>
        </Flash>
      )}
    </>
  )
}

try{ BlameBanners.displayName ||= 'BlameBanners' } catch {}
try{ BlameErrorBanner.displayName ||= 'BlameErrorBanner' } catch {}
try{ BlameErrorText.displayName ||= 'BlameErrorText' } catch {}
try{ IgnoreRevsBanner.displayName ||= 'IgnoreRevsBanner' } catch {}