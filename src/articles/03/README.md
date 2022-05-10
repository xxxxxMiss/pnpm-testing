## 高阶 Observable

> 前面介绍的`map`, `filter`等操作符，很好理解，因为可以和 JS 数组的`map`,`filter`一一对应，他们返回的都是普通的数据，如字符串、数字等。但是很多时候，我们返回的数据并不是简单数据类型，而是一个`Observable`，这种操作`Observable`的`Observable`，就叫高阶`Observable`。

## 高阶操作符

> Rxjs 中和高阶`Observable`相关的操作符有：

### 组合类

- combineLatestAll
- concatAll
- exhaustAll
- mergeAll
- switchAll
- withLatestFrom

### 转化类

- concatMap
- exhaustMap
- mergeMap
- switchMap

### switchMap

> 将源`Observable`（记为 S）中吐出的值映射到一个新的`Observable`（记为 O），我们最终订阅的数据是从这个**O**上订阅。当下一次**S**吐出的值被映射到**O**时，那么`switchMap`内部会退订上一次产生的**O**，重新订阅这一次产生的**O**。

一个常见的例子：点击按钮触发一个请求。如果我们不对这个点击事件做任何处理的话，那么每一次点击都会触发一次请求。如果网络很差的时候，用户连续点击好几次，那么就会触发多次请求。现在我们可以使用`switchMap`来规避这种情况：如果上次的请求还没回来，用户不停的点击，那么会自动取消上一次的请求。

### exhaustMap

> 将源`Observable`（记为 S）中吐出的值映射到一个新的`Observable`（记为 O），我们最终订阅的数据是从这个**O**上订阅。只有等到上一次的**O**完成（complete）时，才会去订阅这一次产生的**O**。

可以通过如下的例子来查看他们的区别：

```tsx
const Demo = () => {
  const notify$Ref = useRefFn(() => new Subject<'switchMap' | 'exhaustMap'>())
  const fetchTopics = useTestTopics()

  // 使用switchMap
  useEffect(() => {
    const subscription = notify$Ref.current
      .pipe(switchMap(signal => (signal === 'switchMap' ? fetchTopics : EMPTY)))
      .subscribe(() =>
        notification.success({
          message: '使用switchMap控制',
          description: '快速点击，会将前一次的请求取消',
        })
      )

    return () => subscription.unsubscribe()
  }, [])

  // 使用exhaustMap
  useEffect(() => {
    const subscription = notify$Ref.current
      .pipe(
        exhaustMap(signal => (signal === 'exhaustMap' ? fetchTopics : EMPTY))
      )
      .subscribe(() =>
        notification.success({
          message: '使用exhaustMap控制',
          description: '快速点击，只会等到前一次的请求完成，才会接受下一次请求',
        })
      )
    return () => subscription.unsubscribe()
  }, [])

  const handleClick = () => {
    fetchTopics.subscribe(() =>
      notification.success({
        message: '不做任何控制',
        description: '快速点击发送多次请求',
      })
    )
  }

  return (
    <>
      <Alert
        showIcon
        type="info"
        message="打开devtools切换到网络请求面板，查看使用不同操作操作符请求的发送情况"
      />
      <Divider>不做任何点击控制的请求</Divider>
      <Button onClick={handleClick}>点击发送请求</Button>
      <Divider>使用最后一次点击的请求，之前全部取消</Divider>
      <Button onClick={() => notify$Ref.current.next('switchMap')}>
        使用switchMap发送请求
      </Button>
      <Divider>必须等前一次的响应完成，才接受下一次请求</Divider>
      <Button onClick={() => notify$Ref.current.next('exhaustMap')}>
        使用exhaustMap发送请求
      </Button>
    </>
  )
}
```
