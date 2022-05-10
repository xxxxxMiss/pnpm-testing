import { Button } from 'antd'
import { useEffect, useRef } from 'react'
import { fromEvent, interval, take, tap } from 'rxjs'

export const Demo = () => {
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const interval$ = interval(1000).pipe(
      take(5),
      tap(x => console.log('x: ', x))
    )
    // 如果没有订阅，那么看不到任何输出
    // interval$.subscribe()
  }, [])

  useEffect(() => {
    const btn$ = fromEvent(btnRef.current!, 'click')
    const subscription1 = btn$.subscribe(() => {
      console.log('event1')
      subscription1.unsubscribe()
    })
    const subscription2 = btn$.subscribe(() => {
      console.log('event2')
    })
    console.log('isEqual: ', subscription1 === subscription2)

    return () => {
      subscription2.unsubscribe()
    }
  }, [])

  return <Button ref={btnRef}>绑定2个事件</Button>
}
