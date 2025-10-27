import { useEffect, useState } from 'react'
import { postsApi, type PostSummary } from '../services/postsApi'

type UseMyPostsResult = {
  posts: PostSummary[]
  isLoading: boolean
  error: string | null
}

export const useMyPosts = (accessToken: string | null): UseMyPostsResult => {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(accessToken))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setPosts([])
      setIsLoading(false)
      setError(null)
      return
    }

    let active = true
    setIsLoading(true)
    setError(null)

    postsApi
      .fetchMyPosts(accessToken)
      .then((data) => {
        if (active) {
          setPosts(data)
        }
      })
      .catch((fetchError: unknown) => {
        if (!active) return
        const message =
          fetchError instanceof Error ? fetchError.message : '내 포스트를 불러오지 못했습니다.'
        setError(message)
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [accessToken])

  return { posts, isLoading, error }
}

