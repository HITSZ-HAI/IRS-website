import type {ReactNode} from 'react'
import {RenderPhaseProvider} from '@github-ui/render-phase-provider'
import {ThemeProvider} from '@primer/react'
import useColorModes from './use-color-modes'
import {ToastContextProvider} from '@github-ui/toast'
import {AnalyticsProvider} from '@github-ui/analytics-provider'

interface Props {
  appName: string
  children?: ReactNode
  wasServerRendered: boolean
}

const metadata = {}

/**
 * This component provides the _base_ context for both apps and partials.
 * It should provide everything needed to render with styles, themes, and i18n.
 */
export function BaseProviders({appName, children, wasServerRendered}: Props) {
  const {colorMode, dayScheme, nightScheme} = useColorModes()

  return (
    <RenderPhaseProvider wasServerRendered={wasServerRendered}>
      <AnalyticsProvider appName={appName} category="" metadata={metadata}>
        <ThemeProvider colorMode={colorMode} dayScheme={dayScheme} nightScheme={nightScheme} preventSSRMismatch>
          <ToastContextProvider>{children}</ToastContextProvider>
        </ThemeProvider>
      </AnalyticsProvider>
    </RenderPhaseProvider>
  )
}

try{ BaseProviders.displayName ||= 'BaseProviders' } catch {}