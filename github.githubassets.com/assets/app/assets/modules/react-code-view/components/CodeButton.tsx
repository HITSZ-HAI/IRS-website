import type {OverviewPayload} from '@github-ui/code-view-types'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLBox} from '@github-ui/safe-html'
import safeStorage from '@github-ui/safe-storage'
import {useIsPlatform} from '@github-ui/use-is-platform'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {CodeIcon, DesktopDownloadIcon, FileZipIcon, QuestionIcon, TerminalIcon} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  Flash,
  Heading,
  Link,
  Octicon,
  Spinner,
  TabNav,
  Text,
  Tooltip,
  UnderlineNav,
} from '@primer/react'
import type React from 'react'
import {useCallback, useEffect, useState} from 'react'

const safeLocalStorage = safeStorage('localStorage')

interface CodeButtonProps {
  refName: string
  repoId: number
  primary: boolean
  payload: OverviewPayload
  isLoggedIn: boolean
}

interface ErrorState {
  header?: string
  message?: React.ReactNode
}

enum ActiveTab {
  Local = 'local',
  Codespaces = 'cloud',
}

export function CodeButton(props: CodeButtonProps) {
  const localStorageDefaultTabKey = 'code-button-default-tab'
  const [activeTab, setActiveTab] = useState<string>(ActiveTab.Local)
  const [codespacesContent, setCodespacesContent] = useState('')
  const [codespacesLoading, setCodespacesLoading] = useState(false)
  const [errorState, setErrorState] = useState<ErrorState>({})
  const [openingPlatform, setOpeningPlatform] = useState('')
  const {isLoggedIn, refName, repoId, payload} = props
  const {
    codespacesEnabled,
    hasAccessToCodespaces,
    repoPolicyInfo,
    contactPath,
    currentUserIsEnterpriseManaged,
    enterpriseManagedBusinessName,
    isEnterprise,
    newCodespacePath,
  } = payload.codeButton
  const {defaultProtocol} = payload.codeButton.local.protocolInfo
  const [activeLocalTab, setActiveLocalTab] = useState(defaultProtocol)

  const onCodespacesTabClick = useCallback(
    async (ev?: React.MouseEvent) => {
      setActiveTab(ActiveTab.Codespaces)
      safeLocalStorage.setItem(localStorageDefaultTabKey, ActiveTab.Codespaces)
      ev?.preventDefault()
      if (!isLoggedIn) {
        setErrorState({
          header: 'Sign In Required',
          message: (
            <Text>
              Please <Link href={newCodespacePath}>sign in</Link> to use Codespaces.
            </Text>
          ),
        })
        return
      }
      if (codespacesContent || codespacesLoading || !repoPolicyInfo) {
        return
      }
      const defaultErrorMessage = (
        <Text>
          An unexpected error occurred. Please <Link href={contactPath}>contact support</Link> for more information.
        </Text>
      )
      if (hasAccessToCodespaces) {
        setCodespacesLoading(true)
        const result = await verifiedFetch(
          `/codespaces?codespace%5Bref%5D=${refName}&current_branch=${refName}&event_target=REPO_PAGE&repo=${repoId}`,
        )

        if (result.ok) {
          const data = await result.text()
          setCodespacesContent(data)
        } else {
          setErrorState({
            header: 'Codespace Access Limited',
            message: defaultErrorMessage,
          })
        }
        setCodespacesLoading(false)
      } else {
        let header
        let message
        if (!repoPolicyInfo.allowed) {
          header = 'Codespace Access Limited'
          if (!repoPolicyInfo.canBill && currentUserIsEnterpriseManaged) {
            message = (
              <Text>
                <Link href="https://docs.github.com/en/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-enterprise-managed-users">
                  Enterprise-managed users
                </Link>
                {` must have their Codespaces usage paid for by ${
                  enterpriseManagedBusinessName || 'their enterprise'
                }.`}
              </Text>
            )
          } else if (repoPolicyInfo.hasIpAllowLists) {
            message = (
              <Text>
                Your organization or enterprise enforces{' '}
                <Link href="https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/managing-allowed-ip-addresses-for-your-organization">
                  IP allow lists
                </Link>
                Which are unsupported by Codespaces at this time.
              </Text>
            )
          } else if (repoPolicyInfo.disabledByBusiness) {
            message = (
              <Text>
                Your enterprise has disabled Codespaces at this time. Please contact your enterprise administrator for
                more information.
              </Text>
            )
          } else {
            message = defaultErrorMessage
          }
        } else if (!repoPolicyInfo.changesWouldBeSafe) {
          header = 'Repository Access Limited'
          message = <Text>You do not have access to push to this repository and its owner has disabled forking.</Text>
        } else {
          header = 'Codespace Access Limited'
          message = defaultErrorMessage
        }
        setErrorState({header, message})
      }
    },
    [
      codespacesContent,
      codespacesLoading,
      contactPath,
      currentUserIsEnterpriseManaged,
      enterpriseManagedBusinessName,
      hasAccessToCodespaces,
      isLoggedIn,
      newCodespacePath,
      refName,
      repoId,
      repoPolicyInfo,
    ],
  )

  const onLocalTabClick = useCallback((ev?: React.MouseEvent) => {
    setActiveTab(ActiveTab.Local)
    safeLocalStorage.setItem(localStorageDefaultTabKey, ActiveTab.Local)
    ev?.preventDefault()
  }, [])

  useEffect(() => {
    const defaultActiveTab = safeLocalStorage.getItem(localStorageDefaultTabKey)
    if (defaultActiveTab === ActiveTab.Codespaces && codespacesEnabled) {
      onCodespacesTabClick()
    }
    // Only run after the initial render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setOpeningPlatform('')
    }
  }, [])

  const tabLinkStyles = {
    height: '40px',
    width: '50%',
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTop: 0,
    color: 'fg.muted',
    ':hover': {
      backgroundColor: 'unset',
      borderColor: 'border.default',
    },
    '&.selected': {
      backgroundColor: 'canvas.overlay',
    },
    ':not(&.selected)': {
      border: 0,
    },
  }

  return (
    <ActionMenu onOpenChange={onOpenChange}>
      <ActionMenu.Button
        variant={props.primary ? 'primary' : undefined}
        sx={{svg: props.primary ? {color: 'fg.primary'} : undefined}}
        leadingVisual={CodeButtonIcon}
      >
        Code
      </ActionMenu.Button>
      <ActionMenu.Overlay width="auto" align="end">
        {openingPlatform === 'githubDesktop' ? (
          <LaunchingPlatformContents platform="Github Desktop" href="https://desktop.github.com/" />
        ) : openingPlatform === 'visualStudio' ? (
          <LaunchingPlatformContents platform="Visual Studio" />
        ) : openingPlatform === 'xcode' ? (
          <LaunchingPlatformContents platform="Xcode" href="https://developer.apple.com/xcode/" />
        ) : (
          <ActionList sx={{width: '400px', py: 0}}>
            {!isEnterprise && codespacesEnabled && (
              <TabNav>
                <TabNav.Link
                  as={Button}
                  selected={activeTab === ActiveTab.Local}
                  onClick={onLocalTabClick}
                  sx={{
                    ...tabLinkStyles,
                    borderLeft: 0,
                  }}
                >
                  Local
                </TabNav.Link>
                <TabNav.Link
                  as={Button}
                  selected={activeTab === ActiveTab.Codespaces}
                  onClick={onCodespacesTabClick}
                  sx={{
                    ...tabLinkStyles,
                    borderRight: 0,
                  }}
                >
                  Codespaces
                </TabNav.Link>
              </TabNav>
            )}
            {activeTab === 'local' && (
              <LocalTab
                payload={payload}
                setOpeningPlatform={setOpeningPlatform}
                activeLocalTab={activeLocalTab}
                setActiveLocalTab={setActiveLocalTab}
              />
            )}
            {activeTab === 'cloud' && (
              <CodespacesTab errorState={errorState} loading={codespacesLoading} content={codespacesContent} />
            )}
          </ActionList>
        )}
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

function CodeButtonIcon() {
  return (
    <Box sx={{'@media screen and (max-width: 544px)': {display: 'none'}, height: '16px', mb: 2}}>
      <CodeIcon />
    </Box>
  )
}

function LocalTab({
  payload,
  setOpeningPlatform,
  activeLocalTab,
  setActiveLocalTab,
}: {
  payload: OverviewPayload
  setOpeningPlatform: React.Dispatch<React.SetStateAction<string>>
  activeLocalTab: string
  setActiveLocalTab: React.Dispatch<React.SetStateAction<string>>
}) {
  const {helpUrl} = payload
  const {
    httpAvailable,
    sshAvailable,
    svnBridgeAvailable,
    httpUrl,
    showCloneWarning,
    sshUrl,
    sshCertificatesRequired,
    sshCertificatesAvailable,
    ghCliUrl,
    newSshKeyUrl,
    setProtocolPath,
  } = payload.codeButton.local.protocolInfo

  const {cloneUrl, visualStudioCloneUrl, showVisualStudioCloneButton, showXcodeCloneButton, xcodeCloneUrl, zipballUrl} =
    payload.codeButton.local.platformInfo
  const isMacOrWindows = useIsPlatform(['windows', 'mac'])
  const isMac = useIsPlatform(['mac'])
  const navigate = useNavigate()

  const localListItemStyle = {
    borderTop: '1px solid',
    borderColor: 'var(--borderColor-muted, var(--color-border-muted))',
    mx: 0,
    p: 3,
    width: '100%',
    borderRadius: 0,
  }

  const localProtocolMessageStyle = {mt: 2, color: 'fg.muted'}

  const onProtocolTabClick = useCallback(
    (protocol: string) => {
      if (activeLocalTab !== protocol) {
        setActiveLocalTab(protocol)
        const formData = new FormData()
        formData.set('protocol_selector', protocol)
        verifiedFetch(setProtocolPath, {method: 'post', body: formData})
      }
    },
    [activeLocalTab, setActiveLocalTab, setProtocolPath],
  )

  return (
    <Box>
      <Box sx={{m: 3}}>
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Octicon icon={TerminalIcon} sx={{mr: 2}} />
          <Text sx={{flexGrow: 1, fontWeight: 'bold'}}>Clone</Text>
          <Tooltip aria-label="Which remote URL should I use?" direction="w">
            <Link muted href={`${helpUrl}/articles/which-remote-url-should-i-use`}>
              <Octicon icon={QuestionIcon} sx={{mr: 1}} />
            </Link>
          </Tooltip>
        </Box>
        <UnderlineNav sx={{border: 'none', my: 2, px: 0}} aria-label="Remote URL selector">
          {httpAvailable && (
            <UnderlineNav.Item
              aria-current={activeLocalTab === 'http' ? 'page' : undefined}
              sx={{fontWeight: 'bold'}}
              onClick={ev => {
                onProtocolTabClick('http')
                ev.preventDefault()
              }}
            >
              HTTPS
            </UnderlineNav.Item>
          )}
          {sshAvailable && (
            <UnderlineNav.Item
              aria-current={activeLocalTab === 'ssh' ? 'page' : undefined}
              sx={{fontWeight: 'bold'}}
              onClick={ev => {
                onProtocolTabClick('ssh')
                ev.preventDefault()
              }}
            >
              SSH
            </UnderlineNav.Item>
          )}
          <UnderlineNav.Item
            aria-current={activeLocalTab === 'gh_cli' ? 'page' : undefined}
            sx={{fontWeight: 'bold'}}
            onClick={ev => {
              onProtocolTabClick('gh_cli')
              ev.preventDefault()
            }}
          >
            GitHub CLI
          </UnderlineNav.Item>
        </UnderlineNav>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          {activeLocalTab === 'http' ? (
            <>
              <CloneUrl url={httpUrl} />
              <Text sx={localProtocolMessageStyle}>
                {svnBridgeAvailable ? 'Use Git or checkout with SVN using the web URL.' : 'Clone using the web URL.'}
              </Text>
            </>
          ) : activeLocalTab === 'ssh' ? (
            <>
              {showCloneWarning && (
                <Flash sx={{mb: 2}} variant="warning">
                  {"You don't have any public SSH keys in your GitHub account. "}
                  You can <Link href={newSshKeyUrl}>add a new public key</Link>, or try cloning this repository via
                  HTTPS.
                </Flash>
              )}
              <CloneUrl url={sshUrl} />
              <Text sx={localProtocolMessageStyle}>
                {sshCertificatesRequired
                  ? 'Use a password-protected SSH certificate.'
                  : sshCertificatesAvailable
                    ? 'Use a password-protected SSH key or certificate.'
                    : 'Use a password-protected SSH key.'}
              </Text>
            </>
          ) : (
            <>
              <CloneUrl url={ghCliUrl} />
              <Text sx={localProtocolMessageStyle}>
                Work fast with our official CLI.{' '}
                <Link href="https://cli.github.com" target="_blank" aria-label="Learn more about the GitHub CLI">
                  Learn more
                </Link>
              </Text>
            </>
          )}
        </Box>
      </Box>
      <ActionList sx={{py: 0}}>
        {isMacOrWindows && (
          <ActionList.Item
            onClick={() => {
              setOpeningPlatform('githubDesktop')
              // Perform the navigation in an onClick because ActionList.LinkItems
              // close the overlay when clicked.
              navigate(cloneUrl)
            }}
            sx={localListItemStyle}
          >
            <ActionList.LeadingVisual>
              <DesktopDownloadIcon />
            </ActionList.LeadingVisual>
            Open with GitHub Desktop
          </ActionList.Item>
        )}
        {isMacOrWindows && showVisualStudioCloneButton && (
          <ActionList.Item
            onClick={() => {
              setOpeningPlatform('visualStudio')
              navigate(visualStudioCloneUrl)
            }}
            sx={localListItemStyle}
          >
            Open with Visual Studio
          </ActionList.Item>
        )}
        {isMac && showXcodeCloneButton && (
          <ActionList.Item
            onClick={() => {
              setOpeningPlatform('xcode')
              navigate(xcodeCloneUrl)
            }}
            sx={localListItemStyle}
          >
            Open with Xcode
          </ActionList.Item>
        )}
        <ActionList.Item
          onClick={() => {
            navigate(zipballUrl)
          }}
          sx={localListItemStyle}
        >
          <ActionList.LeadingVisual>
            <FileZipIcon />
          </ActionList.LeadingVisual>
          Download ZIP
        </ActionList.Item>
      </ActionList>
    </Box>
  )
}

function CodespacesTab({errorState, loading, content}: {errorState: ErrorState; loading: boolean; content: string}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'center'}}>
      {loading ? (
        <Spinner sx={{margin: 2}} />
      ) : errorState.header && errorState.message ? (
        <Box sx={{p: 4, m: '40px'}}>
          <Heading as="h4" sx={{fontSize: '16px', textAlign: 'center'}}>
            {errorState.header}
          </Heading>
          <Box sx={{textAlign: 'center'}}>{errorState.message}</Box>
        </Box>
      ) : (
        <SafeHTMLBox sx={{width: '100%'}} html={content as SafeHTMLString} />
      )}
    </Box>
  )
}

