import memoize from '@github/memoize'
import {getEnv} from '@github-ui/client-env'
import {IS_SERVER} from '@github-ui/ssr-utils'

function getEnabledFeaturesSet(): Set<string> {
  const features = getEnv().featureFlags
  const featuresUpperCase = features.map(feature => feature.toUpperCase())
  return new Set<string>(featuresUpperCase)
}

const featuresSet = IS_SERVER ? getEnabledFeaturesSet : memoize(getEnabledFeaturesSet)

export function isFeatureEnabled(name: string): boolean {
  return featuresSet().has(name.toUpperCase())
}

//exported to allow mocking in tests
const featureFlag = {isFeatureEnabled}

export {featureFlag}
