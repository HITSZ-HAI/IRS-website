import type {DeferredMetadata} from '@github-ui/code-view-types'
import type {Repository} from '@github-ui/current-repository'
import {deferredMetadataPath} from '@github-ui/paths'
import type {RefInfo} from '@github-ui/repos-types'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import React, {useEffect, useState} from 'react'

export const EmptyDeferredMetadata: DeferredMetadata = {
  showLicenseMeta: false,
  license: null,
  codeownerInfo: {
    codeownerPath: null,
    ownedByCurrentUser: null,
    ownersForFile: null,
    ruleForPathLine: null,
  },
  newDiscussionPath: null,
  newIssuePath: null,
}

const DeferredMetadataContext = React.createContext(EmptyDeferredMetadata)

export function DeferredMetadataProvider({children, ...props}: React.PropsWithChildren<DeferredMetadata>) {
  return <DeferredMetadataContext.Provider value={props}>{children}</DeferredMetadataContext.Provider>
}

export function useDeferredMetadata() {
  return React.useContext(DeferredMetadataContext)
}

function isValidResponse(obj: DeferredMetadata): obj is DeferredMetadata {
  return typeof obj.showLicenseMeta === 'boolean' && typeof obj.codeownerInfo === 'object'
}

export function useLoadDeferredMetadata(
  repo: Repository,
  refInfo: RefInfo,
  path: string,
  has404Error: boolean,
): DeferredMetadata {
  const [state, setState] = useState<DeferredMetadata>(EmptyDeferredMetadata)
  const url =
    refInfo && !has404Error
      ? deferredMetadataPath({
          repo,
          commitish: refInfo.name,
          path,
        })
      : null

  useEffect(() => {
    if (!url) return

    let cancelled = false
    const update = async () => {
      setState(EmptyDeferredMetadata)
      const response = await verifiedFetchJSON(url)

      if (cancelled) {
        return
      }

      try {
        if (response.ok) {
          const data = await response.json()
          if (data && isValidResponse(data)) {
            setState(data)
          }
        } else {
          setState(EmptyDeferredMetadata)
        }
      } catch (e) {
        setState(EmptyDeferredMetadata)
      }
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [url])

  return state
}

try{ DeferredMetadataContext.displayName ||= 'DeferredMetadataContext' } catch {}
try{ DeferredMetadataProvider.displayName ||= 'DeferredMetadataProvider' } catch {}