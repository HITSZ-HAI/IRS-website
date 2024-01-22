import {useCurrentBlame} from './CurrentBlame'
import {useCurrentBlob} from './CurrentBlob'

export enum BlobDisplayType {
  FileRenderer = 'FileRenderer',
  Image = 'Image',
  TooLargeError = 'TooLargeError',
  CSV = 'CSV',
  Markdown = 'Markdown',
  IssueTemplate = 'IssueTemplate',
  Code = 'Code',
}

export function useBlobRendererType(): BlobDisplayType {
  const payload = useCurrentBlob()
  const blame = useCurrentBlame()

  if (payload.renderedFileInfo && !payload.shortPath && !blame) {
    return BlobDisplayType.FileRenderer
  } else if (payload.renderImageOrRaw) {
    if (payload.image) {
      return BlobDisplayType.Image
    } else {
      return BlobDisplayType.TooLargeError
    }
  } else if (payload.csv && !blame) {
    return BlobDisplayType.CSV
  } else if (payload.richText && !blame) {
    return BlobDisplayType.Markdown
  } else if (
    ((payload.issueTemplate?.structured && payload.issueTemplate.valid) ||
      (payload.discussionTemplate && payload.discussionTemplate.valid)) &&
    !blame &&
    !payload.isPlain
  ) {
    return BlobDisplayType.IssueTemplate
  } else {
    return BlobDisplayType.Code
  }
}
