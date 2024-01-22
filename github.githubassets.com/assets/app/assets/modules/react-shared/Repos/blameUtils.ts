import {useTheme} from '@primer/react'

const recencyTimeRange = 2 * 365 * 24 * 60 * 60 * 1000 // 2 years

// See app/view_models/blob/blame_view.rb for breakpoints
const blameAgeProportionBreakpoints = [0.007, 0.014, 0.03, 0.049, 0.084, 0.14, 0.23, 0.38, 0.62, Number.MAX_VALUE]

// See https://primer.style/primitives/colors for the color scale
// TODO: we can avoid this lookup once the sx prop supports `scale` colors
const rawColors: Record<string, string> = {
  'scale.orange.0': '#ffdfb6',
  'scale.orange.1': '#ffc680',
  'scale.orange.2': '#f0883e',
  'scale.orange.3': '#f0883e',
  'scale.orange.4': '#db6d28',
  'scale.orange.5': '#bd561d',
  'scale.orange.6': '#9b4215',
  'scale.orange.7': '#762d0a',
  'scale.orange.8': '#5a1e02',
  'scale.orange.9': '#3d1300',
}

export function useBlameAgeColors() {
  const {resolvedColorScheme} = useTheme()
  const isDark = resolvedColorScheme?.startsWith('dark')

  if (isDark) {
    return new Array(10).fill(null).map((_, i) => rawColors[`scale.orange.${9 - i}`])
  } else {
    return new Array(10).fill(null).map((_, i) => rawColors[`scale.orange.${i}`])
  }
}

export function useBlameAgeColor(commitDate: Date, repoCreationDate: Date) {
  const {resolvedColorScheme} = useTheme()
  const isDark = resolvedColorScheme?.startsWith('dark')
  const defaultColor = isDark ? rawColors['scale.orange.9'] : rawColors['scale.orange.0']

  if (commitDate < repoCreationDate) {
    // This is a silly edge case, but it can happen in test data
    return defaultColor
  }

  const now = Date.now()
  const timeRange = Math.min(now - repoCreationDate.getTime(), recencyTimeRange)
  const commitAge = now - commitDate.getTime()

  const proportion = commitAge / timeRange

  let i = 0
  for (const breakpoint of blameAgeProportionBreakpoints) {
    if (proportion < breakpoint) {
      return isDark ? rawColors[`scale.orange.${i}`] : rawColors[`scale.orange.${9 - i}`]
    }
    ++i
  }

  return defaultColor
}
