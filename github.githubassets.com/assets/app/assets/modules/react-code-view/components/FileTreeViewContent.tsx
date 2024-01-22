import {type OverviewPayload, PreferredFileTypes, type TreePayload} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {branchesPath, repositoryTreePath, tagsPath} from '@github-ui/paths'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Link} from '@github-ui/react-core/link'
import {SafeHTMLBox} from '@github-ui/safe-html'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {GitBranchIcon, KebabHorizontalIcon, PlusIcon, SearchIcon, TagIcon, UploadIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Button, Flash, IconButton, Link as PrimerLink, Octicon, Text} from '@primer/react'
import {lazy, Suspense, useCallback, useEffect, useState} from 'react'

import {useCurrentUser} from '../../react-shared/Repos/CurrentUser'
import {useOpenPanel} from '../contexts/OpenPanelContext'
import {CurrentTreeProvider} from '../hooks/CurrentTree'
import {useFilesPageInfo} from '../hooks/FilesPageInfo'
import {CodeButton} from './CodeButton'
import {BranchInfoBar} from './directory/BranchInfoBar/BranchInfoBar'
import DirectoryContent from './directory/DirectoryContent'
import {DirectoryReadmePreview} from './directory/DirectoryContent/DirectoryReadmePreview'
import {Dropzone} from './directory/Dropzone'
import FolderViewHeader from './headers/FolderViewHeader'
import {AddFileDropdownButton} from './headers/header-components/AddFileDropdownButton'
import {ReposHeaderRefSelector} from './headers/ReposHeaderRefSelector'
import {LatestCommitSingleLine} from './LatestCommit'
import {OverviewFiles} from './overview/OverviewRepoFiles'
import BranchRenamePopover from './overview/popovers/BranchRenamePopover'
import ParentBranchRenamePopover from './overview/popovers/ParentBranchRenamePopover'

const FileResultsList = lazy(() => import('./file-tree/FileResultsList'))

