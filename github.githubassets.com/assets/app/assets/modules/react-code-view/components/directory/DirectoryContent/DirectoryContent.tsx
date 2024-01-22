import type {OverviewPayload} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {parentPath, repositoryTreePath} from '@github-ui/paths'
import {ScreenSize} from '@github-ui/screen-size'
import {useNavigate} from '@github-ui/use-navigate'
import {AlertIcon} from '@primer/octicons-react'
import {Box, Flash, Link, Octicon, Text, Truncate} from '@primer/react'
import React from 'react'

import {useFocusHintContext} from '../../../../react-shared/contexts/FocusHintContext'
import {ScreenReaderHeading} from '../../../../react-shared/ScreenReaderHeading'
import {useCurrentTree} from '../../../hooks/CurrentTree'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import {useCommitInfo} from '../../../hooks/use-commit-info'
import {useInitiallyTruncatedList} from '../../../hooks/use-initially-truncated-list'
import {useUrlCreator} from '../../../hooks/use-url-creator'
import {textAreaId} from '../../../utilities/lines'
import {DuplicateOnKeydownButton} from '../../DuplicateOnKeydownButton'
import {LatestCommitContent} from '../../LatestCommit'
import {DirectoryRow, GoDirectoryUpRow} from './DirectoryRow'
import {HeaderRow, Row, Table, TableFooter} from './Table'

