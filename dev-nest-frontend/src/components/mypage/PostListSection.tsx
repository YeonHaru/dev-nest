import { Link } from 'react-router-dom'
import type { PostSummary } from '../../services/postsApi'
import { formatDateTime } from '../../utils/date'

type PostListSectionProps = {
  posts: PostSummary[]
  isLoading: boolean
  error: string | null
  renderSummary: (post: PostSummary) => string
}

const PostListSection = ({ posts, isLoading, error, renderSummary }: PostListSectionProps) => {
  const postCount = posts.length

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">내가 작성한 포스트</h2>
          <p className="text-sm text-slate-400">최근에 업데이트한 순으로 정렬됩니다.</p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          총 {postCount.toLocaleString()}개
        </span>
      </header>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="h-5 w-1/2 rounded bg-slate-800" />
              <div className="h-4 w-3/4 rounded bg-slate-900" />
              <div className="h-4 w-2/3 rounded bg-slate-900" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
          {error}
        </div>
      ) : postCount === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
          아직 작성한 포스트가 없습니다. 첫 글을 작성해 DevNest 커뮤니티와 인사이트를 공유해보세요.
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-400/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <Link
                    to={`/posts/${post.slug}`}
                    className="inline-flex items-center gap-2 text-lg font-semibold text-white transition-colors group-hover:text-emerald-300"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-slate-300">{renderSummary(post)}</p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-emerald-300">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-emerald-400/40 px-3 py-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>최종 수정 {formatDateTime(post.updatedAt)}</p>
                  <p className="mt-1">게시 {formatDateTime(post.publishedAt)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1">
                  조회수 {post.views.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1">
                  좋아요 {post.likes.toLocaleString()}
                </span>
                <Link
                  to={`/posts/${post.slug}/edit`}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-emerald-400 hover:text-emerald-200"
                >
                  수정하기
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PostListSection
