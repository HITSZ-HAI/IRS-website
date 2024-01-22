import type {CopilotAccessPayload} from '@github-ui/copilot-for-individuals/types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {CancelFeatureRequest, RequestFeature, useFeatureRequest} from '@github-ui/feature-request'
import type {FeatureRequestInfo} from '@github-ui/feature-request/types'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {CopilotIcon} from '@primer/octicons-react'
import {AnchoredOverlay, Box, Button, Heading, Link, LinkButton, PointerBox, Text} from '@primer/react'
import {useCallback, useState} from 'react'

import {useCurrentUser} from '../../react-shared/Repos/CurrentUser'
import {PopoverMessage} from '../constants/copilot-popover'

export interface CopilotAccessInfo extends CopilotAccessPayload {
  orgHasCFBAccess: boolean
  userHasOrgs: boolean
  userIsOrgAdmin: boolean
  userIsOrgMember: boolean
  featureRequestInfo?: FeatureRequestInfo
}

export interface CopilotInfo {
  notices: {
    codeViewPopover?: {
      dismissed: boolean
      dismissPath: string
    }
  }
  documentationUrl: string
  userAccess?: CopilotAccessInfo
}

interface CopilotPopoverProps {
  view: 'blame' | 'edit' | 'preview'
  copilotInfo?: CopilotInfo
  className?: string
}

