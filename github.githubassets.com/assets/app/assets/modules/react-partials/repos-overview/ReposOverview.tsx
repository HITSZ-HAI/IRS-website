import React, {useEffect, useMemo} from 'react'
// eslint-disable-next-line no-restricted-imports
import CodeView from '../../react-code-view/pages/CodeView'

import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import {CurrentUserProvider} from '../../react-shared/Repos/CurrentUser'
import {ScreenSize, ScreenSizeProvider} from '@github-ui/screen-size'
import type {FilePagePayload} from '@github-ui/code-view-types'

export function ReposOverview({initialPayload, appPayload}: {initialPayload: FilePagePayload; appPayload: unknown}) {
  const [repo] = React.useState(initialPayload?.repo)
  const [user] = React.useState(initialPayload?.currentUser)
  const appName = 'react-code-view-overview'
  const category = ''
  const metadata = useMemo(() => ({}), [])

  useEffect(() => {
    const footer = document.querySelector('.footer')
    if (footer) {
      footer.querySelector('.mt-6')?.classList.replace('mt-6', 'mt-0')
      footer.querySelector('.border-top')?.classList.remove('border-top')
    }
  }, [])

  return (
    <AppPayloadContext.Provider value={appPayload}>
      <ScreenSizeProvider initialValue={ScreenSize.xxxlarge}>
        <AnalyticsProvider appName={appName} category={category} metadata={metadata}>
          <CurrentUserProvider user={user}>
            <CurrentRepositoryProvider repository={repo}>
              <CodeView initialPayload={initialPayload} />
            </CurrentRepositoryProvider>
          </CurrentUserProvider>
        </AnalyticsProvider>
      </ScreenSizeProvider>
    </AppPayloadContext.Provider>
  )
}

try{ ReposOverview.displayName ||= 'ReposOverview' } catch {}