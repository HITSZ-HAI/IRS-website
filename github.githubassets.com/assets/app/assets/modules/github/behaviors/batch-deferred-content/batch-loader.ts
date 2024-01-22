type AutoFlushingQueueEntry<ElementType> = [ElementType, string]
class AutoFlushingQueue<ElementType = HTMLElement> {
  timeout: number
  limit: number
  elements: Array<AutoFlushingQueueEntry<ElementType>> = []
  timer: number | null = null
  callbacks: Array<(elementsToFlush: Array<AutoFlushingQueueEntry<ElementType>>) => Promise<void>> = []
  index: number

  constructor(timeout = 50, limit = 30) {
    this.timeout = timeout // flush timeout in milliseconds
    this.limit = limit // max number of elements before autoflushing
    this.index = 0
  }

  push(element: ElementType): string {
    const key = `item-${this.index++}`

    if (this.timer) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    if (this.elements.length >= this.limit) {
      this.flush()
    }

    this.timer = window.setTimeout(() => {
      this.timer = null
      this.flush()
    }, this.timeout)

    this.elements.push([element, key])
    return key
  }

  onFlush(callback: (elementsToFlush: Array<AutoFlushingQueueEntry<ElementType>>) => Promise<void>): void {
    this.callbacks.push(callback)
  }

  private async flush(): Promise<void> {
    const elementsToFlush = this.elements.splice(0, this.limit)
    if (elementsToFlush.length === 0) return

    await Promise.all(this.callbacks.map(callback => callback(elementsToFlush)))
  }
}

interface HTMLElementWithInputs extends HTMLElement {
  inputs: HTMLInputElement[]
}

export class BatchLoader<ResponseType> {
  autoFlushingQueue: AutoFlushingQueue<HTMLElementWithInputs>
  url: string
  callbacks: Map<string, (value: ResponseType) => void>
  validate: (value: unknown) => asserts value is ResponseType

  constructor(url: string, validator: (value: unknown) => asserts value is ResponseType) {
    this.url = url
    this.callbacks = new Map()
    this.autoFlushingQueue = new AutoFlushingQueue()
    this.autoFlushingQueue.onFlush(async elements => {
      this.load(elements)
    })
    this.validate = validator
  }

  loadInBatch(element: HTMLElementWithInputs): Promise<ResponseType> {
    const key = this.autoFlushingQueue.push(element)
    return new Promise(resolve => this.callbacks.set(key, resolve))
  }

  async load(elements: Array<AutoFlushingQueueEntry<HTMLElementWithInputs>>) {
    const elementsByKey = new Map<string, HTMLElementWithInputs>()

    for (const [batchElement, key] of elements) {
      elementsByKey.set(key, batchElement)
    }

    const consolidatedData = new FormData()

    for (const [key, batchElement] of elementsByKey.entries()) {
      for (const input of batchElement.inputs) {
        consolidatedData.append(`items[${key}][${input.name}]`, input.value)
      }
    }

    if (Array.from(consolidatedData.values()).length === 0) {
      return
    }

    consolidatedData.set('_method', 'GET')
    const response = await fetch(this.url, {
      method: 'POST',
      body: consolidatedData,
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    if (response.ok) {
      const json = await response.json()

      if (!json || typeof json !== 'object' || Array.isArray(json)) {
        throw new Error('Malformed batch response')
      }

      for (const key in json) {
        const callback = this.callbacks.get(key)
        if (callback) {
          const value = json[key]
          this.validate(value)
          callback(value)
        }
      }
    }
  }
}
