import { useCallback, useEffect, useState } from 'react'
import { postsApi, type PostListResponse, type PostSummary } from '../services/postsApi'

type UseMyPostsResult = {
  posts: PostSummary[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  totalElements: number
  totalViews: number
  totalLikes: number
}

const DEFAULT_PAGE_SIZE = 5

export const useMyPosts = (accessToken: string | null): UseMyPostsResult => {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [totalElements, setTotalElements] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [totalLikes, setTotalLikes] = useState(0)

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      if (!accessToken) {
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response: PostListResponse = await postsApi.fetchMyPosts(accessToken, {
          page: pageToLoad,
          size: DEFAULT_PAGE_SIZE,
        })
        setPosts((prev) => (replace ? response.items : [...prev, ...response.items]))
        setPage(pageToLoad + 1)
        setHasMore(response.page + 1 < response.totalPages)
        setTotalElements(response.totalElements)
        setTotalViews(response.totalViews)
        setTotalLikes(response.totalLikes)
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : '내 포스트를 불러오지 못했습니다.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [accessToken],
  )

  useEffect(() => {
    setPosts([])
    setPage(0)
    setHasMore(false)
    setTotalElements(0)
    setTotalViews(0)
    setTotalLikes(0)
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

  return { posts, isLoading, error, hasMore, loadMore, totalElements, totalViews, totalLikes }
}
