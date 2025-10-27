import { useEffect, useState } from 'react'
import { commentsApi, type UserComment } from '../services/commentsApi'

type UseMyCommentsResult = {
  comments: UserComment[]
  isLoading: boolean
  error: string | null
}

export const useMyComments = (accessToken: string | null): UseMyCommentsResult => {
  const [comments, setComments] = useState<UserComment[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(accessToken))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      setComments([])
      setIsLoading(false)
      setError(null)
      return
    }

    let active = true
    setIsLoading(true)
    setError(null)

    commentsApi
      .fetchMyComments(accessToken)
      .then((data) => {
        if (active) {
          setComments(data)
        }
      })
      .catch((fetchError: unknown) => {
        if (!active) return
        const message =
          fetchError instanceof Error ? fetchError.message : '내 댓글을 불러오지 못했습니다.'
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

  return { comments, isLoading, error }
}
