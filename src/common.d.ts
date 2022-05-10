interface ApiResponse<T> {
  data: T
  success: boolean
}

interface TopicListItem {
  author_id: string
  content: string
  create_at: string
  good: false
  id: string
  last_reply_at: string
  reply_count: number
  tab: string
  title: string
  top: boolean
  visit_count: number
}
