import type {Repository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {CheckIcon, CopyIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, Link as PrimerLink, Text} from '@primer/react'
import {type MouseEventHandler, useCallback, useMemo, useRef, useState} from 'react'

// eslint-disable-next-line no-restricted-imports
import {copyText} from '../github/command-palette/copy'
import {useAlertTooltip} from './hooks/use-alert-tooltip'
import {ScreenReaderHeading} from './ScreenReaderHeading'

const separatorCharacter = '/'

interface BreadcrumbProps {
  id?: string
  fileNameId?: string
  commitish: string
  path: string
  repo: Repository
  isFolder: boolean
  fontSize?: number
  showCopyPathButton?: boolean
}

export function Breadcrumb({
  id = 'breadcrumb',
  fileNameId,
  path,
  repo,
  commitish,
  isFolder,
  fontSize,
  showCopyPathButton,
}: BreadcrumbProps) {
  const {fileName, segments} = useMemo(() => getPathSegmentData(path), [path])
  const isRoot = !path

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        fontSize: fontSize ?? 2,
        minWidth: 0,
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: '100%',
        alignItems: 'center',
      }}
    >
      <Box as="nav" data-testid="breadcrumbs" aria-labelledby={`${id}-heading`} id={id} sx={{maxWidth: '100%'}}>
        <ScreenReaderHeading id={`${id}-heading`} as="h2" text="Breadcrumbs" />

        <Box as="ol" sx={{maxWidth: '100%', listStyle: 'none', display: 'inline-block'}}>
          <Box as="li" sx={{display: 'inline-block', maxWidth: '100%'}}>
            <RepoLink repo={repo} commitish={commitish} />
          </Box>
          {segments.map(({directoryName, directoryPath}) => (
            <Box as="li" sx={{display: 'inline-block', maxWidth: '100%'}} key={directoryPath}>
              <Separator fontSize={fontSize} />
              {directoryName ? (
                <DirectoryLink path={directoryPath} directoryName={directoryName} repo={repo} commitish={commitish} />
              ) : null}
            </Box>
          ))}
        </Box>
      </Box>
      {fileName && (
        <Box data-testid="breadcrumbs-filename" sx={{display: 'inline-block', maxWidth: '100%'}} key={fileName}>
          <Separator fontSize={fontSize} />

          <FileName value={fileName} id={fileNameId} fontSize={fontSize} />

          {!isRoot && isFolder && <Separator />}
        </Box>
      )}
      {showCopyPathButton && <CopyPathButton path={path} />}
    </Box>
  )
}

function RepoLink({repo, commitish}: {repo: Repository; commitish: string}) {
  return (
    <PrimerLink
      as={Link}
      sx={{fontWeight: 'bold'}}
      to={repositoryTreePath({repo, commitish, action: 'tree'})}
      data-testid="breadcrumbs-repo-link"
      reloadDocument
    >
      {repo.name}
    </PrimerLink>
  )
}
interface DirectoryLinkProps {
  commitish: string
  directoryName: string
  path: string
  repo: Repository
}

function DirectoryLink({directoryName, path, repo, commitish}: DirectoryLinkProps) {
  return (
    <PrimerLink as={Link} to={repositoryTreePath({repo, commitish, path, action: 'tree'})} sx={{fontWeight: 400}}>
      {directoryName}
    </PrimerLink>
  )
}

export function Separator({fontSize}: {fontSize?: number}) {
  return (
    <Text sx={{px: 1, fontWeight: 400, color: 'fg.muted', fontSize: fontSize ?? 2}} aria-hidden="true">
      /
    </Text>
  )
}

function FileName({value, id, fontSize}: {value: string; id?: string; fontSize?: number}) {
  return (
    <Heading
      as="h1"
      tabIndex={-1}
      sx={{fontWeight: 600, display: 'inline-block', maxWidth: '100%', fontSize: fontSize ?? 2}}
      id={id}
    >
      {value}
    </Heading>
  )
}

function getPathSegmentData(path: string) {
  const segments = path.split(separatorCharacter)
  const fileName = segments.pop()!

  return {
    fileName,
    segments: segments.map((segment, i) => ({
      directoryName: segment,
      directoryPath: segments.slice(0, i + 1).join(separatorCharacter),
    })),
  }
}

function CopyPathButton({path}: {path: string}) {
  const copyButtonRef = useRef(null)
  const [updateTooltipMessage, clearTooltipMessage, portalTooltip] = useAlertTooltip(
    'copy-path-tooltip',
    copyButtonRef,
    {
      direction: 'nw',
    },
  )

  const defaultLabel = `Copy path`
  const [copied, setCopied] = useState(false)

  const clickHandler: MouseEventHandler = useCallback(() => {
    if (copied) {
      return
    }

    copyText(path)
    setCopied(true)
    updateTooltipMessage('Copied path!')

    setTimeout(() => {
      setCopied(false)
      clearTooltipMessage()
    }, 3000)
  }, [copied, path, updateTooltipMessage, clearTooltipMessage])

  const enterHandler = useCallback(() => {
    if (!copied) {
      updateTooltipMessage(defaultLabel)
    }
  }, [copied, defaultLabel, updateTooltipMessage])

  const leaveHandler = useCallback(() => {
    if (!copied) {
      clearTooltipMessage()
    }
  }, [copied, clearTooltipMessage])

  return (
    <>
      <IconButton
        icon={copied ? CheckIcon : CopyIcon}
        ref={copyButtonRef}
        variant="invisible"
        size="small"
        aria-label={defaultLabel}
        onClick={clickHandler}
        onFocus={() => enterHandler()}
        onMouseEnter={() => enterHandler()}
        onMouseLeave={() => leaveHandler()}
        onBlur={() => leaveHandler()}
        sx={{ml: 2}}
        data-testid="breadcrumb-copy-path-button"
      />
      {portalTooltip}
    </>
  )
}

try{ Breadcrumb.displayName ||= 'Breadcrumb' } catch {}
try{ RepoLink.displayName ||= 'RepoLink' } catch {}
try{ DirectoryLink.displayName ||= 'DirectoryLink' } catch {}
try{ Separator.displayName ||= 'Separator' } catch {}
try{ FileName.displayName ||= 'FileName' } catch {}
try{ CopyPathButton.displayName ||= 'CopyPathButton' } catch {}