function LaunchingPlatformContents({platform, href}: {platform: string; href?: string}) {
  return (
    <Box sx={{width: '400px', p: 3}}>
      <Heading as="h4" sx={{fontSize: '16px', textAlign: 'center', mb: 3}}>
        {`Launching ${platform}`}
      </Heading>
      {href && (
        <Text sx={{mb: 3}}>
          If nothing happens, <Link href={href}>{`download ${platform}`}</Link> and try again.
        </Text>
      )}
    </Box>
  )
}

function CloneUrl({url}: {url: string}) {
  return (
    <Box sx={{display: 'flex', height: '32px'}}>
      <input
        type="text"
        className="form-control input-monospace input-sm color-bg-subtle"
        data-autoselect
        value={url}
        aria-label={url}
        readOnly
        style={{flexGrow: 1}}
      />
      <CopyToClipboardButton
        sx={{ml: 1, mr: 0, width: '32px'}}
        textToCopy={url}
        ariaLabel="Copy url to clipboard"
        tooltipProps={{direction: 'nw'}}
      />
    </Box>
  )
}

try{ CodeButton.displayName ||= 'CodeButton' } catch {}
try{ CodeButtonIcon.displayName ||= 'CodeButtonIcon' } catch {}
try{ LocalTab.displayName ||= 'LocalTab' } catch {}
try{ CodespacesTab.displayName ||= 'CodespacesTab' } catch {}
try{ LaunchingPlatformContents.displayName ||= 'LaunchingPlatformContents' } catch {}
try{ CloneUrl.displayName ||= 'CloneUrl' } catch {}