export function* filterMap<T, U>(items: T[], map: (item: T) => U | null | undefined): Iterable<U> {
  for (const item of items) {
    const value = map(item)
    if (value != null) {
      yield value
    }
  }
}
