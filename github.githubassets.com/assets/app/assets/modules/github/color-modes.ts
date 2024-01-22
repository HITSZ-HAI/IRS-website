import {ready} from '@github-ui/document-ready'
import {setCookie} from './cookies'

export type ColorMode = 'light' | 'dark'
export type ColorModeWithAuto = ColorMode | 'auto'

/**
 * Set the OS preferred color mode on page load
 */
;(async () => {
  await ready
  setPreferredColorModeCookie()

  // update the cookie when OS preferred color mode changes
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', setPreferredColorModeCookie)
    } else {
      mediaQuery.addListener(setPreferredColorModeCookie)
    }
  }
})()

function setPreferredColorModeCookie() {
  setCookie('preferred_color_mode', getPreferredColorMode() as string)
}

export function getPreferredColorMode(): ColorMode | undefined {
  if (prefersColorScheme('dark')) {
    return 'dark'
  } else if (prefersColorScheme('light')) {
    return 'light'
  }

  return undefined
}

function prefersColorScheme(scheme: ColorMode): boolean {
  return window.matchMedia && window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches
}

function getColorModeAttribute() {
  const rootEl = document.querySelector('html[data-color-mode]')
  if (!rootEl) return undefined
  return rootEl.getAttribute('data-color-mode')
}

/**
 * Set the `data-color-mode` attribute on the html element of the page.
 */
export function setClientMode(mode: ColorModeWithAuto) {
  const rootEl = document.querySelector('html[data-color-mode]')
  if (!rootEl) {
    // Color modes are not active on this page
    return
  }
  rootEl.setAttribute('data-color-mode', mode)
}

export function setClientTheme(theme: string, type: ColorMode) {
  const rootEl = document.querySelector('html[data-color-mode]')
  if (!rootEl) {
    // Color modes are not active on this page
    return
  }
  rootEl.setAttribute(`data-${type}-theme`, theme)
}

/**
 * Returns the user theme as defined by the `data-light-theme` or
 * `data-dark-theme` attribute.
 */
export function getClientTheme(type: ColorMode) {
  const rootEl = document.querySelector('html[data-color-mode]')
  if (!rootEl) {
    // Color modes are not active on this page
    return
  }
  return rootEl.getAttribute(`data-${type}-theme`)
}

/**
 * Provides a stable color mode. This does not delineate the theme, but rather the light vs dark modes.
 *
 * If you're after the theme, please use {@link getClientTheme}
 */
export function getColorMode(fallback: ColorMode = 'light') {
  const mode = getColorModeAttribute()
  return (mode === 'auto' ? getPreferredColorMode() : mode) ?? fallback
}
