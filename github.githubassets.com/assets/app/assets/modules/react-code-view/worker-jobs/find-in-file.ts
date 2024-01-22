import {type Range, searchInBlobContent, searchInBlobIncrementally, textMatchable} from '@github-ui/code-nav'

import type {FindInFileRequest, FindInFileResponse} from '../hooks/use-in-file-search-results'

export function findInFileWorkerJob({data}: {data: FindInFileRequest}): FindInFileResponse {
  const {query, lines, currentCodeReferences} = data
  let output: Range[] = []

  // incremental search
  if (currentCodeReferences) {
    output = searchInBlobIncrementally(currentCodeReferences, lines, textMatchable(query))
  } else {
    output = searchInBlobContent(lines, textMatchable(query))
  }

  return {ranges: output, query}
}
