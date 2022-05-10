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
  if (/^https?/.test(baseUrl)) {
    uri = baseUrl
  } else {
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
