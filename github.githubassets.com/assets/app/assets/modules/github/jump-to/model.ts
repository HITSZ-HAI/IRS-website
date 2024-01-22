import {buildProjectKey, buildRepositoryKey, buildTeamKey, getPageViewsMap} from './page-views'

export type Suggestion = {
  avatarUrl: string | null
  databaseId: number
  name: string
  number: number | null
  owner: {name: string} | null
  path: string
  rank: number
  type: 'Project' | 'Repository' | 'Team'
  pageKey: string
}

type ErrorResponse = {
  data: {
    errors: unknown[]
  }
}
type SuccessResponse = {
  data: {
    suggestions: {
      nodes: Array<Suggestion | null>
    }
  }
}
type SuggestionsResponse = ErrorResponse | SuccessResponse

export function getSuggestionsRequestData(maxPageViews: number): FormData {
  const data = new FormData()
  for (const pageKey of Object.keys(getPageViewsMap()).slice(0, maxPageViews)) {
    data.append('variables[pageViews][]', pageKey)
  }

  return data
}

export function parseSuggestionsResponse(response: SuggestionsResponse): Suggestion[] {
  if ('errors' in response.data) return []

  let i = 1
  const suggestions = []
  for (const suggestion of response.data.suggestions.nodes) {
    if (suggestion == null) continue
    // Fill in the rank as reported by the server.
    suggestion.rank = i++
    suggestion.pageKey = pageKeyFromSuggestion(suggestion)
    if (suggestion.type === 'Team') {
      suggestion.name = `@${suggestion.name}`
    }
    suggestions.push(suggestion)
  }

  return suggestions
}

export function buildSearchURL(searchPath: string, queryText: string): string {
  const url = new URL(searchPath, window.location.origin)
  const searchParams = new URLSearchParams(url.search.slice(1))

  searchParams.set('q', queryText)

  // persist the "type" of the search results page if there is one
  const searchType = new URLSearchParams(window.location.search).get('type')
  if (searchType) {
    searchParams.set('type', searchType)
  }

  url.search = searchParams.toString()
  return url.toString()
}

export function updateSearchURL(queryText: string, href: string): string {
  const url = new URL(href, window.location.origin)
  const searchParams = new URLSearchParams(url.search.slice(1))

  if (searchParams.get('q')) {
    searchParams.set('q', queryText)
  }

  url.search = searchParams.toString()
  return url.toString()
}

function pageKeyFromSuggestion(suggestion: Suggestion): string {
  let key: string
  const [ownerLogin, repositoryName] = suggestion.name.split('/') || []
  switch (suggestion.type) {
    case 'Project':
      key = buildProjectKey(suggestion.owner!.name, `${suggestion.number}`)
      break
    case 'Repository':
      key = buildRepositoryKey(ownerLogin!, repositoryName!)
      break
    case 'Team':
      key = buildTeamKey(ownerLogin!, repositoryName!)
      break
    default:
      throw new Error(`Invalid Suggestion type: ${suggestion.type}`)
  }
  return key
}
