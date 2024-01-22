import type {ReadmeBlobPayload} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {repositoryTreePath} from '@github-ui/paths'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {HourglassIcon} from '@primer/octicons-react'
import {Box, Heading, Link, Octicon} from '@primer/react'

import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import type {PanelType} from '../../../pages/CodeView'
import TableOfContentsPanel from '../../blob/BlobContent/Renderable/TableOfContentsPanel'
import TableOfContents from '../../headers/header-components/TableOfContents'
import {MarkdownContent} from '../../MarkdownContent'
import {Panel} from '../../Panel'
import {EditButton} from './EditButton'

export function DirectoryReadmePreview({
  openPanel,
  readme,
  setOpenPanel,
  stickyHeaderHeight,
}: {
  openPanel: PanelType | undefined
  readme: ReadmeBlobPayload
  setOpenPanel: (panel: PanelType | undefined) => void
  stickyHeaderHeight?: number
}) {
  const {displayName, errorMessage, richText, headerInfo, timedOut} = readme
  const {toc} = headerInfo || {}
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const readmePath = path && path !== '/' ? `${path}/${displayName}` : displayName

  return (
    <Box sx={{minWidth: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 3}}>
      <Box
        id="readme"
        sx={{
          borderColor: 'border.default',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 2,
          width: openPanel === 'toc' ? '65%' : '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            pr: 2,
            pl: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'border.default',
          }}
        >
          <Heading as="h2" sx={{fontSize: 1, flexGrow: 1}}>
            <Link sx={{color: 'fg.default', '&:hover': {color: 'accent.fg'}}} href="#readme">
              {displayName}
            </Link>
          </Heading>
          {refInfo.canEdit && (
            <EditButton
              editPath={repositoryTreePath({repo, commitish: refInfo.name, action: 'edit', path: readmePath})}
              editTooltip="Edit README"
            />
          )}
          <TableOfContents toc={toc} openPanel={openPanel} setOpenPanel={setOpenPanel} isDirectoryReadme={true} />
        </Box>
        <DirectoryRichtextContent
          richText={richText}
          errorMessage={errorMessage}
          path={readmePath}
          stickyHeaderHeight={stickyHeaderHeight}
          timedOut={timedOut}
        />
      </Box>

      {openPanel === 'toc' && (
        <Panel sx={{height: 'fit-content', width: '35%'}}>
          <TableOfContentsPanel
            onClose={() => {
              setOpenPanel(undefined)
            }}
            toc={toc}
          />
        </Panel>
      )}
    </Box>
  )
}

export function DirectoryRichtextContent({
  errorMessage,
  onAnchorClick,
  path,
  richText,
  stickyHeaderHeight,
  timedOut,
}: {
  errorMessage?: string
  onAnchorClick?: (event: React.MouseEvent) => void
  path: string
  richText: SafeHTMLString | null
  stickyHeaderHeight?: number
  timedOut?: boolean
}) {
  const repo = useCurrentRepository()
  const {refInfo} = useFilesPageInfo()
  if (errorMessage) {
    return (
      <Box sx={{py: 6, px: 3, textAlign: 'center'}}>
        {timedOut && <Octicon icon={HourglassIcon} size={32} />}
        <Box data-testid="directory-richtext-error-message">{errorMessage}</Box>
        {timedOut && (
          <Box>
            But you can view the{' '}
            <Link
              href={repositoryTreePath({repo, commitish: refInfo.name, action: 'raw', path})}
              data-testid="directory-richtext-timeout-raw-link"
            >
              raw file
            </Link>
            .
          </Box>
        )}
      </Box>
    )
  } else if (richText) {
    return (
      <MarkdownContent
        onAnchorClick={onAnchorClick}
        richText={richText}
        stickyHeaderHeight={stickyHeaderHeight}
        sx={{p: 5, overflow: 'auto'}}
      />
    )
  }
  return null
}

try{ DirectoryReadmePreview.displayName ||= 'DirectoryReadmePreview' } catch {}
try{ DirectoryRichtextContent.displayName ||= 'DirectoryRichtextContent' } catch {}