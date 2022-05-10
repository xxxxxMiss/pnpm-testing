import { Typography } from 'antd'
import { useEffect, useState } from 'react'
import { ITopicsResponse, topics } from '../../api/foo/api'
import Article from './README.md'

const { Paragraph, Link } = Typography

export const Demo = () => {
  const [list, setList] = useState<ITopicsResponse[]>([])

  useEffect(() => {
    const subscription = topics().subscribe(list => {
      if (list) setList(list)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Article />
      <Paragraph>
        <ul>
          {list.map(item => (
            <li key={item.id}>
              <Link href="/docs/spec/overview">{item.title}</Link>
            </li>
          ))}
        </ul>
      </Paragraph>
    </>
  )
}
