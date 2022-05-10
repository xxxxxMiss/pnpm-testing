import { get } from '../../utils/request'

export interface ITopicsResponse {
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