export function DirectoryContent({overview}: {overview?: OverviewPayload}) {
  const repo = useCurrentRepository()
  const {refInfo, path} = useFilesPageInfo()
  const {items, templateDirectorySuggestionUrl, totalCount} = useCurrentTree()
  // When switching to SSR it will probably be best to remove this and
  // render all the items initially.
  const {items: itemsToShow} = useInitiallyTruncatedList(items, 100)
  const [truncateForMobile, setTruncateForMobile] = React.useState(!!overview)
  const omitted = totalCount - items.length
  const {commitInfo} = useCommitInfo()
  // Overview has a path == '/' and we want to hide the parent link in that case
  const isSubdirectory = path.length > 1

  const parentUrl = parentPath(path)
  const parentPathHref = repositoryTreePath({repo, action: 'tree', commitish: refInfo.name, path: parentUrl})

  const goToParentLinkRef = React.useRef<HTMLAnchorElement>(null)

  const {getItemUrl} = useUrlCreator()
  const navigate = useNavigate()
  const {focusHint} = useFocusHintContext()

  const [focusedIndex, setFocusedIndex] = React.useState(-1)

  const onNavigate: React.MouseEventHandler<HTMLAnchorElement> = React.useCallback(e => {
    if (e.screenX === 0 && e.screenY === 0) {
      // On keyboard navigation, set focus on the parent row
      goToParentLinkRef.current?.focus()
    }
  }, [])

  const onViewFilesButtonClick = React.useCallback(() => {
    setTruncateForMobile(false)
  }, [])

  const focusNextIndex = React.useCallback((nextIndex: number) => {
    setFocusedIndex(nextIndex)
    const row = document.getElementById(`folder-row-${nextIndex}`)
    let cell
    if (window.innerWidth <= ScreenSize.medium) {
      cell = row?.querySelector('.react-directory-row-name-cell-small-screen')
    } else {
      cell = row?.querySelector('.react-directory-row-name-cell-large-screen')
    }
    // If the cell wasn't found, this should be the GoDirectoryUpRow, so focus the only Link.
    if (!cell) {
      cell = row
    }
    cell?.getElementsByTagName('a')[0]?.focus()
  }, [])

  return (
    <Box data-hpc>
      <DuplicateOnKeydownButton
        buttonTestLabel="focus-next-element-button"
        buttonFocusId={textAreaId}
        buttonHotkey={'j'}
        onButtonClick={() => {
          const nextIndex = Math.min(focusedIndex + 1, isSubdirectory ? itemsToShow.length : itemsToShow.length - 1)
          focusNextIndex(nextIndex)
        }}
      />
      <DuplicateOnKeydownButton
        buttonTestLabel="focus-previous-element-button"
        buttonFocusId={textAreaId}
        buttonHotkey={'k'}
        onButtonClick={() => {
          const nextIndex = Math.max(focusedIndex - 1, 0)
          focusNextIndex(nextIndex)
        }}
      />
      <ScreenReaderHeading as="h2" text="Folders and files" id="folders-and-files" />
      <Table aria-labelledby="folders-and-files" sx={{overflow: 'unset'}}>
        <HeaderRow sx={overview ? {height: '0px', lineHeight: '0px', tr: {height: '0px', fontSize: '0px'}} : undefined}>
          <Box
            as="th"
            sx={{
              width: '100%',
              borderTopLeftRadius: '6px',
              '@media screen and (min-width: 544px)': {display: 'none'},
            }}
            colSpan={2}
          >
            <Text sx={{fontWeight: 600}}>Name</Text>
          </Box>
          <Box
            as="th"
            sx={{width: '40%', borderTopLeftRadius: '6px', '@media screen and (max-width: 543px)': {display: 'none'}}}
            colSpan={1}
          >
            <Text sx={{fontWeight: 600}}>Name</Text>
          </Box>
          <Box as="th" sx={{'@media screen and (max-width: 543px)': {display: 'none'}}}>
            <Truncate inline title="Last commit message" sx={{maxWidth: '100%'}}>
              <Text sx={{fontWeight: 600}}>Last commit message</Text>
            </Truncate>
          </Box>
          <Box as="th" sx={{textAlign: 'right', pr: 3, width: '136px', borderTopRightRadius: '6px'}} colSpan={1}>
            <Truncate inline title="Last commit date" sx={{maxWidth: '100%'}}>
              <Text sx={{fontWeight: 600}}>Last commit date</Text>
            </Truncate>
          </Box>
        </HeaderRow>
        <tbody>
          {!!overview && (
            <>
              <Box
                as="tr"
                sx={{
                  color: 'fg.muted',
                  fontSize: 0,
                  height: '40px',
                }}
              >
                <Box
                  as="td"
                  colSpan={3}
                  sx={{backgroundColor: 'canvas.subtle', p: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2}}
                >
                  <LatestCommitContent commitCount={overview?.commitCount} />
                </Box>
              </Box>
              {omitted > 0 ? (
                <tr>
                  <td colSpan={3}>
                    <Flash variant="warning" sx={{borderRadius: 0}}>
                      <Octicon icon={AlertIcon} />
                      Sorry, we had to truncate this directory to 1,000 files. {omitted} entries were omitted from the
                      list.
                    </Flash>
                  </td>
                </tr>
              ) : null}
            </>
          )}

          {isSubdirectory && (
            <GoDirectoryUpRow
              initialFocus={!focusHint || !itemsToShow.some(i => i.path === focusHint)}
              linkTo={parentPathHref}
              linkRef={goToParentLinkRef}
              navigate={navigate}
            />
          )}
          {itemsToShow.map((item, index) => (
            <DirectoryRow
              key={item.name}
              initialFocus={item.path === focusHint}
              item={item}
              commit={(commitInfo || {})[item.name]}
              onNavigate={onNavigate}
              getItemUrl={getItemUrl}
              navigate={navigate}
              className={truncateForMobile && index >= 10 ? 'truncate-for-mobile' : undefined}
              index={isSubdirectory ? index + 1 : index}
            />
          ))}
          <Box
            as="tr"
            className={truncateForMobile && itemsToShow.length > 10 ? 'show-for-mobile' : 'd-none'}
            sx={{
              textAlign: 'center',
              verticalAlign: 'center',
              height: '40px',
              borderTop: '1px solid',
              borderColor: 'border.default',
            }}
            data-testid="view-all-files-row"
          >
            <Box
              as="td"
              colSpan={3}
              onClick={onViewFilesButtonClick}
              sx={{borderTop: '1px solid var(--borderColor-default, var(--color-border-default))', cursor: 'pointer'}}
            >
              <div>
                <Link as="button" onClick={onViewFilesButtonClick}>
                  View all files
                </Link>
              </div>
            </Box>
          </Box>
        </tbody>
        {templateDirectorySuggestionUrl && (
          <TableFooter>
            <Row>
              <td colSpan={3}>
                Customize the issue creation experience with a <code>config.yml</code> file.{' '}
                <Link href={templateDirectorySuggestionUrl}>Learn more about configuring a template chooser.</Link>
              </td>
            </Row>
          </TableFooter>
        )}
      </Table>
    </Box>
  )
}

try{ DirectoryContent.displayName ||= 'DirectoryContent' } catch {}