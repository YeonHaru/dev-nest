import { Link } from 'react-router-dom'
import type { UserComment } from '../../services/commentsApi'
import { formatDateTime } from '../../utils/date'
import { renderMarkdown } from '../../utils/markdown'

type CommentListSectionProps = {
  comments: UserComment[]
  isLoading: boolean
  error: string | null
}

const CommentListSection = ({ comments, isLoading, error }: CommentListSectionProps) => {
  const commentCount = comments.length

  const renderPreview = (comment: UserComment) => {
    if (comment.deleted) {
      return '<span class="text-slate-500">삭제된 댓글입니다.</span>'
    }
    const markdownSource = (comment.bodyMarkdown ?? '').trim()
    const fallbackSource = (comment.bodyHtml ?? '').trim()
    const base = markdownSource.length > 0 ? markdownSource : fallbackSource
    if (!base) {
      return '<span class="text-slate-500">내용이 없습니다.</span>'
    }
    const snippet = base.length > 400 ? `${base.slice(0, 400)}…` : base
    return renderMarkdown(snippet)
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">내가 작성한 댓글</h2>
          <p className="text-sm text-slate-400">최근 작성 순으로 정렬됩니다.</p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          총 {commentCount.toLocaleString()}개
        </span>
      </header>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse space-y-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="h-4 w-1/3 rounded bg-slate-800" />
              <div className="h-4 w-2/3 rounded bg-slate-900" />
              <div className="h-4 w-3/4 rounded bg-slate-900" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
          {error}
        </div>
      ) : commentCount === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
          아직 작성한 댓글이 없습니다. 관심 있는 포스트에 의견을 남겨보세요.
        </div>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => {
            const previewHtml = renderPreview(comment)
            return (
              <li
                key={comment.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-emerald-400/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <Link
                      to={comment.postSlug ? `/posts/${comment.postSlug}` : '#'}
                      className="text-sm font-semibold text-white transition-colors hover:text-emerald-300"
                    >
                      {comment.postTitle ?? '게시글이 삭제되었습니다.'}
                    </Link>
                    {comment.parentId && !comment.deleted && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400">
                        대댓글
                      </span>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{formatDateTime(comment.createdAt)}</p>
                    <p className="mt-1">좋아요 {comment.likeCount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="markdown-body mt-4 text-sm text-slate-200">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default CommentListSection
