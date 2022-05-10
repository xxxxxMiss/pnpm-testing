import { Alert, Button, Divider, notification } from 'antd'
import { useRefFn } from 'observable-hooks'
import { useEffect } from 'react'
import { EMPTY, exhaustMap, Subject, switchMap } from 'rxjs'
import { useTestTopics } from '../../hooks/useTestTopics'
import Article from './README.md'

export const Demo = () => {
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
      <Article />
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
