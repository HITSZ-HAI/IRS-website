import type {CodeNavigationInfo, DefinitionOrReference, Range} from '@github-ui/code-nav'
import React, {useEffect, useRef, useState} from 'react'

import {DebouncedWorkerManager} from '../../react-shared/Repos/DebouncedWorkerManager'
import {WebWorker} from '../../react-shared/Repos/WebWorker'
import {findInFileWorkerJob} from '../worker-jobs/find-in-file'
import {useFilesPageInfo, useReposAppPayload} from './FilesPageInfo'

export interface FindInFileRequest {
  query: string
  lines: string[]
  currentCodeReferences: DefinitionOrReference[] | undefined
}

export interface FindInFileResponse {
  ranges: Range[]
  query: string
}

export type SearchInFileStatus = 'pending' | 'done'

export function useInFileSearchResults(codeNavInfo: CodeNavigationInfo | undefined, searchTerm: string) {
  const {findInFileWorkerPath} = useReposAppPayload()
  const [searchResults, setSearchResults] = useState<DefinitionOrReference[]>([])
  const [focusedSearchResult, setFocusedSearchResult] = useState<number | undefined>(undefined)
  const [searchStatus, setSearchStatus] = useState<SearchInFileStatus>('done')
  const workerManagerRef = React.useRef<DebouncedWorkerManager<FindInFileRequest, FindInFileResponse>>()
  const {refInfo, path} = useFilesPageInfo()

  if (!workerManagerRef.current && searchTerm) {
    workerManagerRef.current = new DebouncedWorkerManager<FindInFileRequest, FindInFileResponse>(
      new WebWorker(findInFileWorkerPath, findInFileWorkerJob),
      200, // Disable debounce, since we do incremental searching anyway so it's ultra fast
      (req: FindInFileRequest) => req.query.length !== 1,
    )
  }

  // Search term ref is used in the worker `onResponse` callback to avoid changing callback on every search term change.
  const searchTermRef = useRef(searchTerm)
  searchTermRef.current = searchTerm
  const lastSearchTerm = useRef('')

  useEffect(() => {
    return function destroy() {
      workerManagerRef.current?.terminate()
    }
  }, [])

  const lastCodeNavInfo = useRef<CodeNavigationInfo>()
  if (workerManagerRef.current && codeNavInfo !== lastCodeNavInfo.current) {
    workerManagerRef.current.onResponse = (data: FindInFileResponse) => {
      if (data.query === searchTermRef.current) {
        // TODO: Try to retain the focused search result (if possible) even as results change
        setFocusedSearchResult(0)
        setSearchResults(codeNavInfo?.createReferences(data.ranges) || [])
        setSearchStatus('done')
        lastSearchTerm.current = searchTermRef.current
      }
    }

    lastCodeNavInfo.current = codeNavInfo
  }

  //this effect re-searches for the previous search term when the ref changes - it wipes out all saved progress because
  //anything could have changed durring the swap between refs
  useEffect(() => {
    if (!codeNavInfo || !workerManagerRef.current || !lastSearchTerm.current || lastSearchTerm.current === '') {
      //reset everything because we changed refs
      setSearchResults([])
      setFocusedSearchResult(0)
      setSearchStatus('done')
      return
    }
    setSearchResults([])
    setFocusedSearchResult(0)
    setSearchStatus('pending')
    workerManagerRef.current.post({
      query: lastSearchTerm.current,
      lines: codeNavInfo.blobLines,
      currentCodeReferences: undefined,
    })
    // We only want to trigger an update when the ref changes, aka the user is on a new branch or commit, or when
    //they navigate to a new file (path). If they are navigating using the symbols navigation, we want to redo the
    //search for that symbol within the new file as well
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refInfo.name, path])

  useEffect(() => {
    if (!codeNavInfo || !workerManagerRef.current) {
      return
    }
    if (searchTerm === '') {
      setSearchResults([])
      setFocusedSearchResult(0)
      setSearchStatus('done')
      lastSearchTerm.current = ''
    } else if (lastSearchTerm.current === searchTerm || !validSearchTerm(searchTerm)) {
      return
    } else {
      setSearchStatus('pending')
      const canDoIncrementalSearch = lastSearchTerm.current.length > 0 && searchTerm.startsWith(lastSearchTerm.current)
      workerManagerRef.current.post({
        query: searchTerm,
        lines: codeNavInfo.blobLines,
        currentCodeReferences: canDoIncrementalSearch ? searchResults : undefined,
      })
    }

    // We only want to trigger an update when the search term changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  return {
    focusedSearchResult,
    setFocusedSearchResult,
    searchResults,
    setSearchResults,
    searchStatus,
  }
}

function validSearchTerm(searchTerm: string) {
  return searchTerm.length > 0 && searchTerm.length <= 1000
}
