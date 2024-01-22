import type {Repository} from '@github-ui/current-repository'
import {commitsByAuthor} from '@github-ui/paths'
import {Box, type BoxProps, Link, Text} from '@primer/react'
import type {Author} from '../commit-attribution-types'
import {AuthorTooltip} from './AuthorTooltip'
import {useAuthorSettings} from '../contexts/AuthorSettingsContext'

export interface AuthorAvatarProps {
  author: Author | undefined
  repo: Repository
  sx?: BoxProps['sx']
}

/**
 * Renders the author of a commit.
 */
export function AuthorLink({author, repo, sx = {}}: AuthorAvatarProps) {
  const authorSettings = useAuthorSettings()

  if (!author) return null

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', ...sx}} data-testid="author-link">
      {author.login ? (
        <AuthorTooltip author={author} renderTooltip={authorSettings.includeTooltip}>
          <Link
            muted
            href={commitsByAuthor({repo, author: author.login})}
            aria-label={`commits by ${author.login}`}
            sx={{
              fontWeight: authorSettings.fontWeight,
              whiteSpace: 'nowrap',
              color: authorSettings.fontColor,
              '&:hover': {color: authorSettings.fontColor, textDecoration: 'underline'},
            }}
          >
            {author.login}
          </Link>
        </AuthorTooltip>
      ) : (
        <Text sx={{fontWeight: authorSettings.fontWeight, whiteSpace: 'nowrap', color: authorSettings.fontColor}}>
          {author.displayName}
        </Text>
      )}
    </Box>
  )
}

try{ AuthorLink.displayName ||= 'AuthorLink' } catch {}