import type {Attachment} from '@github/file-attachment-element'

// A collection of files to be uploaded together. A batch reports progress of
// the collection rather than each individual file.
export default class Batch {
  attachments: Attachment[]
  size: number
  total: number
  failedAttachments: Attachment[]

  constructor(attachments: Attachment[]) {
    this.attachments = attachments
    this.failedAttachments = []

    // How many total files to upload.
    this.size = this.attachments.length

    // How many total bytes to upload.
    this.total = sum(this.attachments, a => a.file.size)
  }

  // The completion percentage of the batch as a whole.
  //
  // Returns a Number between 0 and 100.
  percent(): number {
    const bytes = (a: Attachment) => (a.file.size * a.percent) / 100
    const total = sum(this.attachments, bytes)
    return Math.round((total / this.total) * 100)
  }

  uploaded(): number {
    const value = (a: Attachment) => (a.isSaved() ? 1 : 0)
    return sum(this.attachments, value)
  }

  // The completion state of the batch.
  //
  // Returns true when all files have been uploaded.
  isFinished(): boolean {
    return this.attachments.every(attachment => this.failedAttachments.includes(attachment) || attachment.isSaved())
  }

  // Mark an attachment as failed in this batch
  setAttachmentAsFailed(attachment: Attachment) {
    if (this.attachments.includes(attachment) && !this.failedAttachments.includes(attachment)) {
      this.failedAttachments.push(attachment)
    }
  }
}

function sum<T>(items: T[], map: (item: T) => number): number {
  return items.reduce((total, item) => total + map(item), 0)
}
