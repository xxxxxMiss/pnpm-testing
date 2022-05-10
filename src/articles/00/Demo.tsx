import { Button, Divider } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { fromEvent, map, mergeWith, Observable, scan, Subject } from 'rxjs'

const useFnOnceRef = <T extends Observable<any>>(fn: () => T) => {
  const ref = useRef<T | null>(null)
  if (ref.current === null) {
    ref.current = fn()
  }
  return ref.current
}

export const Demo = () => {
  // React方式
  const [counter, setCounter] = useState(0)

  // Rxjs方式一
  const [rxCounter, setRxCounter] = useState(0)
  const click$ = useFnOnceRef(() => new Subject<number>())
  useEffect(() => {
    const subscription = click$
      .pipe(
        scan((acc, n) => {
          return acc + n
        })
      )
      .subscribe(setRxCounter)
    return () => subscription.unsubscribe()
  }, [])

  // Rxjs方式二
  const [rxCounter2, setRxCounter2] = useState(0)
  const bntRef1 = useRef<HTMLButtonElement | null>(null)
  const bntRef2 = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    const subscription = fromEvent(bntRef1.current!, 'click')
      .pipe(
        mergeWith(fromEvent(bntRef2.current!, 'click')),
        map(e => {
          return (e.currentTarget! as HTMLButtonElement).dataset['type'] ===
            'increase'
            ? 1
            : -1
        }),
        scan((acc, n) => acc + n, 0)
      )
      .subscribe(setRxCounter2)
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <Divider>React方式的计数器{counter}</Divider>
      <Button onClick={() => setCounter(prev => prev + 1)}>点击+1</Button>
      <Button onClick={() => setCounter(prev => prev - 1)}>点击-1</Button>
      <Divider>Rxjs实现的计数器方式一：{rxCounter}</Divider>
      <Button onClick={() => click$.next(1)}>点击+1</Button>
      <Button onClick={() => click$.next(-1)}>点击-1</Button>
      <Divider>Rxjs实现的计数器方式二：{rxCounter2}</Divider>
      <Button ref={bntRef1} data-type="increase">
        点击+1
      </Button>
      <Button ref={bntRef2} data-type="decrease">
        点击-1
      </Button>
    </>
  )
}
