import { Divider, Input, InputRef, Typography, InputNumber } from 'antd'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  scan,
  startWith,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { operators, create } from 'rxjs-spy'
import Article from './README.md'

const spy = create()

const { Paragraph, Link } = Typography

// utility functions
const takeUntilFunc = (endRange, currentNumber) => {
  return endRange > currentNumber
    ? val => val <= endRange
    : val => val >= endRange
}
const positiveOrNegative = (endRange, currentNumber) => {
  return endRange > currentNumber ? 1 : -1
}

export const Demo = () => {
  const counterRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<InputRef>(null)
  const [list, setList] = useState<TopicListItem[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const subscription = fromEvent<ChangeEvent<HTMLInputElement>>(
      inputRef.current?.input!,
      'input'
    )
      .pipe(
        debounceTime(350),
        map(e => e.target.value),
        distinctUntilChanged(),
        switchMap(value => {
          return ajax<ApiResponse<TopicListItem[]>>({
            url: 'https://cnodejs.org/api/v1/topics',
            method: 'GET',
            queryParams: {
              limit: 5,
              test: value,
            },
          }).pipe(
            map(res => {
              const { data, success } = res.response
              return success ? data : []
            })
          )
        })
      )
      .subscribe(list => {
        setList(list)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let currentNumber = 0
    const subscription = fromEvent<ChangeEvent<HTMLInputElement>>(
      counterRef.current!,
      'keyup'
    )
      .pipe(
        filter(e => e['code'] === 'Enter'),
        map(e => parseInt(e.target.value)),
        switchMap(endRange => {
          const val = positiveOrNegative(endRange, currentNumber)
          return timer(0, 50).pipe(
            map(() => val),
            startWith(currentNumber),
            scan((acc, curr) => acc + curr),
            takeWhile(takeUntilFunc(endRange, currentNumber)),
            operators.tag('timer')
          )
        }),
        tap(v => (currentNumber = v)),
        startWith(currentNumber)
      )
      .subscribe(setCounter)

    spy.log('timer')

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <Article />
      <Divider>输入触发请求</Divider>
      <Input ref={inputRef} />
      <Paragraph>
        <ul>
          {list.map(item => (
            <li key={item.id}>
              <Link href="/docs/spec/overview">{item.title}</Link>
            </li>
          ))}
        </ul>
      </Paragraph>

      <Divider>计数器</Divider>
      <InputNumber ref={counterRef} />
      <div>{counter}</div>
    </>
  )
}
