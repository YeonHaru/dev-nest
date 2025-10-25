import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'
import { postsApi, type PostSummary } from '../services/postsApi'

const HomePage = () => {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        const latest = await postsApi.fetchLatest(10)
        if (mounted) {
          setPosts(latest)
        }
      } catch (fetchError) {
        if (mounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : '포스트를 불러오지 못했습니다.'
          setError(message)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const likesA = typeof a.likes === 'number' ? a.likes : 0
        const likesB = typeof b.likes === 'number' ? b.likes : 0
        const viewsA = typeof a.views === 'number' ? a.views : 0
        const viewsB = typeof b.views === 'number' ? b.views : 0
        if (likesB !== likesA) {
          return likesB - likesA
        }
        if (viewsB !== viewsA) {
          return viewsB - viewsA
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      .slice(0, 10)
  }, [posts])

  const visiblePosts = useMemo(() => {
    if (!query.trim()) {
      return topPosts
    }

    const lowered = query.trim().toLowerCase()
    return topPosts.filter((post) => {
      return (
        post.title.toLowerCase().includes(lowered) ||
        (post.summary ?? '').toLowerCase().includes(lowered) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowered))
      )
    })
  }, [query, topPosts])

  const formatDate = (iso?: string | null) => {
    if (!iso) return '-'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) {
      return '-'
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`
  }

  return (
    <ViewContainer
      as="main"
      className="flex flex-col gap-16 py-16 text-slate-100"
    >
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.15),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-300/80">
              Developer Focused
            </span>
            <h1 className="text-4xl font-semibold sm:text-5xl">DevNest Feed</h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              최신 기술 글을 빠르게 찾고, 좋아요와 조회수로 검증된 인사이트를
              만나보세요.
            </p>
          </div>
          <label className="flex w-full items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 shadow-inner shadow-slate-900/60 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5 text-slate-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="sr-only">포스트 검색</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="키워드 또는 태그로 포스트를 검색하세요 (예: spring, devops)"
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {['spring', 'react', 'devops', 'database', 'ai'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full border border-slate-700 px-3 py-1 transition-colors hover:border-emerald-400 hover:text-emerald-300"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              상위 10개 포스트
            </h2>
            <p className="text-sm text-slate-400">
              DevNest 커뮤니티에서 최근 게시된 인기 글을 확인해 보세요.
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            실시간 업데이트 예정
          </span>
        </div>
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
              {error}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {visiblePosts.map((post, index) => (
                <li
                  key={post.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-slate-900/90"
                >
                  <div className="absolute inset-y-0 -left-[1px] w-1 bg-gradient-to-b from-emerald-400/90 via-emerald-500/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>#{String(index + 1).padStart(2, '0')}</span>
                    <time dateTime={post.updatedAt ?? post.publishedAt}>
                      최근 업데이트 · {formatDate(post.updatedAt ?? post.publishedAt)}
                    </time>
                  </div>
                  <Link to={`/posts/${post.slug}`} className="mt-3 block space-y-3">
                    <h3 className="text-lg font-semibold text-white">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {post.summary ?? '상세 내용을 확인해 보세요.'}
                    </p>
                  </Link>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 transition-colors group-hover:border-emerald-400/60 group-hover:text-emerald-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M7 11v6" />
                        <path d="M11 9v8" />
                        <path d="M15 5v12" />
                        <path d="M19 7v10" />
                      </svg>
                      {post.views.toLocaleString()} views
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 transition-colors group-hover:border-emerald-400/60 group-hover:text-emerald-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                      </svg>
                      {post.likes.toLocaleString()} likes
                    </span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-800 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-500 group-hover:border-emerald-400/30 group-hover:text-emerald-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
              {visiblePosts.length === 0 && (
                <li className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
                  검색 결과가 없습니다. 다른 키워드를 입력하거나 태그 버튼을
                  눌러보세요.
                </li>
              )}
            </ul>
          )}
        </div>
      </section>
    </ViewContainer>
  )
}

export default HomePage
