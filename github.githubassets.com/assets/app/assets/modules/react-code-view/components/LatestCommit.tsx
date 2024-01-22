import {AuthorAvatar, CommitAttribution} from '@github-ui/commit-attribution'
import {useCurrentRepository} from '@github-ui/current-repository'
import {commitHovercardPath, commitsPath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import type {CommitWithStatus} from '@github-ui/repos-types'
import {SafeHTMLText} from '@github-ui/safe-html'
import {useLatestCommit} from '@github-ui/use-latest-commit'
import {AlertFillIcon, EllipsisIcon, HistoryIcon} from '@primer/octicons-react'
import {
  Box,
  type ButtonProps,
  IconButton,
  Link as PrimerLink,
  LinkButton,
  Octicon,
  RelativeTime,
  Text,
  Tooltip,
} from '@primer/react'
import {type PropsWithChildren, useState} from 'react'

import {ReposChecksStatusBadge} from '../../react-shared/Repos/ReposChecksStatusBadge'
import {ScreenReaderHeading} from '../../react-shared/ScreenReaderHeading'
import {SkeletonText} from '../../react-shared/Skeleton'
import {useFilesPageInfo} from '../hooks/FilesPageInfo'
import {useReposAnalytics} from '../hooks/use-repos-analytics'
import {linkButtonSx} from '../utilities/styles'

export function LatestCommitSingleLine({commitCount}: {commitCount?: string}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 6,
        mb: 3,
      }}
    >
      <LatestCommitContent commitCount={commitCount} />
    </Box>
  )
}

export function LatestCommitContent({commitCount}: {commitCount?: string}) {
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const [latestCommit, loading, error] = useLatestCommit(repo.ownerLogin, repo.name, refInfo.name, path)
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          // Min width is set to 273px to prevent the blob content from being too narrow.
          // Supports a min screen size of 320px without introducing any horizontal scrollbars.
          minWidth: '273px',
          pr: 2,
          pl: 3,
          py: 2,
        }}
      >
        <ScreenReaderHeading as="h2" text="Latest commit" />
        {error ? (
          <CommitErrorMessage />
        ) : loading ? (
          <SkeletonText width={120} data-testid="loading" />
        ) : latestCommit ? (
          <CommitSummary commit={latestCommit} detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} />
        ) : null}
        <HistoryLink
          commit={latestCommit}
          commitCount={commitCount}
          detailsOpen={detailsOpen}
          setDetailsOpen={setDetailsOpen}
        />
      </Box>
      {detailsOpen && latestCommit && (
        <Box sx={{display: latestCommit.bodyMessageHtml ? 'flex' : ['flex', 'none', 'none']}}>
          <CommitDetails commit={latestCommit} />
        </Box>
      )}
    </>
  )
}

function CommitErrorMessage() {
  return (
    <Text sx={{color: 'attention.fg'}} data-testid="latest-commit-error-message">
      <Octicon icon={AlertFillIcon} />
      &nbsp;Cannot retrieve latest commit at this time.
    </Text>
  )
}

function CommitSummary({
  commit,
  detailsOpen,
  setDetailsOpen,
}: {
  commit: CommitWithStatus
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
}) {
  const repo = useCurrentRepository()
  const dataUrl = `data-hovercard-url=${commitHovercardPath({
    owner: repo.ownerLogin,
    repo: repo.name,
    commitish: commit.oid,
  })} `
  const shortMessageHtmlLink = getProperHovercardsOnCommitMessage(commit.shortMessageHtmlLink, dataUrl)

  return (
    <Box
      sx={{
        display: 'flex',
        minWidth: 0,
        fontSize: 1,
        alignItems: 'center',
        width: 'max-content',
        gap: 2,
        flexBasis: 0,
        flexGrow: 1,
      }}
      data-testid="latest-commit"
    >
      {commit.authors && commit.authors.length > 0 ? (
        <CommitAttribution
          authors={commit.authors}
          repo={repo}
          includeVerbs={false}
          committer={commit.committer!}
          committerAttribution={commit.committerAttribution!}
        />
      ) : (
        <AuthorAvatar author={commit.author} repo={repo} />
      )}
      <Box className="react-last-commit-message" sx={{alignItems: 'center', minWidth: 0, gap: 2}}>
        <Box
          className="Truncate"
          sx={{
            fontSize: 1,
            alignItems: 'center',
          }}
        >
          {commit.shortMessageHtmlLink && (
            <SafeHTMLText
              className="Truncate-text"
              data-testid="latest-commit-html"
              unverifiedHTML={shortMessageHtmlLink}
            />
          )}
        </Box>
        {commit.bodyMessageHtml && <CommitDetailsButton detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} />}
        <ReposChecksStatusBadge oid={commit.oid} status={commit.status} />
      </Box>
      <Text className="react-last-commit-summary-timestamp" sx={{color: 'fg.muted', fontSize: 0}}>
        <RelativeTime datetime={commit.date} tense="past" />
      </Text>
    </Box>
  )
}

