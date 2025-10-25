import { useCallback, useEffect, useMemo, useState } from 'react'
import { commentsApi, type Comment } from '../../services/commentsApi'

type CommentsSectionProps = {
  postId: number
  accessToken?: string | null
  currentUserId?: number | null
  onRequireAuth: () => void
}

const AUTH_STORAGE_KEY = 'devnest.auth'

const CommentsSection = ({
  postId,
  accessToken,
  currentUserId,
  onRequireAuth,
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentBody, setCommentBody] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replyError, setReplyError] = useState<string | null>(null)
  const [isReplySubmitting, setIsReplySubmitting] = useState(false)

  const resolvedAccessToken = useMemo(() => {
    if (accessToken) {
      return accessToken
    }
    if (typeof window === 'undefined') {
      return undefined
    }
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        return undefined
      }
      const stored = JSON.parse(raw) as {
        token?: { accessToken?: string; expiresAt?: number }
      }
      if (
        stored?.token?.accessToken &&
        typeof stored.token.accessToken === 'string' &&
        stored.token.accessToken.length > 0
      ) {
        if (
          typeof stored.token.expiresAt === 'number' &&
          stored.token.expiresAt <= Date.now()
        ) {
          return undefined
        }
        return stored.token.accessToken
      }
    } catch {
      return undefined
    }
    return undefined
  }, [accessToken])

  const viewerId = useMemo(() => {
    if (currentUserId != null) {
      return currentUserId
    }
    if (typeof window === 'undefined') {
      return null
    }
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw) {
        return null
      }
      const stored = JSON.parse(raw) as { user?: { id?: number } }
      if (stored?.user?.id != null) {
        return stored.user.id
      }
    } catch {
      return null
    }
    return null
  }, [currentUserId])

  const loadComments = useCallback(
    async (withSpinner: boolean) => {
      if (withSpinner) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)
      try {
        const result = await commentsApi.fetchComments(postId, resolvedAccessToken)
        setComments(result)
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : '댓글을 불러오지 못했습니다.'
        if (message.includes('로그인') || message.toLowerCase().includes('authentication')) {
          setComments([])
          setError(null)
        } else {
          setError(message)
        }
      } finally {
        if (withSpinner) {
          setIsLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    },
    [postId, resolvedAccessToken],
  )

  useEffect(() => {
    loadComments(true)
  }, [loadComments])

  const commentCount = useMemo(() => {
    const countVisible = (items: Comment[]): number =>
      items.reduce((acc, item) => {
        const self = item.deleted ? 0 : 1
        return acc + self + countVisible(item.replies)
      }, 0)
    return countVisible(comments)
  }, [comments])

  const handleRequireAuth = () => {
    onRequireAuth()
  }

  const handleSubmitComment = async () => {
    if (!resolvedAccessToken) {
      handleRequireAuth()
      return
    }

    const trimmed = commentBody.trim()
    if (!trimmed) {
      setCommentError('댓글 내용을 입력해주세요.')
      return
    }

    setCommentError(null)
    setIsSubmitting(true)
    try {
      await commentsApi.createComment(
        postId,
        { body: trimmed },
        resolvedAccessToken,
      )
      setCommentBody('')
      await loadComments(false)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '댓글을 작성하지 못했습니다.'
      setCommentError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartReply = (commentId: number) => {
    if (!resolvedAccessToken) {
      handleRequireAuth()
      return
    }
    setReplyTargetId(commentId)
    setReplyBody('')
    setReplyError(null)
  }

  const handleCancelReply = () => {
    setReplyTargetId(null)
    setReplyBody('')
    setReplyError(null)
  }

  const handleSubmitReply = async () => {
    if (!resolvedAccessToken || replyTargetId === null) {
      handleRequireAuth()
      return
    }
    const trimmed = replyBody.trim()
    if (!trimmed) {
      setReplyError('답글 내용을 입력해주세요.')
      return
    }

    setReplyError(null)
    setIsReplySubmitting(true)
    try {
      await commentsApi.createComment(
        postId,
        { body: trimmed, parentCommentId: replyTargetId },
        resolvedAccessToken,
      )
      setReplyBody('')
      setReplyTargetId(null)
      await loadComments(false)
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '답글을 작성하지 못했습니다.'
      setReplyError(message)
    } finally {
      setIsReplySubmitting(false)
    }
  }

  const handleToggleLike = async (comment: Comment) => {
    if (!resolvedAccessToken) {
      handleRequireAuth()
      return
    }
    try {
      if (comment.liked) {
        await commentsApi.unlikeComment(comment.id, resolvedAccessToken)
      } else {
        await commentsApi.likeComment(comment.id, resolvedAccessToken)
      }
      await loadComments(false)
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : '요청을 처리하지 못했습니다.'
      setError(message)
    }
  }

  const handleDeleteComment = async (comment: Comment) => {
    if (!resolvedAccessToken) {
      handleRequireAuth()
      return
    }
    if (!window.confirm('이 댓글을 삭제하시겠어요?')) {
      return
    }
    try {
      await commentsApi.deleteComment(comment.id, resolvedAccessToken)
      await loadComments(false)
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : '댓글을 삭제하지 못했습니다.'
      setError(message)
    }
  }

  const formatDateTime = (iso: string) => {
    const date = new Date(iso)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(date.getDate()).padStart(2, '0')} ${String(
      date.getHours(),
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  const renderComments = (items: Comment[], depth = 0) => {
    return items.map((comment) => {
      const isReplying = replyTargetId === comment.id
      const indentClass =
        depth === 0 ? '' : `border-l border-slate-800 pl-4 sm:pl-6`
      return (
        <li key={comment.id} className="space-y-3">
          <div className={`space-y-3 ${indentClass}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-200">
                  {comment.author.displayName}
                </span>
                <span>{formatDateTime(comment.createdAt)}</span>
              </div>
              {!comment.deleted && viewerId === comment.author.id && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment)}
                  className="text-xs font-medium text-red-300 transition-colors hover:text-red-200"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="text-sm leading-relaxed text-slate-200">
              {comment.deleted ? (
                <span className="text-slate-500">삭제된 댓글입니다.</span>
              ) : (
                comment.bodyMarkdown?.split('\n').map((line, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => handleToggleLike(comment)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition-colors ${
                  comment.liked
                    ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-700 hover:border-emerald-400 hover:text-emerald-200'
                } ${comment.deleted ? 'pointer-events-none opacity-50' : ''}`}
                disabled={comment.deleted}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={comment.liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path d="M19 13.5 12 21l-7-7.5A5 5 0 0 1 12 6a5 5 0 0 1 7 7.5Z" />
                </svg>
                <span>좋아요 {comment.likeCount}</span>
              </button>
              {!comment.deleted && (
                <button
                  type="button"
                  onClick={() => handleStartReply(comment.id)}
                  className="rounded-full border border-slate-700 px-3 py-1 transition-colors hover:border-emerald-400 hover:text-emerald-200"
                >
                  답글
                </button>
              )}
            </div>
            {isReplying && (
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <textarea
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  rows={3}
                  placeholder="답글을 입력하세요."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  disabled={isReplySubmitting}
                />
                {replyError && (
                  <p className="text-xs text-red-300">{replyError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitReply}
                    disabled={isReplySubmitting}
                    className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
                  >
                    {isReplySubmitting ? '등록 중...' : '등록'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    disabled={isReplySubmitting}
                    className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-emerald-400 hover:text-emerald-200"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
          {comment.replies.length > 0 && (
            <ul className="mt-4 space-y-4">
              {renderComments(comment.replies, depth + 1)}
            </ul>
          )}
        </li>
      )
    })
  }

  return (
    <section className="space-y-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">댓글</h2>
          <p className="text-xs text-slate-400">
            총 {commentCount.toLocaleString()}개의 댓글이 있습니다.
          </p>
        </div>
        {isRefreshing && (
          <span className="text-xs text-emerald-300">갱신 중...</span>
        )}
      </header>
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <textarea
          value={commentBody}
          onChange={(event) => {
            setCommentBody(event.target.value)
            setCommentError(null)
          }}
          rows={4}
          placeholder={
            accessToken
              ? '댓글을 입력하세요.'
              : '로그인 후 댓글을 작성할 수 있습니다.'
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
          disabled={!accessToken || isSubmitting}
        />
        {commentError && (
          <p className="text-xs text-red-300">{commentError}</p>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={!accessToken || isSubmitting}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40"
            />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">
          첫 댓글의 주인공이 되어보세요.
        </p>
      ) : (
        <ul className="space-y-6">{renderComments(comments)}</ul>
      )}
    </section>
  )
}

export default CommentsSection
