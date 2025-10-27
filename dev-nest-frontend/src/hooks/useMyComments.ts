import { useCallback, useEffect, useState } from 'react'
import { commentsApi, type UserComment, type UserCommentListResponse } from '../services/commentsApi'

type UseMyCommentsResult = {
  comments: UserComment[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  totalElements: number
}

const DEFAULT_PAGE_SIZE = 5

export const useMyComments = (accessToken: string | null): UseMyCommentsResult => {
  const [comments, setComments] = useState<UserComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalElements, setTotalElements] = useState(0)

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      if (!accessToken) {
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response: UserCommentListResponse = await commentsApi.fetchMyComments(accessToken, {
          page: pageToLoad,
          size: DEFAULT_PAGE_SIZE,
        })
        setComments((prev) => (replace ? response.items : [...prev, ...response.items]))
        setPage(pageToLoad + 1)
        setHasMore(response.page + 1 < response.totalPages)
        setTotalElements(response.totalElements)
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : '내 댓글을 불러오지 못했습니다.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [accessToken],
  )

  useEffect(() => {
    setComments([])
    setPage(0)
    setHasMore(false)
    setTotalElements(0)
    setError(null)

    if (!accessToken) {
      return
    }

    loadPage(0, true)
  }, [accessToken, loadPage])

  const loadMore = useCallback(() => {
    if (!accessToken || isLoading || !hasMore) {
      return
    }
    loadPage(page, false)
  }, [accessToken, hasMore, isLoading, loadPage, page])

  return { comments, isLoading, error, hasMore, loadMore, totalElements }
}
