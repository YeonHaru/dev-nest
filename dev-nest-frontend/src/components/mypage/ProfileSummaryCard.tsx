import { Link } from 'react-router-dom'
import type { AuthUser } from '../../contexts/AuthContext'

type ProfileSummaryCardProps = {
  user: AuthUser
  postCount: number
  commentCount: number
  totalViews: number
  totalLikes: number
}

const ProfileSummaryCard = ({
  user,
  postCount,
  commentCount,
  totalViews,
  totalLikes,
}: ProfileSummaryCardProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 shadow-[0_40px_120px_-40px_rgba(16,185,129,0.35)]">
      <h1 className="text-3xl font-semibold text-white">마이페이지</h1>
      <p className="mt-2 text-sm text-slate-400">
        DevNest에서 작성한 포스트와 댓글 활동 내역을 확인할 수 있어요.
      </p>
      <dl className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <dt className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/80">
            회원 ID
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">{user.username}</dd>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <dt className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/80">
            닉네임
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">{user.displayName}</dd>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <dt className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/80">
            작성한 글
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">
            {postCount.toLocaleString()}개
          </dd>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
          <dt className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/80">
            댓글 수
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">
            {commentCount.toLocaleString()}개
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1">
          총 조회수 {totalViews.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1">
          총 좋아요 {totalLikes.toLocaleString()}
        </span>
        <Link
          to="/posts/new"
          className="ml-auto rounded-lg bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
        >
          새 글 작성하기
        </Link>
      </div>
    </section>
  )
}

export default ProfileSummaryCard
