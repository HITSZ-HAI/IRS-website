import type {SafeHTMLString} from '@github-ui/safe-html'

export type CopilotChatRepo = {
  id: number
  name: string
  ownerLogin: string
  ownerType: 'User' | 'Organization'
  readmePath?: string
  description?: string
  commitOID: string
  ref: string
  refInfo: {
    name: string
    type: 'branch' | 'tag'
  }
  visibility: string
}

export type CopilotChatThread = {
  id: string
  name: string
  repoID?: number
  currentReferences: CopilotChatReference[]
  createdAt: string
  updatedAt: string
}

export type CopilotChatMessage = {
  id: string
  intent?: string
  role: 'user' | 'assistant'
  content?: string
  createdAt: string
  threadID: string
  error?: ChatError
  references: CopilotChatReference[] | null
}

export type RepositoryReference = CopilotChatRepo & {
  type: 'repository'
}

export type FileReference = {
  type: 'file'
  url: string
  path: string
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
}

export interface FileReferenceDetails extends FileReference {
  contents: string
  highlightedContents: SafeHTMLString[]
  repoIsOrgOwned: boolean
  range: LineRange
  expandedRange: LineRange
}

export interface FileDiffReference {
  type: 'file-diff'
  id: string
  url: string
  base: SnippetReference | null // will be null if a file was 'added'
  head: SnippetReference | null // will be null if a file was 'removed'
  // user-selected, shown in location.hash, ex L1-R5
  // won't be populated in the server props but should be present when calling CAPI
  selectedRange?: {
    start?: string
    end?: string
  }
}

export interface SnippetReference {
  type: 'snippet'
  url: string
  path: string
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  range: LineRange
  languageID?: number
  languageName?: string
  title?: string
}

export interface SnippetReferenceDetails extends SnippetReference {
  contents: string
  highlightedContents: SafeHTMLString[]
  repoIsOrgOwned: boolean
  expandedRange: LineRange
}

export interface CommitReference {
  type: 'commit'
  oid: string
  message: string
  permalink: string
  author: {
    name: string
    email: string
    login: string
  }
  repository: CopilotChatRepo
}

export interface PullRequestReference {
  type: 'pull-request'
  title: string
  url: string
  commit?: string
  authorLogin: string
  repository: CopilotChatRepo
}

export interface LineRange {
  start: number
  end: number
}

export interface CodeNavSymbolReference {
  type: 'symbol'
  kind: 'codeNavSymbol'
  name: string
  languageID?: number
  codeNavDefinitions?: CodeNavSymbol[]
  codeNavReferences?: CodeReference[]
  languageName?: string
}

export interface CodeNavSymbolReferenceDetails extends CodeNavSymbolReference {
  codeNavDefinitions?: CodeNavSymbolDetails[]
  codeNavReferences?: CodeReferenceDetails[]
}

export interface SuggestionSymbolReference {
  type: 'symbol'
  kind: 'suggestionSymbol'
  name: string
  languageID?: number
  suggestionDefinitions?: SuggestionSymbol[]
}

export interface SuggestionSymbolReferenceDetails extends SuggestionSymbolReference {
  suggestionDefinitions?: SuggestionSymbolDetails[]
}

export type DocsetReference = {
  type: 'docset'
  name: string
  scopingQuery: string // TODO: is this the correct name for CAPI?
}

type CodeNavSymbol = {
  ident: Range
  extent: Range
} & CodeSymbol

type SuggestionSymbol = {
  identOffset?: ByteOffset
  extentOffset?: ByteOffset
} & CodeSymbol

type CodeSymbol = {
  kind: string
  fullyQualifiedName: string
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  path: string
}

type CodeReference = {
  ident: Range
  repoID: number
  repoOwner: string
  repoName: string
  ref: string
  commitOID: string
  path: string
}

type SymbolDetails = {
  repoIsOrgOwned: boolean
  highlightedContents?: SafeHTMLString[]
  range?: LineRange
}

export type CodeNavSymbolDetails = CodeNavSymbol & SymbolDetails
export type SuggestionSymbolDetails = SuggestionSymbol & SymbolDetails
export type CodeReferenceDetails = CodeReference & SymbolDetails

type Range = {
  start: Position
  end: Position
}

type Position = {
  line: number
  column: number
}

