import {Box} from '@primer/react'
import {Fragment, type PropsWithChildren, type ReactElement} from 'react'

import type {Author} from './commit-attribution-types'
import {AuthorsDialog} from './components/AuthorsDialog'
import {CommitAuthorStack} from './components/CommitAuthorStack'
import {AuthorLink} from './components/AuthorLink'
import type {Repository} from '@github-ui/current-repository'
import {AuthorAvatar} from './components/AuthorAvatar'
import {AuthorSettingsProvider, type AuthorSettings} from './contexts/AuthorSettingsContext'

export interface CommitAttributionProps {
  authors: Author[]
  committer: Author
  committerAttribution: boolean
  includeVerbs: boolean
  repo: Repository
  authorSettings?: Partial<AuthorSettings>
}

function SingleAuthor({author, repo}: {author: Author; repo: Repository}) {
  return <AuthorAvatar author={author} repo={repo} />
}

function AuthorAndCommitter({author, committer, repo}: {author: Author; committer: Author; repo: Repository}) {
  return (
    <>
      <CommitAuthorStack authors={[author, committer]} />
      <AuthorLink author={author} repo={repo} sx={{pl: 1}} />
    </>
  )
}

function TwoAuthors({authors, repo}: {authors: Author[]; repo: Repository}) {
  return (
    <>
      <CommitAuthorStack authors={authors} />
      {authors.map((author, index) => (
        <Fragment key={`${author.login}_${index}`}>
          <AuthorLink author={author} repo={repo} sx={{pl: 1}} />
          {index !== authors.length - 1 && <span className="pl-1">and</span>}
        </Fragment>
      ))}
    </>
  )
}

function MultipleAuthors({authors, repo}: {authors: Author[]; repo: Repository}) {
  return (
    <>
      <CommitAuthorStack authors={authors} />
      <AuthorsDialog authors={authors} repo={repo} />
    </>
  )
}

export function CommitAttribution({
  authors,
  committer,
  committerAttribution,
  repo,
  children,
  includeVerbs = true,
  authorSettings,
}: PropsWithChildren<CommitAttributionProps>) {
  const singleAuthor = authors.length === 1 && !committerAttribution
  const authorAndCommitter = authors.length === 1 && committerAttribution
  const inlineAuthorNames = authors.length === 2 && !committerAttribution
  const multipleAuthors = !singleAuthor && !authorAndCommitter && !inlineAuthorNames

  const verbSx = includeVerbs ? {pl: 1} : {}

  return (
    <Box
      sx={{display: 'flex', flexDirection: 'row', flexWrap: ['wrap', 'wrap', 'wrap', 'nowrap'], alignItems: 'center'}}
    >
      <AuthorSettingsProvider authorSettings={authorSettings}>
        {singleAuthor && <SingleAuthor author={authors[0]!} repo={repo} />}
        {authorAndCommitter && <AuthorAndCommitter author={authors[0]!} committer={committer} repo={repo} />}
        {inlineAuthorNames && <TwoAuthors authors={authors} repo={repo} />}
        {multipleAuthors && <MultipleAuthors authors={authors} repo={repo} />}

        {!committerAttribution ? (
          <Box as="span" sx={verbSx}>
            {includeVerbs && 'committed'}
          </Box>
        ) : (
          <>
            <span className="pl-1">{includeVerbs ? 'authored and' : 'and'}</span>
            <AuthorLink author={committer} repo={repo} sx={{pl: 1}} />
            <Box as="span" sx={verbSx}>
              {includeVerbs && 'committed'}
            </Box>
          </>
        )}

        {children}
      </AuthorSettingsProvider>
    </Box>
  )
}

try{ SingleAuthor.displayName ||= 'SingleAuthor' } catch {}
try{ AuthorAndCommitter.displayName ||= 'AuthorAndCommitter' } catch {}
try{ TwoAuthors.displayName ||= 'TwoAuthors' } catch {}
try{ MultipleAuthors.displayName ||= 'MultipleAuthors' } catch {}
try{ CommitAttribution.displayName ||= 'CommitAttribution' } catch {}