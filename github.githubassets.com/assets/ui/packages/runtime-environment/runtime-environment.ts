import memoize from '@github/memoize'
import {ssrSafeDocument} from '@github-ui/ssr-utils'

const runtimeEnvironment = memoize(githubEnvironment)

// return the github instance environment
// if dotcom, returns 'dotcom'
// if enterprise, returns 'enterprise' (ghes and ghae both)
function githubEnvironment(): string {
  return ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="runtime-environment"]')?.content || ''
}

export const isPrivateInstance = memoize(isGitHubPrivateInstance)
function isGitHubPrivateInstance(): boolean {
  return ssrSafeDocument?.head?.querySelector<HTMLMetaElement>('meta[name="is-private-instance"]')?.content === 'true'
}

export const isEnterprise = memoize(isEnterpriseEnvironment)
function isEnterpriseEnvironment(): boolean {
  return runtimeEnvironment() === 'enterprise'
}

// This is the "bundler" that built the client-side assets, e.g. "webpack"
export const bundler = typeof BUNDLER !== 'undefined' ? BUNDLER : undefined