export function FileTreeViewContent({
  tree,
  overview,
  showTree,
  treeToggleElement,
  onFindFilesShortcut,
}: {
  tree: TreePayload
  overview?: OverviewPayload
  showTree: boolean
  treeToggleElement: JSX.Element | null
  onFindFilesShortcut?: () => void
}) {
  const repo = useCurrentRepository()
  const currentUser = useCurrentUser()
  const {refInfo, path} = useFilesPageInfo()
  const uploadUrl = repositoryTreePath({
    repo,
    commitish: refInfo.name,
    path,
    action: 'upload',
  })
  const {openPanel, setOpenPanel} = useOpenPanel()
  const [hideFiles, setHideFiles] = useState(overview?.hideRepoFiles)
  const [branchCount, setBranchCount] = useState('')
  const [tagCount, setTagCount] = useState('')
  const navigate = useNavigate()

  const onViewSourceClick = useCallback(() => {
    setHideFiles(false)
  }, [])

  useEffect(() => {
    const fetchBranchCount = async () => {
      const response = await verifiedFetch(overview!.branchCountPath, {method: 'get'})
      if (response.ok) {
        const text = await response.text()
        setBranchCount(text)
      }
    }
    const fetchTagCount = async () => {
      const response = await verifiedFetch(overview!.tagCountPath, {method: 'get'})
      if (response.ok) {
        const text = await response.text()
        setTagCount(text)
      }
    }
    if (overview) {
      fetchBranchCount()
      fetchTagCount()
    }
  }, [overview])

  const readme = overview
    ? overview.overviewFiles.find(file => file.preferredFileType === PreferredFileTypes.README)
    : tree.readme

  const navigateToSearch = useCallback(() => {
    navigate(`${window.location.pathname}?search=1`)
  }, [navigate])

  return (
    <CurrentTreeProvider payload={tree}>
      {!overview ? (
        <LatestCommitSingleLine />
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexGrow: 1,
            pb: 3,
            pt: 2,
          }}
        >
          <Box
            sx={{display: 'flex', flexDirection: 'row', gap: 2, '@media screen and (max-width: 320px)': {flexGrow: 1}}}
          >
            <Box
              sx={{
                position: 'relative',
                '@media screen and (max-width: 380px)': {
                  '.ref-selector-button-text-container': {
                    maxWidth: '80px',
                  },
                },
                '@media screen and (max-width: 320px)': {
                  flexGrow: 1,
                  '.overview-ref-selector': {
                    width: '100%',
                    '> span': {
                      display: 'flex',
                      justifyContent: 'flex-start',
                      '> span[data-component="text"]': {flexGrow: 1},
                    },
                  },
                },
              }}
            >
              <ReposHeaderRefSelector buttonClassName="overview-ref-selector" />
              {overview.popovers.rename ? (
                <BranchRenamePopover rename={overview.popovers.rename} />
              ) : overview.popovers.renamedParentRepo ? (
                <ParentBranchRenamePopover
                  branchName={overview.popovers.renamedParentRepo.branchName}
                  nameWithOwner={overview.popovers.renamedParentRepo.nameWithOwner}
                />
              ) : null}
            </Box>
            <Box sx={{display: 'flex', '@media screen and (max-width: 1080px)': {display: 'none'}}}>
              <Button
                as="a"
                leadingVisual={GitBranchIcon}
                variant="invisible"
                href={branchesPath({repo})}
                sx={{color: 'fg.muted', px: 1, 'span[data-component="leadingVisual"]': {mr: '4px !important'}}}
              >
                {branchCount ? <SafeHTMLBox unverifiedHTML={branchCount} /> : 'Branches'}
              </Button>

              <Button
                as="a"
                leadingVisual={TagIcon}
                variant="invisible"
                href={tagsPath({repo})}
                sx={{color: 'fg.muted', px: 1, 'span[data-component="leadingVisual"]': {mr: '4px !important'}}}
              >
                {tagCount ? <SafeHTMLBox unverifiedHTML={tagCount} /> : 'Tags'}
              </Button>
            </Box>
            <Box
              sx={{
                display: 'flex',
                '@media screen and (min-width: 1080px)': {display: 'none'},
                '@media screen and (max-width: 544px)': {display: 'none'},
              }}
            >
              <Button
                as="a"
                aria-label="Go to Branches page"
                icon={GitBranchIcon}
                variant="invisible"
                href={branchesPath({repo})}
                sx={{color: 'fg.muted'}}
              />
              <Button
                as="a"
                aria-label="Go to Tags page"
                icon={TagIcon}
                variant="invisible"
                href={tagsPath({repo})}
                sx={{color: 'fg.muted'}}
              />
            </Box>
          </Box>
          <Box sx={{display: 'flex', pl: 2, gap: 2}}>
            <Box sx={{display: 'flex', gap: 2, '@media screen and (max-width: 544px)': {display: 'none'}}}>
              <Box sx={{display: 'flex', '@media screen and (max-width: 1012px)': {display: 'none'}}}>
                <Suspense fallback={null}>
                  <FileResultsList onFindFilesShortcut={onFindFilesShortcut} sx={{m: 0}} />
                </Suspense>
              </Box>
              <Box sx={{display: 'flex', '@media screen and (min-width: 1012px)': {display: 'none'}}}>
                <Button onClick={navigateToSearch}>Go to file</Button>
              </Box>
              <div className="react-directory-add-file-icon">
                <AddFileDropdownButton useIcon={true} />
              </div>
              <div className="react-directory-remove-file-icon">
                <AddFileDropdownButton useIcon={false} />
              </div>
            </Box>
            <CodeButton
              repoId={repo.id}
              refName={refInfo.name}
              payload={overview}
              isLoggedIn={!!currentUser}
              primary={!overview.templateButton}
            />
            <Box sx={{display: 'flex', '@media screen and (min-width: 544px)': {display: 'none'}}}>
              <ActionMenu>
                <ActionMenu.Anchor>
                  <IconButton icon={KebabHorizontalIcon} aria-label="Open more actions menu" />
                </ActionMenu.Anchor>

                <ActionMenu.Overlay>
                  <ActionList>
                    <ActionList.LinkItem href={branchesPath({repo})}>
                      <ActionList.LeadingVisual>
                        <Octicon icon={GitBranchIcon} />
                      </ActionList.LeadingVisual>
                      Branches
                    </ActionList.LinkItem>
                    <ActionList.LinkItem href={tagsPath({repo})}>
                      <ActionList.LeadingVisual>
                        <Octicon icon={TagIcon} />
                      </ActionList.LeadingVisual>
                      Tags
                    </ActionList.LinkItem>
                    <ActionList.Divider />
                    <ActionList.Item onClick={navigateToSearch}>
                      <ActionList.LeadingVisual>
                        <Octicon icon={SearchIcon} />
                      </ActionList.LeadingVisual>
                      Go to file
                    </ActionList.Item>
                    <ActionList.LinkItem
                      as={Link}
                      to={repositoryTreePath({repo, path, commitish: refInfo.name, action: 'new'})}
                    >
                      <ActionList.LeadingVisual>
                        <Octicon icon={PlusIcon} />
                      </ActionList.LeadingVisual>
                      Create new file
                    </ActionList.LinkItem>
                    <ActionList.LinkItem
                      href={repositoryTreePath({repo, path, commitish: refInfo.name, action: 'upload'})}
                    >
                      <ActionList.LeadingVisual>
                        <Octicon icon={UploadIcon} />
                      </ActionList.LeadingVisual>
                      Upload file
                    </ActionList.LinkItem>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </Box>
          </Box>
        </Box>
      )}
      {tree.showBranchInfobar && (
        <ErrorBoundary fallback={<BranchInfoBarErrorBanner />}>
          <BranchInfoBar />
        </ErrorBoundary>
      )}
      {!overview && <FolderViewHeader showTree={showTree} treeToggleElement={treeToggleElement} />}
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
        {hideFiles ? (
          <PrimerLink onClick={onViewSourceClick}>View stack template source</PrimerLink>
        ) : (
          <Box>
            <DirectoryContent overview={overview} />
          </Box>
        )}
        {overview && (
          <OverviewFiles
            initialFiles={overview.overviewFiles}
            shouldRecommendReadme={overview.banners.shouldRecommendReadme}
            isPersonalRepo={overview.banners.isPersonalRepo}
            processingTime={overview.overviewFilesProcessingTime}
          />
        )}
        {readme && !overview && (
          <DirectoryReadmePreview
            openPanel={openPanel}
            setOpenPanel={setOpenPanel}
            readme={readme}
            stickyHeaderHeight={50}
          />
        )}
        {overview && !readme && overview.banners.shouldRecommendReadme && (
          <Flash
            sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
            className={'file-tree-view-readme-flash-narrow'}
          >
            <Text>
              {overview.banners.isPersonalRepo
                ? 'Add a README with an overview of your project.'
                : 'Help people interested in this repository understand your project by adding a README.'}
            </Text>
            <Button
              as={Link}
              to={`${repositoryTreePath({
                repo,
                path: undefined,
                commitish: refInfo.name,
                action: 'new',
              })}?filename=README.md`}
              reloadDocument={true}
            >
              Add a README
            </Button>
          </Flash>
        )}

        {repo.currentUserCanPush && <Dropzone uploadUrl={uploadUrl} />}
      </Box>
    </CurrentTreeProvider>
  )
}

function BranchInfoBarErrorBanner() {
  return (
    <Flash variant="warning" sx={{my: 3}}>
      <Text>Cannot retrieve comparison with upstream repository.</Text>
    </Flash>
  )
}

try{ FileResultsList.displayName ||= 'FileResultsList' } catch {}
try{ FileTreeViewContent.displayName ||= 'FileTreeViewContent' } catch {}
try{ BranchInfoBarErrorBanner.displayName ||= 'BranchInfoBarErrorBanner' } catch {}