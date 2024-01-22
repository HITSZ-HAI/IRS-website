export class Deferred<T> {
  resolve: (value: T) => unknown
  reject: (reason?: unknown) => unknown
  promise: Promise<T>

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
