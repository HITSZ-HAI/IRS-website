// Think of this as the entry point into the framework
import React from 'react'
import type {EmbeddedPartialData} from './embedded-data-types'
import {BaseProviders} from './BaseProviders'
import type {BrowserHistory} from '@remix-run/router'
import {createMemoryHistory} from '@remix-run/router'
import {AppContextProvider} from './AppContextProvider'
import {PartialRouter} from './PartialRouter'
import {CommonElements} from './CommonElements'
import {createBrowserHistory} from './create-browser-history'

interface Props {
  partialName: string
  embeddedData: EmbeddedPartialData
  Component: React.ComponentType
  wasServerRendered: boolean
  ssrError: boolean
}

export function PartialEntry({partialName, embeddedData, Component, wasServerRendered, ssrError}: Props) {
  // Create a ref to track the browser history:
  const historyRef = React.useRef<BrowserHistory>()
  const window = globalThis.window as Window | undefined

  // For linking to work, we can just pass a dummy pathname here. We may consider plumbing the actual path in
  if (!historyRef.current) {
    historyRef.current = !window
      ? createMemoryHistory({initialEntries: [{pathname: '/'}]})
      : createBrowserHistory({window})
  }
  const history = historyRef.current

  // Wrap the partial in an AppContextProvider and static Router so that react-core links
  // will be functional.
  return (
    <BaseProviders appName={partialName} wasServerRendered={wasServerRendered}>
      <AppContextProvider history={history} routes={[]}>
        <PartialRouter history={history}>
          <Component {...embeddedData.props} />
          <CommonElements ssrError={ssrError} />
        </PartialRouter>
      </AppContextProvider>
    </BaseProviders>
  )
}

try{ PartialEntry.displayName ||= 'PartialEntry' } catch {}