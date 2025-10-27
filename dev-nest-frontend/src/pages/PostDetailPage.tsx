import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'
import { useAuth } from '../contexts/AuthContext'
import CommentsSection from '../components/comments/CommentsSection'
import { postsApi, type PostDetail, type PostEngagement } from '../services/postsApi'
import { renderMarkdown } from '../utils/markdown'
import { formatDateTime } from '../utils/date'

const PostDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [engagement, setEngagement] = useState<PostEngagement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLikePending, setIsLikePending] = useState(false)

  const fetchCacheRef = useRef<{
    slug: string
    promise: Promise<PostDetail>
  } | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('잘못된 요청입니다.')
      setIsLoading(false)
       fetchCacheRef.current = null
      return
    }

    const attachHandlers = (promise: Promise<PostDetail>) => {
      promise
        .then((detail) => {
          if (fetchCacheRef.current?.slug !== slug) {
            return
          }
          setPost(detail)
          setEngagement({
            likes: detail.likes,
            views: detail.views,
            liked: false,
          })
          setError(null)
        })
        .catch((fetchError: unknown) => {
          if (fetchCacheRef.current?.slug !== slug) {
            return
          }
          const message =
            fetchError instanceof Error ? fetchError.message : '포스트를 불러오지 못했습니다.'
          setError(message)
          setPost(null)
          setEngagement(null)
        })
        .finally(() => {
          if (fetchCacheRef.current?.slug === slug) {
            setIsLoading(false)
          }
        })
    }

    if (fetchCacheRef.current?.slug === slug) {
      attachHandlers(fetchCacheRef.current.promise)
      return
    }

    setIsLoading(true)
    const promise = postsApi.fetchBySlug(slug)
    fetchCacheRef.current = { slug, promise }
    attachHandlers(promise)
  }, [slug])

  useEffect(() => {
    const postId = post?.id
    const accessToken = token?.accessToken
    if (!postId) {
      return
    }
    if (!accessToken) {
      setEngagement({
        likes: post.likes,
        views: post.views,
        liked: false,
      })
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const data = await postsApi.fetchEngagement(postId, accessToken)
        if (!cancelled) {
          setEngagement(data)
        }
      } catch {
        if (!cancelled) {
          setEngagement({
            likes: post.likes,
            views: post.views,
            liked: false,
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [post?.id, post?.likes, post?.views, token?.accessToken])

  const handleDelete = async () => {
    if (!post || !token) {
      return
    }
    if (!window.confirm('정말로 이 포스트를 삭제하시겠어요?')) {
      return
    }
    try {
      setIsDeleting(true)
      await postsApi.deletePost(post.id, token.accessToken)
      navigate('/', { replace: true })
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : '포스트를 삭제하지 못했습니다.'
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRequireAuth = () => {
    navigate('/signin', {
      state: { from: slug ? `/posts/${slug}` : '/' },
    })
  }

  const handleToggleLike = async () => {
    if (!post) {
      return
    }
    if (!token) {
      handleRequireAuth()
      return
    }
    try {
      setIsLikePending(true)
      const next = engagement?.liked
        ? await postsApi.unlikePost(post.id, token.accessToken)
        : await postsApi.likePost(post.id, token.accessToken)
      setEngagement(next)
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : '좋아요를 처리하지 못했습니다.'
      if (message.includes('로그인')) {
        setError('세션이 만료되었습니다. 다시 로그인해주세요.')
        handleRequireAuth()
      } else {
        setError(message)
      }
    } finally {
      setIsLikePending(false)
    }
  }

  const postContent = post?.content ?? ''
  const contentHtml = useMemo(() => renderMarkdown(postContent), [postContent])

  const displayViews = engagement?.views ?? (post ? post.views : 0)
  const displayLikes = engagement?.likes ?? (post ? post.likes : 0)

  return (
    <ViewContainer as="main" className="flex flex-col gap-10 py-16 text-slate-100">
      {isLoading ? (
        <div className="space-y-6">
          <div className="h-12 w-2/3 animate-pulse rounded bg-slate-800" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-slate-900" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-4 w-full animate-pulse rounded bg-slate-900" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          {error}
        </div>
      ) : post ? (
        <article className="space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-slate-700 px-3 py-1">
                {post.author.displayName}
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                {formatDateTime(post.publishedAt)}
              </span>
              <span className="rounded-full border border-slate-700 px-3 py-1">
                조회수 {displayViews.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={isLikePending}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition-colors ${
                  engagement?.liked
                    ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-700 hover:border-emerald-400 hover:text-emerald-200'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={engagement?.liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-4 w-4"
                >
                  <path d="M19 13.5 12 21l-7-7.5A5 5 0 0 1 12 6a5 5 0 0 1 7 7.5Z" />
                </svg>
                <span>
                  좋아요 {displayLikes.toLocaleString()}
                </span>
              </button>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-base text-slate-300">{post.summary}</p>
            )}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-emerald-300">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-emerald-400/40 px-3 py-1"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {post.heroImageUrl && (
              <div className="overflow-hidden rounded-2xl border border-slate-800/80">
                <img
                  src={post.heroImageUrl}
                  alt="게시글 대표 이미지"
                  className="w-full object-cover"
                />
              </div>
            )}
          </header>
          <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-8">
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </section>
          {user && user.id === post.author.id && token && (
            <footer className="flex flex-wrap gap-3">
              <Link
                to={`/posts/${post.slug}/edit`}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400 hover:text-emerald-300"
              >
                수정하기
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md border border-red-500/50 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? '삭제 중...' : '삭제하기'}
              </button>
            </footer>
          )}
          <CommentsSection
            postId={post.id}
            postSlug={post.slug}
            accessToken={token?.accessToken}
            currentUserId={user?.id}
            onRequireAuth={handleRequireAuth}
          />
        </article>
      ) : null}
    </ViewContainer>
  )
}

export default PostDetailPage
