import { useRefFn } from 'observable-hooks'
import { map } from 'rxjs'
import { ajax } from 'rxjs/ajax'

export const useTestTopics = () => {
  return useRefFn(() =>
    ajax<ApiResponse<TopicListItem[]>>({
      url: 'https://cnodejs.org/api/v1/topics',
      method: 'GET',
      queryParams: {
        limit: 5,
      },
    }).pipe(
      map(res => {
        const { status, response } = res
        if (status !== 200) {
          return []
        }
        const { success, data } = response
        if (!success) {
          return []
        }
        return data
      })
    )
  ).current
}