function HistoryLink({
  commit,
  commitCount,
  detailsOpen,
  setDetailsOpen,
}: {
  commit?: CommitWithStatus | null
  commitCount?: string
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
}) {
  const abbreviatedOid = commit?.oid.slice(0, 7)

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center'}} data-testid="latest-commit-details">
        {commit && (
          <>
            <Text className="react-last-commit-oid-timestamp" sx={{color: 'fg.muted', fontSize: 0}}>
              <PrimerLink as={Link} to={commit.url} className="Link--secondary" aria-label={`Commit ${abbreviatedOid}`}>
                {abbreviatedOid}
              </PrimerLink>
              &nbsp;·&nbsp;
              <RelativeTime datetime={commit.date} tense="past" />
            </Text>
            <Text className="react-last-commit-timestamp" sx={{color: 'fg.muted', fontSize: 0}}>
              <RelativeTime datetime={commit.date} tense="past" />
            </Text>
          </>
        )}
      </Box>
      <ScreenReaderHeading as="h2" text="History" />
      <HistoryLinkButton className="react-last-commit-history-group" size="small" leadingVisual={HistoryIcon}>
        <Text sx={{color: 'fg.default'}}>{commitCount ? `${commitCount} Commits` : 'History'}</Text>
      </HistoryLinkButton>
      <Box sx={{display: ['inherit', 'none', 'none']}}>
        {(commit?.shortMessageHtmlLink || commit?.bodyMessageHtml) && (
          <CommitDetailsButton detailsOpen={detailsOpen} setDetailsOpen={setDetailsOpen} useMediumButton={true} />
        )}
      </Box>
      <Tooltip aria-label="Commit history">
        <HistoryLinkButton className="react-last-commit-history-icon" leadingVisual={HistoryIcon} />
      </Tooltip>
    </Box>
  )
}

function HistoryLinkButton({
  children,
  className,
  leadingVisual,
  size,
}: PropsWithChildren<Pick<ButtonProps, 'className' | 'size' | 'leadingVisual'>>) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const {refInfo, path} = useFilesPageInfo()
  const repo = useCurrentRepository()

  return (
    <LinkButton
      className={className}
      sx={{
        alignItems: 'center',
        color: 'fg.default',
        ...linkButtonSx,
      }}
      onClick={() => sendRepoClickEvent('HISTORY_BUTTON')}
      href={commitsPath({
        owner: repo.ownerLogin,
        repo: repo.name,
        ref: refInfo.name,
        path,
      })}
      variant="invisible"
      size={size}
      leadingVisual={leadingVisual}
    >
      {children}
    </LinkButton>
  )
}

function CommitDetailsButton({
  detailsOpen,
  setDetailsOpen,
  useMediumButton,
}: {
  detailsOpen: boolean
  setDetailsOpen: (open: boolean) => void
  useMediumButton?: boolean
}) {
  return (
    <IconButton
      aria-label="Open commit details"
      icon={EllipsisIcon}
      sx={{color: 'fg.muted', minWidth: '28px'}}
      onClick={() => setDetailsOpen(!detailsOpen)}
      variant="invisible"
      aria-pressed={detailsOpen}
      aria-expanded={detailsOpen}
      data-testid="latest-commit-details-toggle"
      size={useMediumButton ? 'medium' : 'small'}
    />
  )
}

function CommitDetails({commit}: {commit: CommitWithStatus}) {
  const abbreviatedOid = commit?.oid.slice(0, 7)
  return (
    <Box
      sx={{
        backgroundColor: 'canvas.subtle',
        borderTop: '1px solid',
        borderColor: 'border.default',
        borderRadius: '0px 0px 6px 6px',
        px: 3,
        py: 2,
        flexGrow: 1,
      }}
    >
      <Box sx={{display: ['flex', 'none', 'none'], flexDirection: 'column'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', minWidth: 0, gap: 2, alignItems: 'center'}}>
          {commit.shortMessageHtmlLink && (
            <SafeHTMLText
              className="Truncate-text"
              data-testid="latest-commit-html"
              html={commit.shortMessageHtmlLink}
              // This link is auto formatted to be fg.muted. Which is great normally but not for this spot
              sx={{'> a': {color: 'var(--fgColor-default, var(--color-fg-default)) !important'}}}
            />
          )}
          <ReposChecksStatusBadge oid={commit.oid} status={commit.status} />
        </Box>
        <PrimerLink as={Link} to={commit.url} className="Link--secondary" aria-label={`Commit ${abbreviatedOid}`}>
          {abbreviatedOid}
        </PrimerLink>
        {commit.bodyMessageHtml && <br />}
      </Box>
      {commit.bodyMessageHtml && (
        <Box sx={{mt: [2, 0, 0], color: 'fg.muted'}}>
          <SafeHTMLText
            className="Truncate-text"
            data-testid="latest-commit-html"
            html={commit.bodyMessageHtml}
            sx={{whiteSpace: 'pre-wrap'}}
          />
        </Box>
      )}
    </Box>
  )
}

function getProperHovercardsOnCommitMessage(shortMessageHtmlLink: string | undefined, dataUrl: string) {
  // eslint-disable-next-line github/unescaped-html-literal
  const separator = '<a '
  let shortMessage = ''
  if (shortMessageHtmlLink) {
    const split = shortMessageHtmlLink.split(separator)
    for (const part of split) {
      if (part === '') {
        continue
      }
      if (part.includes('data-hovercard-url')) {
        shortMessage = shortMessage.concat(separator, part)
        continue
      }
      shortMessage = shortMessage.concat(...[separator, dataUrl, part])
    }
  }

  return shortMessage
}

try{ LatestCommitSingleLine.displayName ||= 'LatestCommitSingleLine' } catch {}
try{ LatestCommitContent.displayName ||= 'LatestCommitContent' } catch {}
try{ CommitErrorMessage.displayName ||= 'CommitErrorMessage' } catch {}
try{ CommitSummary.displayName ||= 'CommitSummary' } catch {}
try{ HistoryLink.displayName ||= 'HistoryLink' } catch {}
try{ HistoryLinkButton.displayName ||= 'HistoryLinkButton' } catch {}
try{ CommitDetailsButton.displayName ||= 'CommitDetailsButton' } catch {}
try{ CommitDetails.displayName ||= 'CommitDetails' } catch {}