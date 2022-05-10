import { Alert, Button, Divider } from 'antd'
import { useRefFn } from 'observable-hooks'
import { Component, ReactNode, useEffect, useRef, useState } from 'react'
import {
  first,
  fromEvent,
  interval,
  Observable,
  Subscription,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs'
import Article from './README.mdx'

export const Demo = () => {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const subscription = interval(1000).subscribe(setCounter)
    return () => {
      // 如果这个地方忘记清除计时器
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {/* @ts-ignore */}
      <Article />
      <Alert message={`一个简单的计数器: ${counter}`} />
      <Divider />
      <Demo2 />
      <Divider />
      <Demo3 />
      <Divider />
      <Demo4 />
      <Divider />
      <Demo5 />
      <Divider />
      <Demo6 />
    </>
  )
}

interface IState {
  counter: number
  counter2?: number
}

class Demo2 extends Component<{}, IState> {
  interval: Subscription
  state = {
    counter: 0,
  }
  componentDidMount() {
    // 在componentDidMount生命周期中开启一个计时器
    this.interval = interval(1000).subscribe(x => {
      this.setState({
        counter: x,
      })
    })
  }

  componentWillUnmount() {
    // 在componentWillUnmount生命周期中取消计时器
    this.interval.unsubscribe()
  }

  render(): ReactNode {
    const { counter } = this.state
    return <div>使用类组件计数：{counter}</div>
  }
}

/**
 * 在类组件的不通生命周期中收集和取消多个订阅
 */
class Demo3 extends Component<{}, IState> {
  // 定义一个数组来收集多个订阅
  intervals: Subscription[] = []
  state = {
    counter: 0,
    counter2: 0,
  }
  componentDidMount() {
    const t1 = interval(1000).subscribe(x => {
      this.setState({
        counter: x,
      })
    })
    const t2 = interval(2000).subscribe(x => {
      this.setState({
        counter2: x,
      })
    })
    this.intervals.push(t1, t2)
  }

  componentWillUnmount() {
    // 取消多个订阅
    this.intervals.forEach(subscription => {
      subscription.unsubscribe()
    })
  }

  render(): ReactNode {
    const { counter, counter2 } = this.state
    return (
      <>
        <div>使用类组件计数1：{counter}</div>
        <div>使用类组件计数2：{counter2}</div>
      </>
    )
  }
}

/**
 *
 * 在hooks中收集和取消多个订阅
 */
const Demo4 = () => {
  const [counter1, setCounter1] = useState(0)
  const [counter2, setCounter2] = useState(0)

  const subscriptionRef = useRefFn(() => new Subscription())

  useEffect(() => {
    const subscription = interval(1000).subscribe(setCounter1)
    // 收集订阅
    subscriptionRef.current.add(subscription)

    return () => {
      // 取消订阅
      subscriptionRef.current.unsubscribe()
    }
  }, [])

  const handleClick = () => {
    const subscription = interval(1000).subscribe(setCounter2)
    // 收集订阅
    subscriptionRef.current.add(subscription)
  }

  return (
    <>
      <Alert type="info" message={`立即初始化一个计时器${counter1}`} />
      <Alert type="success" message={`点击按钮产生一个计时器${counter2}`} />
      <Button onClick={handleClick}>点击开启一个计时器</Button>
    </>
  )
}

const Demo5 = () => {
  const subscriptionRef = useRef<Subscription>()
  const [counter, setCounter] = useState(0)
  useEffect(() => {
    const obs$ = new Observable<number>(observer => {
      let x = 0
      setInterval(() => {
        console.log('--demo5--', x)
        observer.next(x++)
      }, 1000)
    })
    subscriptionRef.current = obs$.subscribe(setCounter)
  }, [])

  const handleClick = () => {
    subscriptionRef.current?.unsubscribe()
  }

  return (
    <>
      <Alert message={`counter： ${counter}`} />
      <Button onClick={handleClick}>取消订阅</Button>
    </>
  )
}

const Demo6 = () => {
  const [counter, setCounter] = useState(0)
  const [counter1, setCounter1] = useState(0)
  const [counter2, setCounter2] = useState(0)
  const [counter3, setCounter3] = useState(0)

  useEffect(() => {
    // 拿到前10个数（0-9）后自动取消订阅
    interval(1000).pipe(take(10)).subscribe(setCounter)

    // 只要x小于5，就一直吐出值到下游；一旦x大于等于5立马取消订阅
    interval(1000)
      .pipe(takeWhile(x => x < 5))
      .subscribe(setCounter1)

    // 一直在吐出值，但是因为x不满足条件(x > 8)，所以并不会吐出值给订阅者；一旦出现第一个满足条件的值(9)，吐给订阅者之后立马取消订阅
    interval(1000)
      .pipe(
        // 可以通过在tap操作符查看打印的值，但是因为不满足条件，所以没有吐给订阅者
        tap(x => console.log('first operator: ', x)),
        first(x => x > 8)
      )
      .subscribe(setCounter2)

    // 通过另外一个流来通知是否取消订阅
    // 这里我们通过popstate事件流来通知取消计时器
    interval(1000)
      .pipe(takeUntil(fromEvent(window, 'popstate')))
      .subscribe(setCounter3)
  }, [])
  return (
    <>
      <Alert message={`10s后自动取消订阅: ${counter}`} />
      <Alert message={`当计数大于4后自动取消订阅: ${counter1}`} />
      <Alert message={`10s后自动取消订阅: ${counter2}`} />
      <Alert message={`当切换路由时自动取消订阅: ${counter3}`} />
    </>
  )
}
