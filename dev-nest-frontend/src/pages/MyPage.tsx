import { Link, Navigate } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'
import { useAuth } from '../contexts/AuthContext'

const MyPage = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <ViewContainer
      as="main"
      className="flex flex-col gap-10 py-16 text-slate-100"
    >
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-10 shadow-[0_40px_120px_-40px_rgba(16,185,129,0.35)]">
        <h1 className="text-3xl font-semibold text-white">마이페이지</h1>
        <p className="mt-2 text-sm text-slate-400">
          DevNest Explorer의 활동 현황을 확인하고 새 글을 작성해보세요.
        </p>
        <dl className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/80">
              User ID
            </dt>
            <dd className="mt-2 text-lg font-semibold text-white">{user.id}</dd>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
            <dt className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-300/80">
              Display Name
            </dt>
            <dd className="mt-2 text-lg font-semibold text-white">
              {user.displayName}
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            곧 작성한 포스트와 댓글 기록을 확인할 수 있는 대시보드가 제공될
            예정입니다.
          </p>
          <Link
            to="/posts/new"
            className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
          >
            새 포스트 작성
          </Link>
        </div>
      </section>
    </ViewContainer>
  )
}

export default MyPage
