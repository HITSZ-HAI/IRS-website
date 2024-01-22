import {PreferredFileTypes, type RepoOverviewBlobPayload} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {sendEvent} from '@github-ui/hydro-analytics'
import {editBlobPath, repositoryTreePath} from '@github-ui/paths'
import {Link} from '@github-ui/react-core/link'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {BookIcon, CodeOfConductIcon, LawIcon, ListUnorderedIcon} from '@primer/octicons-react'
import {ActionMenu, Box, Button, Heading, Octicon, Spinner, Text, UnderlineNav} from '@primer/react'
import {useCallback, useEffect, useRef, useState} from 'react'

import {useFilesPageInfo} from '../../hooks/FilesPageInfo'
import TableOfContentsPanel from '../blob/BlobContent/Renderable/TableOfContentsPanel'
import {DirectoryRichtextContent} from '../directory/DirectoryContent/DirectoryReadmePreview'
import {EditButton} from '../directory/DirectoryContent/EditButton'

export function OverviewFiles({
  initialFiles,
  shouldRecommendReadme,
  isPersonalRepo,
  processingTime,
}: {
  initialFiles: RepoOverviewBlobPayload[]
  shouldRecommendReadme: boolean
  isPersonalRepo: boolean
  processingTime: number
}) {
  const [overviewFiles, setOverviewFiles] = useState<RepoOverviewBlobPayload[]>(initialFiles)

  const readme = overviewFiles.find(file => file.preferredFileType === PreferredFileTypes.README)
  const coc = overviewFiles.find(file => file.preferredFileType === PreferredFileTypes.CODE_OF_CONDUCT)
  const licenses = overviewFiles.filter(file => file.preferredFileType === PreferredFileTypes.LICENSE)
  const securityPolicy = overviewFiles.find(file => file.preferredFileType === PreferredFileTypes.SECURITY)

  let initialSelectedTab = 'readme-ov-file'
  if (!readme && !shouldRecommendReadme) {
    if (coc) {
      initialSelectedTab = 'coc-ov-file'
    } else if (licenses[0]) {
      initialSelectedTab = `${licenses[0].tabName}-1-ov-file`
    } else if (securityPolicy) {
      initialSelectedTab = 'security-ov-file'
    }
  }

  const [selectedTab, setSelectedTab] = useState(initialSelectedTab)
  const containerRef = useRef<HTMLDivElement>(null)
  const repo = useCurrentRepository()
  const {refInfo} = useFilesPageInfo()

  useEffect(() => {
    if (!initialFiles.length) return
    sendEvent('overview-repo-files', {
      'file-count': initialFiles.length,
      'timed-out': initialFiles.some((file: RepoOverviewBlobPayload) => file.timedOut),

      'processing-time': processingTime,
    })
  }, [initialFiles, processingTime])

  useEffect(() => {
    const fetchOverviewFiles = async () => {
      const response = await verifiedFetchJSON(`/${repo.ownerLogin}/${repo.name}/overview-files`, {method: 'GET'})
      const data: {files: RepoOverviewBlobPayload[]; processingTime: number} = await response.json()
      setOverviewFiles(data.files)

      if (!data.files) return

      sendEvent('overview-repo-files', {
        'file-count': data.files.length,
        'timed-out': data.files.some((file: RepoOverviewBlobPayload) => file.timedOut),
        'processing-time': data.processingTime,
      })
    }

    if (initialFiles.some((file: RepoOverviewBlobPayload) => !file.loaded)) {
      fetchOverviewFiles()
    }
  }, [repo.name, repo.ownerLogin, initialFiles])

  const getTabNames = useCallback(() => {
    const tabNames: string[] = []

    if (readme || shouldRecommendReadme) {
      tabNames.push('readme-ov-file')
    }

    if (coc) {
      tabNames.push('coc-ov-file')
    }

    if (licenses.length) {
      for (const [index, license] of licenses.entries()) {
        tabNames.push(`${license.tabName}-${index + 1}-ov-file`)
      }
    }

    if (securityPolicy) {
      tabNames.push('security-ov-file')
    }

    return tabNames
  }, [coc, licenses, readme, securityPolicy, shouldRecommendReadme])

  const onHashChange = useCallback(() => {
    const hash = window.location.hash.replace('#', '')

    const tabNames = getTabNames()

    if (hash && tabNames.includes(hash)) {
      if (typeof navigation === 'undefined') return
      // Move the hash to the query param and set the hash to the readme section id
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?tab=${hash}#readme`
      history.replaceState(navigation.currentEntry.getState(), '', newUrl)
      setSelectedTab(hash)
    } else {
      const params = new URLSearchParams(window.location.search)
      const tabName = params.get('tab')

      if (tabName && tabNames.includes(tabName)) {
        setSelectedTab(tabName)
      }
    }

    window.requestAnimationFrame(() => {
      if (containerRef.current && window.location.hash === '#readme') {
        containerRef.current.scrollIntoView()
      }
    })
  }, [getTabNames])

  useEffect(() => {
    onHashChange()

    window.addEventListener('hashchange', onHashChange)

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [onHashChange])

  const onSelect = useCallback(
    (ev: React.MouseEvent | React.KeyboardEvent, tabId: string) => {
      ev.preventDefault()
      if (selectedTab === tabId) return
      setSelectedTab(tabId)

      if (typeof navigation === 'undefined') return
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?tab=${tabId}`
      history.replaceState(navigation.currentEntry.getState(), '', newUrl)
    },
    [selectedTab],
  )

  if (!readme && !coc && !licenses.length && !securityPolicy && !shouldRecommendReadme) {
    return null
  }

  let content: JSX.Element | undefined = undefined

  let blob: RepoOverviewBlobPayload | undefined = undefined

  const selectedLicense = licenses.find((license, index) => `${license.tabName}-${index + 1}-ov-file` === selectedTab)

  if (selectedTab === 'readme-ov-file') {
    if (readme) {
      blob = readme
    } else if (shouldRecommendReadme) {
      content = (
        <MissingContent
          title="Add a README"
          description={
            isPersonalRepo
              ? 'Add a README with an overview of your project.'
              : 'Help people interested in this repository understand your project by adding a README.'
          }
          icon={BookIcon}
          buttonText="Add a README"
          href={`${repositoryTreePath({
            repo,
            path: undefined,
            commitish: refInfo.name,
            action: 'new',
          })}?filename=README.md`}
        />
      )
    }
  } else if (selectedTab === 'coc-ov-file' && coc) {
    blob = coc
  } else if (selectedLicense) {
    blob = selectedLicense
  } else if (securityPolicy) {
    blob = securityPolicy
  }

  if (blob && blob.path) {
    if (!blob.loaded) {
      content = (
        <Box sx={{display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', py: 4}}>
          <Spinner />
        </Box>
      )
    } else {
      content = (
        <DirectoryRichtextContent
          errorMessage={blob.errorMessage}
          onAnchorClick={() => {
            if (typeof navigation === 'undefined') return

            const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?tab=${selectedTab}${window.location.hash}`
            history.replaceState(navigation.currentEntry.getState(), '', newUrl)
          }}
          path={blob.path}
          richText={blob.richText}
          stickyHeaderHeight={50}
          timedOut={blob.timedOut}
        />
      )
    }
  }

  return (
    <Box sx={{display: 'flex', flexGrow: 1, gap: 3}}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          '@media screen and (max-width: 543px)': {
            mx: '-16px',
            maxWidth: 'calc(100% + 32px)',
          },
          '@media screen and (min-width: 544px)': {
            maxWidth: '100%',
          },
        }}
        ref={containerRef}
      >
        <Box
          sx={{
            display: 'flex',
            borderBottom: '1px solid',
            borderBottomColor: 'border.default',
            alignItems: 'center',
            pr: 2,
            position: 'sticky',
            top: 0,
            backgroundColor: 'canvas.default',
            zIndex: 1,
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
          }}
        >
          <UnderlineNav aria-label="Repository files" sx={{flexGrow: 1, borderBottom: 'none', maxWidth: '100%', px: 2}}>
            {(readme || shouldRecommendReadme) && (
              <UnderlineNav.Item
                icon={BookIcon}
                aria-current={selectedTab === 'readme-ov-file' ? 'page' : undefined}
                onSelect={ev => onSelect(ev, 'readme-ov-file')}
              >
                {readme?.tabName || 'README'}
              </UnderlineNav.Item>
            )}
            {coc && (
              <UnderlineNav.Item
                icon={CodeOfConductIcon}
                aria-current={selectedTab === 'coc-ov-file' ? 'page' : undefined}
                onSelect={ev => onSelect(ev, 'coc-ov-file')}
              >
                {coc?.tabName || 'Code of conduct'}
              </UnderlineNav.Item>
            )}
            {licenses.length
              ? licenses.map((license, index) => {
                  const tabId = `${license.tabName}-${index + 1}-ov-file`

                  return (
                    <UnderlineNav.Item
                      key={license.path}
                      icon={LawIcon}
                      aria-current={selectedTab === tabId ? 'page' : undefined}
                      onSelect={ev => onSelect(ev, tabId)}
                    >
                      {license.tabName.toLowerCase() !== 'license' ? `${license.tabName} license` : 'License'}
                    </UnderlineNav.Item>
                  )
                })
              : null}
            {securityPolicy && (
              <UnderlineNav.Item
                icon={LawIcon}
                aria-current={selectedTab === 'security-ov-file' ? 'page' : undefined}
                onSelect={ev => onSelect(ev, 'security-ov-file')}
              >
                {securityPolicy?.tabName || 'Security policy'}
              </UnderlineNav.Item>
            )}
          </UnderlineNav>
          {refInfo.canEdit && blob && (
            <EditButton
              editPath={editBlobPath({
                owner: repo.ownerLogin,
                repo: blob.repoName,
                commitish: blob.refName,
                filePath: blob.path,
              })}
              editTooltip="Edit file"
              customSx={{mr: 2, height: '28px'}}
            />
          )}
          {blob?.headerInfo?.toc && blob?.headerInfo?.toc?.length >= 2 && (
            <ActionMenu>
              <ActionMenu.Button
                icon={ListUnorderedIcon}
                variant="invisible"
                aria-label="Outline"
                sx={{color: 'fg.subtle', px: 2}}
              >
                Outline
              </ActionMenu.Button>

              <ActionMenu.Overlay align="end" sx={{minWidth: '256px'}}>
                <TableOfContentsPanel toc={blob.headerInfo.toc} />
              </ActionMenu.Overlay>
            </ActionMenu>
          )}
        </Box>
        {content}
      </Box>
    </Box>
  )
}

function MissingContent({
  title,
  description,
  icon,
  buttonText,
  href,
}: {
  title: string
  description: string
  icon: React.ElementType
  buttonText: string
  href: string
}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, px: 3}}>
      <Octicon icon={icon} size={32} sx={{color: 'fg.subtle', mb: 3}} />
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 5}}>
        <Heading as="h2" sx={{fontSize: 4}}>
          {title}
        </Heading>
        <Text sx={{fontSize: 0, color: 'fg.subtle', textAlign: 'center'}}>{description}</Text>
      </Box>
      <Button as={Link} to={href} variant="primary" reloadDocument>
        {buttonText}
      </Button>
    </Box>
  )
}

try{ OverviewFiles.displayName ||= 'OverviewFiles' } catch {}
try{ MissingContent.displayName ||= 'MissingContent' } catch {}