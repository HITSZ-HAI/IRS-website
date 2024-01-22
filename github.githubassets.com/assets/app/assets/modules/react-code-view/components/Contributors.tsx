import {useCurrentRepository} from '@github-ui/current-repository'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {commitsPathByAuthor, userHovercardPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import type {ContributorUser} from '@github-ui/repos-types'
import {useContributors} from '@github-ui/use-contributors'
import {AlertFillIcon, PeopleIcon} from '@primer/octicons-react'
import {ActionList, AvatarStack, Box, CounterLabel, Link as PrimerLink, Octicon, Text, Truncate} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useState} from 'react'

import {SkeletonText} from '../../react-shared/Skeleton'
import {useFilesPageInfo} from '../hooks/FilesPageInfo'
import {useReposAnalytics} from '../hooks/use-repos-analytics'

export function ContributorAvatars({showTitle = true}: {showTitle?: boolean}) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const {contributors, loading, error} = useContributors(repo.ownerLogin, repo.name, refInfo.name, path)

  const maxAvatarCount = 10
  if (error) {
    return <ContributorsError />
  }

  if (loading) {
    return <SkeletonText width={100} data-testid="contributors-skeleton" />
  }

  if (!contributors || !contributors?.users.length) {
    return null
  }

  const {users, totalCount} = contributors
  const countTitle = getCountWithUnit(totalCount, ' contributor', 'contributors')

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <Box sx={{display: 'flex', flexDirection: 'row'}}>
        <AvatarStack>
          {users.slice(0, maxAvatarCount).map((user, index) => (
            <GitHubAvatar
              className={index > 5 ? 'AvatarShowLarge' : 'AvatarShowMedium'}
              key={user.login}
              src={user.primaryAvatarUrl}
              alt={user.login}
              data-testid="contributor-avatar"
              data-hovercard-url={userHovercardPath({owner: user.login})}
            />
          ))}
        </AvatarStack>
      </Box>

      <PrimerLink
        as="button"
        aria-label={`Show ${countTitle}"`}
        onClick={() => {
          setDialogOpen(true)
          sendRepoClickEvent('CONTRIBUTORS.LIST.OPEN')
        }}
        data-testid="contributors-count-button"
        sx={{ml: 2, color: 'fg.default'}}
      >
        <Octicon icon={PeopleIcon} />
        {showTitle && (
          <Text className="react-contributors-title" sx={{mx: 1, fontSize: 0}}>
            Contributors
          </Text>
        )}
        <CounterLabel sx={{mx: 1, px: 2, py: 1}}>{totalCount}</CounterLabel>
      </PrimerLink>

      {isDialogOpen && (
        <Dialog
          title={countTitle}
          onClose={() => setDialogOpen(false)}
          width="medium"
          height={contributors.totalCount >= 12 ? 'small' : 'auto'}
          renderBody={() => {
            return (
              <ActionList sx={{overflowY: 'auto', py: 2}} data-testid="contributor-dialog-list">
                {users.map(user => (
                  <ContributorRow key={user.login} user={user} />
                ))}
              </ActionList>
            )
          }}
        />
      )}
    </Box>
  )
}

function ContributorRow({user}: {user: ContributorUser}) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const {path, refInfo} = useFilesPageInfo()
  const repo = useCurrentRepository()

  return (
    <ActionList.Item
      sx={{
        display: 'flex',
        flexDirection: 'row',
        fontSize: 1,
        py: 2,
        color: 'fg.default',
        '&:hover': {backgroundColor: 'canvas.subtle'},
      }}
      data-testid="contributor-dialog-row"
      onClick={() => sendRepoClickEvent('CONTRIBUTORS.LIST.USER')}
    >
      <PrimerLink
        as={Link}
        sx={{flex: 1}}
        muted
        to={user.profileLink}
        onClick={() => sendRepoClickEvent('CONTRIBUTORS.LIST.USER')}
      >
        <GitHubAvatar src={user.primaryAvatarUrl} alt={user.login} sx={{mr: 2}} aria-hidden="true" />
        <Truncate inline title={user.login}>
          {user.login}
        </Truncate>
      </PrimerLink>
      <ActionList.TrailingVisual>
        <PrimerLink
          as={Link}
          muted
          to={commitsPathByAuthor({repo, branch: refInfo.name, path, author: user.login})}
          onClick={() => sendRepoClickEvent('CONTRIBUTORS.LIST.COMMITS')}
          aria-label={`${getCountWithUnit(user.commitsCount, 'commit', 'commits')} by ${user.login}`}
          data-testid="commit-link"
        >
          {getCountWithUnit(user.commitsCount, 'commit', 'commits')}
        </PrimerLink>
      </ActionList.TrailingVisual>
    </ActionList.Item>
  )
}

function getCountWithUnit(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function ContributorsError() {
  return (
    <Text sx={{color: 'danger.fg'}}>
      <Octicon icon={AlertFillIcon} />
      &nbsp;Cannot retrieve contributors info at this time.
    </Text>
  )
}

try{ ContributorAvatars.displayName ||= 'ContributorAvatars' } catch {}
try{ ContributorRow.displayName ||= 'ContributorRow' } catch {}
try{ ContributorsError.displayName ||= 'ContributorsError' } catch {}