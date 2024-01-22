import type {WebWorker} from './WebWorker'

export class DebouncedWorkerManager<TRequest, TResponse> {
  private currentRequest: TRequest | undefined = undefined
  private nextRequest: TRequest | undefined = undefined
  public onResponse: (response: TResponse) => void
  private delayId: NodeJS.Timeout

  constructor(
    private worker: Worker | WebWorker<TRequest, TResponse>,
    private delayMs = 200,
    private debounceOverrideCondition?: (req: TRequest) => boolean,
  ) {
    this.worker.onmessage = ({data}: {data: TResponse}) => {
      this.onResponse(data)
      if (this.nextRequest) {
        this.postNow(this.nextRequest)
        this.nextRequest = undefined
      } else {
        this.currentRequest = undefined
      }
    }
  }

  public post(request: TRequest) {
    if (this.debounceOverrideCondition && this.debounceOverrideCondition(request)) {
      if (this.delayId) {
        clearTimeout(this.delayId)
      }
      return this.postNow(request)
    }

    if (this.idle()) {
      if (this.delayId) {
        clearTimeout(this.delayId)
      }

      this.delayId = setTimeout(() => {
        this.postNow(request)
      }, this.delayMs)
    } else {
      this.nextRequest = request
    }
  }

  private postNow(request: TRequest) {
    this.currentRequest = request
    this.worker.postMessage(request)
  }

  public idle() {
    return !this.currentRequest
  }

  public terminate() {
    this.worker.terminate()
  }
}
