interface Observer<T> {
  next: (val: T) => void
  complete: () => void
  error: (e: any) => void
}

type Producer<T> = (subscriber: Observer<T>) => void

const noop = () => {}

class Observable<T> {
  constructor(public producer: Producer<T> = noop) {}

  subscribe(observer: Observer<T>) {}
}

export {}
