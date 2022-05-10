### Rxjs 操作符

> 在 Rxjs 中，操作符就是一个个的函数，我们可以使用这些函数来操作**Observable**产生的数据流：比如对这些数据流进行过滤，合并，转换等。

### Rxjs 常用操作操作符

> Rxjs 提供了大量的操作符，具体可以参考[官方文档](https://rxjs.dev/guide/operators)。我们这里只讲常用的一些，可以分为如下几类：

#### 创建类

- ajax
- defer
- empty
- from
- fromEvent
- interval
- of
- throwError
- timer

#### 组合类

- combineLatest
- concat
- forkJoin
- merge
- race
- zip

#### 过滤类

- debounce
- debounceTime
- distinctUntilChanged
- filter
- first
- takeUntil
- takeWhile
- throttle
- throttleTime

#### 转换类

- concatMap
- exhaustMap
- map
- mergeMap
- scan
- switchMap

#### 错误处理类

- catchError
- retry

#### 多播类

- share

#### 工具类

- tap
- delay
- observeOn
- subscribeOn

### pipe

> 可以理解为一个产品的出厂过程：一个原始的材料，经过多道工序加工最终出厂。这里的多道工序就是一个个的操作符，而 pipe 的作用就是将一个个独立的工序组装到一起，最终形成产品。

```ts
// observable of values from a text box, pipe chains operators together
inputValue
  .pipe(
    // wait for a 200ms pause
    debounceTime(200),
    // if the value is the same, ignore
    distinctUntilChanged(),
    // if an updated value comes through while request is still active cancel previous request and 'switch' to new observable
    switchMap(searchTerm => typeaheadApi.search(searchTerm))
  )
  // create a subscription
  .subscribe(results => {
    // update the dom
  })
```

#### 操作符实战

- 常见的一个需求：在输入框中输入关键字触发请求

```ts
useEffect(() => {
  // 通过fromEvent操作符给输入框绑定input事件
  const subscription = fromEvent<ChangeEvent<HTMLInputElement>>(
    inputRef.current?.input!,
    'input'
  )
    .pipe(
      // 延迟350毫秒吐出值给下游
      debounceTime(350),
      // 从吐出的事件对象中拿到value
      map(e => e.target.value),
      // 如果两次输入拿的值是一样的，并不会吐出值给下游：比如你上一次输入的值是12，然后追加输入3，
      // 然后又快速的删除3，那么对于distinctUntilChanged操作符来说，两次输入的值并没有发生改变，所以并不会吐出值给下游
      distinctUntilChanged(),
      // 通过switchMap切换到另外一个流：ajax是rxjs提供的一个用来发送Ajax请求的操作符
      switchMap(value => {
        return ajax<AjaxResponse<TopicListItem[]>>({
          url: 'https://cnodejs.org/api/v1/topics',
          method: 'GET',
          queryParams: {
            limit: 5,
            test: value,
          },
        }).pipe(
          // 通过map操作符拿到ajax操作符吐出的请求结果
          map(res => {
            const { data, success } = res.response
            return success ? data : []
          })
        )
      })
    )
    .subscribe(list => {
      // 订阅最终的结果，通过setState触发视图的更新
      setList(list)
    })

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

- 在输入框中输入一个数字，整数或者负数，敲击回车键之后，从当前值递增或者递减到输入的值

```ts
useEffect(() => {
  let currentNumber = 0
  // 给输入框绑定一个keyup事件
  const subscription = fromEvent<ChangeEvent<HTMLInputElement>>(
    counterRef.current!,
    'keyup'
  )
    .pipe(
      // 我们会敲击各个按键，过滤出Enter按键产生的事件源对象
      filter(e => e['code'] === 'Enter'),
      // 从事件源对象上拿到输入框输入的值，并转化成int类型吐到下游
      map(e => parseInt(e.target.value)),
      // 通过switchMap切换到另外一个流
      switchMap(endRange => {
        const val = positiveOrNegative(endRange, currentNumber)
        // 通过timer产生一个计时器，传入第二个参数50，表示每间隔50毫秒产生一个递增的数字
        return timer(0, 50).pipe(
          // 在rxjs V7之前的版本中有个mapTo操作符，
          // 在V7中已经标记为过期了，使用map操作符可以完成同样的功能
          // 将timer操作符吐出的值映射到一个常量值1或者-1
          map(() => val),
          // 通过startWith操作符给timer一个初始值，如果没有给，那么timer每次从0开始产生递增的序列
          startWith(currentNumber),
          // scan类似于JS中数组的reduce函数，可以将多个值合并到一个单值
          scan((acc, curr) => acc + curr),
          // 因为是通过一个计时器产生累加或者累减的效果，所以必须在一个合适的时机取消计时器
          // 这个地方通过takeWhie操作符结束timer计时器
          takeWhile(takeUntilFunc(endRange, currentNumber))
        )
      }),
      // tap操作符一般用来调试，它并不会改变上游吐出的数据
      // 这个地方用来记录currentNumber变量
      tap(v => (currentNumber = v)),
      startWith(currentNumber)
    )
    // 通过setState设置结果渲染视图
    .subscribe(setCounter)

  return () => {
    subscription.unsubscribe()
  }
}, [])
```
