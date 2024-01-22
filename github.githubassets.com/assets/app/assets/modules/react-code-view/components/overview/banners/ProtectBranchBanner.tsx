import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {
  dismissRepositoryNoticePathPath,
  newBranchProtectionPath,
  newRulesetPath,
  repoOverviewUrl,
} from '@github-ui/paths'
import {useClientValue} from '@github-ui/use-client-value'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {GitBranchIcon, XIcon} from '@primer/octicons-react'
import {Box, Button, IconButton, Link, LinkButton, Octicon, Text} from '@primer/react'
import React from 'react'

import {useCurrentUser} from '../../../../react-shared/Repos/CurrentUser'
import {useFilesPageInfo} from '../../../hooks/FilesPageInfo'
import {linkButtonSx} from '../../../utilities/styles'

export function ProtectBranchBanner({helpUrl, rulesetsUpsell}: {helpUrl: string; rulesetsUpsell?: boolean}) {
  const {refInfo} = useFilesPageInfo()
  const repo = useCurrentRepository()
  const docPath = rulesetsUpsell
    ? `/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`
    : `/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches`
  const documentationHref = `${helpUrl}${docPath}`
  const currentUser = useCurrentUser()

  const onDismissProtectBranchBanner = () => {
    if (!currentUser) return
    const dismissPath = dismissRepositoryNoticePathPath({login: currentUser.login})
    const form = new FormData()
    form.append('_method', 'delete')
    form.append('repository_id', repo.id.toString())
    form.append('notice_name', 'sculk_protect_this_branch')
    verifiedFetch(dismissPath, {
      method: 'POST',
      body: form,
    })
    setHidden(true)
  }

  const [hidden, setHidden] = React.useState(false)
  const [isSSR] = useClientValue(() => false, true, [])

  const learnMoreBranchAnalytics = getAnalytics(
    'click_to_learn_more_about_branch_protection_rules',
    `ref_cta:learn_more_about_protected_branches`,
    repo,
    isSSR,
  )
  const learnMoreRulesetAnalytics = getAnalytics(
    'click_to_learn_more_about_rulesets',
    `ref_cta:learn_more_about_rulesets`,
    repo,
    isSSR,
  )
  const protectBranchAnalytics = getAnalytics('click_to_add_a_rule', 'ref_cta:protect_this_branch', repo, isSSR)
  const dismissAnalytics = getAnalytics('click_to_dismiss', 'ref_cta:dismiss', repo, isSSR)
  const protectThisBranchHref = rulesetsUpsell
    ? newRulesetPath({owner: repo.ownerLogin, repo: repo.name})
    : newBranchProtectionPath({owner: repo.ownerLogin, repo: repo.name, branchName: refInfo.name})

  return (
    <Box
      sx={{borderColor: 'border.default', borderStyle: 'solid', borderWidth: 1, borderRadius: '6px'}}
      hidden={hidden}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: ['start', 'center', 'start', 'center'],
          px: 3,
          py: 3,
        }}
      >
        <Octicon icon={GitBranchIcon} size="medium" sx={{mr: 2, mt: 1}} />
        <Box sx={{display: 'flex', flexDirection: ['column', 'row', 'column', 'row'], width: '100%'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', mb: 2, flexGrow: 1, flexBasis: 0}}>
            <Text sx={{ml: 2, fontWeight: 600, fontSize: 2, mb: 1}}>
              Your {refInfo.name} branch isn&apos;t protected
            </Text>
            <Text sx={{ml: 2, color: 'fg.muted'}}>
              Protect this branch from force pushing or deletion, or require status checks before merging.&nbsp;
              <Link
                href={documentationHref}
                data-analytics-event={rulesetsUpsell ? learnMoreRulesetAnalytics : learnMoreBranchAnalytics}
              >
                View documentation.
              </Link>
            </Text>
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, pl: 2}}>
            <LinkButton href={protectThisBranchHref} sx={linkButtonSx} data-analytics-event={protectBranchAnalytics}>
              Protect this branch
            </LinkButton>
            <Button
              onClick={onDismissProtectBranchBanner}
              data-analytics-event={dismissAnalytics}
              sx={{display: ['inherit', 'none', 'inherit', 'none']}}
            >
              Dismiss
            </Button>
            <IconButton
              aria-label="Dismiss banner"
              icon={XIcon}
              variant="invisible"
              onClick={onDismissProtectBranchBanner}
              data-analytics-event={dismissAnalytics}
              sx={{display: ['none', 'inherit', 'none', 'inherit'], color: 'fg.muted'}}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function getAnalytics(action: string, label: string, repo: Repository, isSSR: boolean) {
  return JSON.stringify({
    category: 'Suggestions',
    action,
    label: `ref_page:${
      isSSR ? `https://github.com${repoOverviewUrl(repo)}` : window.location
    };${label};ref_loc:repo files listing;`,
  })
}

try{ ProtectBranchBanner.displayName ||= 'ProtectBranchBanner' } catch {}