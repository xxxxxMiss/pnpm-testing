### Observable、Observer 是什么

### Observable 特点之**lazy**

> 生成一个 Observable 并不会立即执行，只有等到`subscribe`才开始执行。所以对于初学者来说，很多时候发现代码没有执行，很大可能性就是忘记订阅了

```ts
useEffect(() => {
  const interval$ = interval(1000).pipe(
    take(5),
    tap(x => console.log('x: ', x))
  )
  // 如果没有订阅，那么看不到任何输出
  // interval$.subscribe()
}, [])
```

### Observable 特点之**cold**

> 每一次 subscribe，都是一次新的订阅，源码如下

```ts
class Observable<T> {
  subscribe(
    observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null
  ): Subscription {
    const subscriber = isSubscriber(observerOrNext)
      ? observerOrNext
      : new SafeSubscriber(observerOrNext, error, complete)
    return subscriber
  }
}
```

```ts
useEffect(() => {
  const btn$ = fromEvent(btnRef.current!, 'click')
  // 第一订阅
  const subscription1 = btn$.subscribe(() => {
    console.log('event1')
    subscription1.unsubscribe()
  })
  // 第二次订阅
  const subscription2 = btn$.subscribe(() => {
    console.log('event2')
  })
  console.log('isEqual: ', subscription1 === subscription2)
}, [])
```

> 查看[01demo]()，subscribe 了两次，并且打印出 subscription1 和 subscription2 的引用比较的结果，可以看到确实不相等 。然后在第一次 subscribe 中执行`subscription1.unsubscribe`，可以看到第一次的订阅被解绑，但是第二的订阅可以执行
