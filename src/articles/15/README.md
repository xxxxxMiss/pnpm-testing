### 使用 Rxjs 封装通用请求

> Rxjs 自带了 2 个发送的操作符，分别`ajax`,`fromFetch`，根据自己喜好，任选一个使用，导入路径如下：

```ts
// 使用XMLHttpRequest
import { ajax } from 'rxjs/ajax'
// 使用fetch
import { fromFetch } from 'rxjs/fetch'
```

我们这里使用[cnode](https://cnodejs.org/api)开放的 api 来演示，我们看下首页列表返回的数据结构：

```json
// https://cnodejs.org/api/v1/topics
// 这是其中的一条数据
{
  "success": true,
  "data": [
    {
      "id": "6262718079f90d94a6a0d2f5",
      "author_id": "4f447c2f0a8abae26e01b27d",
      "tab": "share",
      "content": "xxxx",
      "title": "中国 npm 镜像源升级公告",
      "last_reply_at": "2022-04-23T11:49:47.135Z",
      "good": false,
      "top": true,
      "reply_count": 4,
      "visit_count": 57254,
      "create_at": "2022-01-30T14:18:50.170Z",
      "author": {
        "loginname": "fengmk2",
        "avatar_url": "https://avatars.githubusercontent.com/u/156269?v=4&s=120"
      }
    }
  ]
}
```

因为我们项目使用**ts**开发的，所以我们先把类型定义好。对于一个接口，无非就是入参和返回值。
对于所有的接口而言，都有如下的通用类型，所以可以定义通用类型如下:

> 假设我们约定如果使用`interface`，那么定义类型的时候使用**I**开头；如果使用`type`定义 ，那么定义类型的时候使用**T**开头

```ts
// 通用的返回类型
interface IApiResponse<T> {
  success: boolean
  data: T
}
```

对于具体某一个接口而言，可以将泛型`T`填充为具体某一个接口类型，比如对于主题列表：

```ts
// https://cnodejs.org/api/v1/topics
interface ITopicsResponse {
  id: string
  author_id: string
  tab: string
  content: string
  title: string
  last_reply_at: string
  good: false
  top: true
  reply_count: number
  visit_count: number
  create_at: string
  author: {
    loginname: string
    avatar_url: string
  }
}

// https://cnodejs.org/api/v1/user/alsotang
interface IUseResponse {
  loginname: string
  avatar_url: string
  githubUsername: string
  create_at: string
  score: number
  recent_topics: [
    {
      id: string
      author: {
        loginname: string
        avatar_url: string
      }
      title: string
      last_reply_at: string
    }
  ]
  recent_replies: [
    {
      id: string
      author: {
        loginname: string
        avatar_url: string
      }
      title: string
      last_reply_at: string
    }
  ]
}
```

类型定义好之后，在`src/utils`下新建一个`request.ts`：

```ts
// src/utils/requst.ts
import { map } from 'rxjs'
import { ajax, AjaxConfig } from 'rxjs/ajax'

interface IApiResponse<T> {
  success: boolean
  data: T
}

interface ICustomConfig extends AjaxConfig {
  baseUrl?: string
  isLoading?: boolean
  isCache?: boolean
}

const request = <T>(config: ICustomConfig) => {
  const { isLoading, baseUrl = '', url, ...rest } = config
  let uri: string
  // 如果传入的baseUrl是个http或者https，就认为是一个完整的地址，不做拼接
  if (/^https?/.test(baseUrl)) {
    uri = baseUrl
  } else {
    // 否则拼接baseUrl：如果baseUrl为空，读取环境变量中配置的
    uri = (baseUrl || process.env.REACT_APP_BASE_URL) + url
  }

  return ajax<IApiResponse<T>>({ url: uri, ...rest }).pipe(
    map(res => {
      const { status, response } = res
      if (status !== 200) {
        return null
      }
      const { success, data } = response
      if (!success) {
        return null
      }
      return data
    })
  )
}

// 导出几个便捷的方法
export const get = <T>(
  url: string,
  queryParams?: any,
  config?: Omit<ICustomConfig, 'url' | 'queryParams' | 'method'>
) => {
  return request<T>({ ...config, url, queryParams, method: 'GET' })
}

export const post = <T>(
  url: string,
  body?: any,
  config?: Omit<ICustomConfig, 'url' | 'body' | 'method'>
) => {
  return request<T>({
    ...config,
    url,
    body,
    method: 'POST',
  })
}
```

> 以上代码就是目前我们使用 rxjs 封装的一个通用请求方法，目前还比较简洁，后面我们一步步的完善。下面我们使用它来发送一个**请求主题列表**并渲染到页面上。

新建文件`src/api/foo/api.ts`：

```ts
// 导入封装的get请求方法
import { get } from '../../utils/request'

// 定义接口返回的类型
interface ITopicsResponse {
  id: string
  author_id: string
  tab: string
  content: string
  title: string
  last_reply_at: string
  good: false
  top: true
  reply_count: number
  visit_count: number
  create_at: string
  author: {
    loginname: string
    avatar_url: string
  }
}
// 获取主题列表
export const topics = (params?: {
  page?: number
  tab?: 'ask' | 'share' | 'job' | 'good'
  limit?: number
  mdrender?: boolean
}) => {
  return get<ITopicsResponse[]>('/topics', params)
}
```

新建`src/pages/TopicList.tsx`：

```ts
import { Typography } from 'antd'
import { useEffect, useState } from 'react'
import { ITopicsResponse, topics } from '../../api/foo/api'

const { Paragraph, Link } = Typography

export const Demo = () => {
  const [list, setList] = useState<ITopicsResponse[]>([])

  useEffect(() => {
    // 这里发送请求
    const subscription = topics().subscribe(list => {
      if (list) setList(list)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
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
```

> 至此，渲染的列表如下：