export const CopilotPopover = ({view, copilotInfo, className}: CopilotPopoverProps): JSX.Element | null => {
  const {documentationUrl, notices, userAccess} = copilotInfo ?? {}
  const {
    business,
    orgHasCFBAccess,
    userHasCFIAccess,
    userHasOrgs,
    userIsOrgAdmin,
    userIsOrgMember,
    featureRequestInfo,
  } = userAccess ?? {}
  const {codeViewPopover: codeViewPopoverNotice} = notices ?? {}

  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const currentUser = useCurrentUser()
  const {isOrgOwned: repoIsOrgOwned, ownerLogin} = useCurrentRepository()
  const {inProgress, requested, toggleFeatureRequest} = useFeatureRequest(featureRequestInfo)

  const [isOpen, setIsOpen] = useState(false)
  const [popoverHidden, setPopoverHidden] = useState(false)
  const openPopover = useCallback(() => setIsOpen(true), [setIsOpen])
  const closePopover = useCallback(() => setIsOpen(false), [setIsOpen])

  const buttonText = useCallback((): string => {
    if (userAccess && repoIsOrgOwned) {
      if (userIsOrgMember && !userIsOrgAdmin && (!orgHasCFBAccess || userHasCFIAccess)) {
        return 'Your organization can pay for GitHub Copilot'
      }
    }

    return 'Code 55% faster with GitHub Copilot'
  }, [orgHasCFBAccess, repoIsOrgOwned, userAccess, userHasCFIAccess, userIsOrgAdmin, userIsOrgMember])

  const bodyText = (): string => {
    if (userAccess && repoIsOrgOwned) {
      if (userIsOrgAdmin) {
        return PopoverMessage.ORG_ADMIN
      } else if (userIsOrgMember && userHasCFIAccess) {
        return PopoverMessage.ORG_MEMBER
      }
    }

    return PopoverMessage.STANDARD
  }

  const FeatureRequest = (): JSX.Element | null => {
    if (!featureRequestInfo?.showFeatureRequest) {
      return null
    }

    return requested ? (
      <CancelFeatureRequest inProgress={inProgress} toggleFeatureRequest={toggleFeatureRequest} />
    ) : (
      <RequestFeature
        inProgress={inProgress}
        toggleFeatureRequest={toggleFeatureRequest}
        featureName={featureRequestInfo?.featureName}
      />
    )
  }

  const getUserRepoRelationship = (): string => {
    if (currentUser && ownerLogin === currentUser.login) {
      return 'owner'
    } else if (userIsOrgAdmin) {
      return 'admin'
    } else if (userIsOrgMember) {
      return 'member'
    } else {
      return 'personal'
    }
  }

  const sendAnalyticsClickOpenPopover = (): void => {
    if (currentUser) {
      sendClickAnalyticsEvent({
        category: 'copilot_popover_code_view',
        action: `click_to_open_popover_${view}`,
        label: `ref_cta:open_copilot_popover;owner:${ownerLogin};relationship:${getUserRepoRelationship()}`,
      })
    }
  }

  const sendAnalyticsClickPopoverCTA = (action: string, ctaText: string): void => {
    sendClickAnalyticsEvent({
      category: 'copilot_popover_code_view',
      action,
      label: `ref_cta:${ctaText};ref_loc:code_view_${view}`,
    })
  }

  const sendAnalyticsDismissPopover = (): void => {
    const refLoc = `${repoIsOrgOwned ? 'org_' : ''}code_view_${view}${userIsOrgAdmin ? '_org_admin' : ''}`

    sendClickAnalyticsEvent({
      category: 'copilot_popover_code_view',
      action: `click_to_dismiss_copilot_popover_forever`,
      label: `ref_cta:dont_show_again;ref_loc:${refLoc}`,
    })
  }

  const sendAnalyticsClickLearnMore = (): void => {
    const isCFBDocs = userAccess?.userHasOrgs ?? false

    sendClickAnalyticsEvent({
      category: 'copilot_popover_code_view',
      action: `click_to_go_to_copilot_for_${isCFBDocs ? 'business' : 'individuals'}_info`,
      label: 'ref_cta:learn_more;ref_loc:code_view',
    })
  }

  const bodyCTA = (): JSX.Element | null => {
    const userCFBSeat = !!business
    const userHasAnyCopilotAccess = userCFBSeat || userHasCFIAccess

    if (!userHasAnyCopilotAccess && (!repoIsOrgOwned || (repoIsOrgOwned && !userIsOrgMember))) {
      return userHasOrgs ? (
        <LinkButton
          type="button"
          href="/settings/copilot"
          onClick={() => sendAnalyticsClickPopoverCTA('click_to_go_to_copilot_settings', 'get_github_copilot')}
        >
          Get GitHub Copilot
        </LinkButton>
      ) : (
        <LinkButton
          type="button"
          href="/github-copilot/signup"
          onClick={() => sendAnalyticsClickPopoverCTA('click_to_go_to_copilot_trial_signup', 'start_a_free_trial')}
        >
          Start a free trial
        </LinkButton>
      )
    }

    if (userIsOrgMember && !orgHasCFBAccess) {
      if (userIsOrgAdmin) {
        return (
          <LinkButton
            type="button"
            href={`/github-copilot/business_signup/organization/payment?org=${ownerLogin}`}
            onClick={() => sendAnalyticsClickPopoverCTA('click_to_buy_copilot_for_business', 'get_github_copilot')}
          >
            Get GitHub Copilot
          </LinkButton>
        )
      }
    }

    if (featureRequestInfo) {
      return <FeatureRequest />
    }

    return null
  }

  const onDismissPopover = (): void => {
    if (codeViewPopoverNotice) {
      verifiedFetch(codeViewPopoverNotice.dismissPath, {method: userIsOrgMember ? 'DELETE' : 'POST'})
      sendAnalyticsDismissPopover()
      setPopoverHidden(true)
    }
  }

  const hideCopilotPopover = (): boolean => popoverHidden || !copilotInfo

  if (hideCopilotPopover()) {
    return null
  }
  return (
    <Box className={className}>
      <AnchoredOverlay
        onOpen={openPopover}
        onClose={closePopover}
        open={isOpen}
        overlayProps={{
          role: 'dialog',
          sx: {overflow: 'inherit'},
        }}
        focusZoneSettings={{disabled: true}}
        renderAnchor={anchorProps => (
          <Button
            {...anchorProps}
            {...testIdProps('copilot-popover-button')}
            leadingVisual={CopilotIcon}
            onClick={() => {
              setIsOpen(!isOpen)
              sendAnalyticsClickOpenPopover()
            }}
            size="small"
            sx={{
              color: 'fg.default',
              display: ['none', 'none', 'none', 'none', 'block'],
            }}
            variant="invisible"
          >
            {buttonText()}
          </Button>
        )}
      >
        <PointerBox
          {...testIdProps('copilot-popover-content')}
          caret="top"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 1,
            justifyContent: 'space-between',
            padding: 4,
            width: '350px',
          }}
        >
          <Heading as="h2" sx={{fontSize: 1, fontWeight: 'bold', pb: 3}}>
            Code 55% faster with GitHub Copilot
          </Heading>
          <Box sx={{fontSize: 1, fontWeight: 'normal', pb: 3}}>
            <Text {...testIdProps('copilot-popover-body-text')}>{bodyText()}</Text>
            <Link
              {...testIdProps('copilot-popover-content-learn-more')}
              aria-label={`Click this link to learn more about copilot. This action opens in a new tab.`}
              target="_blank"
              href={documentationUrl}
              onClick={() => sendAnalyticsClickLearnMore()}
              sx={{marginLeft: '8px'}}
            >
              Learn more
            </Link>
          </Box>
          <Box sx={{alignItems: 'center', display: 'flex', flexDirection: 'row'}}>
            {bodyCTA()}
            <Button
              {...testIdProps('copilot-popover-dismiss-button')}
              variant="invisible"
              onClick={onDismissPopover}
              sx={{cursor: 'pointer', fontSize: 1, fontWeight: 'bold', textDecorationLine: 'none', marginLeft: '8px'}}
            >
              Don&apos;t show again
            </Button>
          </Box>
        </PointerBox>
      </AnchoredOverlay>
    </Box>
  )
}

try{ CopilotPopover.displayName ||= 'CopilotPopover' } catch {}
try{ FeatureRequest.displayName ||= 'FeatureRequest' } catch {}