type ByteOffset = {
  start: number
  end: number
}

export type CopilotChatReference =
  | FileReference
  | SnippetReference
  | FileDiffReference
  | RepositoryReference
  | CodeNavSymbolReference
  | SuggestionSymbolReference
  | DocsetReference
  | CommitReference
  | PullRequestReference

export type NumberedCopilotChatReference = CopilotChatReference & {n: number}

export type CopilotChatReferenceDetails = SnippetReferenceDetails

export type ReferenceDetails<TReference extends CopilotChatReference> = TReference extends SnippetReference
  ? SnippetReferenceDetails
  : TReference extends FileReference
    ? FileReferenceDetails
    : TReference extends CodeNavSymbolReference
      ? CodeNavSymbolReferenceDetails
      : TReference extends SuggestionSymbolReference
        ? SuggestionSymbolReferenceDetails
        : unknown

type CopilotChatExplainEventPayload = {
  intent: typeof CopilotChatIntents.explain
  content: string
  references: CopilotChatReference[]
}

type CopilotChatAskEventPayload = {
  intent: typeof CopilotChatIntents.conversation
  references: CopilotChatReference[]
}

type CopilotChatAskPrEventPayload = {
  intent: typeof CopilotChatIntents.discussFileDiff
  references: CopilotChatReference[]
}

type CopilotChatExplainPrEventPayload = {
  intent: typeof CopilotChatIntents.explainFileDiff
  content: string
  references: CopilotChatReference[]
}

type CopilotChatSuggestEventPayload = {
  intent: typeof CopilotChatIntents.suggest
  content: string
  references: CopilotChatReference[]
}

export type CopilotChatEventPayload =
  | CopilotChatExplainEventPayload
  | CopilotChatAskEventPayload
  | CopilotChatSuggestEventPayload
  | CopilotChatAskPrEventPayload
  | CopilotChatExplainPrEventPayload

export const CopilotChatIntents = {
  explain: 'explain',
  conversation: 'conversation',
  suggest: 'suggest',
  askDocs: 'ask-docs',
  discussFileDiff: 'discuss-file-diff',
  explainFileDiff: 'explain-file-diff',
} as const
export type CopilotChatIntentsType = (typeof CopilotChatIntents)[keyof typeof CopilotChatIntents]

interface ChatError {
  isError: boolean
  message?: string
}

export type BlackbirdSymbol = {
  fully_qualified_name: string
  kind: string
  ident_start: number
  ident_end: number
  extent_start: number
  extent_end: number
}

export interface BlackbirdSuggestion {
  kind: string
  query: string
  repository_nwo: string
  language_id: number
  path: string
  repository_id: number
  commit_sha: string
  line_number: number
  symbol: BlackbirdSymbol | null
}

export type SuggestionsResponse = {
  suggestions: BlackbirdSuggestion[]
  queryErrors: string[]
  failed: boolean
}

export interface Docset {
  id: string
  name: string
  description: string
  createdByID: number
  ownerID: number
  ownerType: string
  visibility: string
  scopingQuery: string
  repos: string[]
  visibleOutsideOrg: boolean
  iconHtml: SafeHTMLString
  avatarUrl: string
  adminableByUser: boolean
}

export interface RepoData {
  name: string
  nameWithOwner: string
  isInOrganization: boolean
  shortDescriptionHTML: string
  owner: {
    avatarUrl: string
    login: string
  }
}

export interface DocsetRepo extends RepoData {
  paths: string[]
}

export type MessageStreamingResponse =
  | MessageStreamingResponseContent
  | MessageStreamingResponseError
  | MessageStreamingResponseComplete
  | MessageStreamingResponseDebug

export type MessageStreamingResponseContent = {
  type: 'content'
  body: string
}

export type MessageStreamingResponseDebug = {
  type: 'debug'
  body: string
}

export type MessageStreamingResponseError = {
  type: 'error'
  errorType: 'exception' | 'filtered' | 'contentTooLarge' | 'rateLimit'
  description: string
}

export type MessageStreamingResponseComplete = {
  type: 'complete'
  id: string
  turnID: string
  createdAt: string
  intent: string
  references: CopilotChatReference[] | null
}

export type CopilotChatAPIToken = {
  token: string
  expiration: string
}
