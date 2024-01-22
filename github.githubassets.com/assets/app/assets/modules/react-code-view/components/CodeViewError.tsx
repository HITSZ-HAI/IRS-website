import {useCurrentRepository} from '@github-ui/current-repository'
import {repoDefaultBrachUrl, repoOverviewUrl} from '@github-ui/paths'
import type {PageError} from '@github-ui/react-core/app-routing-types'
import {AlertIcon} from '@primer/octicons-react'
import {Box, BranchName, Link, LinkButton, Octicon, Text} from '@primer/react'

import {useFilesPageInfo} from '../hooks/FilesPageInfo'
import {linkButtonSx} from '../utilities/styles'

export function CodeViewError(error: PageError) {
  const repo = useCurrentRepository()
  const {refInfo} = useFilesPageInfo()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        margin: 16,
      }}
    >
      <Box
        sx={{
          border: '1px solid var(--borderColor-default, var(--color-border-default))',
          borderRadius: '6px',
          padding: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Octicon icon={AlertIcon} sx={{color: 'fg.muted', mb: 2}} size={20} />
        <ErrorText {...error} />
        <LinkButton
          type="button"
          sx={{
            mt: 4,
            ...linkButtonSx,
          }}
          variant="primary"
          aria-label={refInfo.currentOid ? 'go to Overview' : 'go to default branch'}
          href={refInfo.currentOid ? repoOverviewUrl(repo) : repoDefaultBrachUrl(repo)}
        >
          {refInfo.currentOid ? 'Return to the repository overview' : 'Go to default branch'}
        </LinkButton>
      </Box>
    </Box>
  )
}

function ErrorText({httpStatus, type}: PageError) {
  const title = httpStatus === 404 ? '404 - page not found' : 'Error loading page'

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, textAlign: 'center'}}>
      <Box sx={{fontSize: 4, color: 'fg.default', fontWeight: 'bold'}}>{title}</Box>

      {httpStatus === 404 ? <DescriptionText404 /> : <DefaultDescriptionText httpStatus={httpStatus} type={type} />}
    </Box>
  )
}

function DescriptionText404() {
  const repo = useCurrentRepository()
  const {path, refInfo} = useFilesPageInfo()

  if (!refInfo.currentOid) {
    return (
      <Box
        sx={{color: 'fg.muted', display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}
        data-testid="error-404-description"
      >
        Cannot find a valid ref in&nbsp;
        <BranchName as="p" sx={{mb: 0}}>
          {refInfo.name}
        </BranchName>
      </Box>
    )
  }

  return (
    <Box
      sx={{color: 'fg.muted', display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}
      data-testid="eror-404-description"
    >
      The&nbsp;
      <BranchName as="p" sx={{mb: 0}}>
        {refInfo.name}
      </BranchName>
      &nbsp;branch of&nbsp;
      <Text as="p" sx={{fontWeight: 'bold', mb: 0}}>
        {repo.name}
      </Text>
      &nbsp;does not contain the path&nbsp;
      <Text as="p" sx={{fontWeight: 'bold', mb: 0}}>
        {path}.
      </Text>
    </Box>
  )
}

function DefaultDescriptionText({httpStatus, type}: {httpStatus?: number; type?: string}) {
  const errorNumberText = httpStatus ? ` ${httpStatus} error` : 'error'

  if (type === 'fetchError') {
    return (
      <Box sx={{fontSize: 1, color: 'fg.muted'}} data-testid="fetch-error-description">
        It looks like your internet connection is down. Please check it.
      </Box>
    )
  }

  return (
    <Box sx={{fontSize: 1, color: 'fg.muted'}} data-testid="default-error-description">
      An unexpected {errorNumberText} occured. Try
      <Link onClick={() => window.location.reload()} key="reload-page">
        &nbsp;reloading the page.
      </Link>
    </Box>
  )
}

try{ CodeViewError.displayName ||= 'CodeViewError' } catch {}
try{ ErrorText.displayName ||= 'ErrorText' } catch {}
try{ DescriptionText404.displayName ||= 'DescriptionText404' } catch {}
try{ DefaultDescriptionText.displayName ||= 'DefaultDescriptionText' } catch {}