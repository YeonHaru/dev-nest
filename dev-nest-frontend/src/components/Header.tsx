import { Link, useNavigate } from 'react-router-dom'
import ViewContainer from './ViewContainer'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur transition-shadow duration-200 hover:shadow-[0_20px_60px_-40px_rgba(16,185,129,0.55)] relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      <ViewContainer className="flex h-16 items-center justify-between gap-4 text-slate-100">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-lg font-semibold text-white transition-colors hover:text-emerald-300"
          aria-label="DevNest 홈으로 이동"
        >
          <span className="relative">
            <span className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-md" />
            <span className="relative">DevNest</span>
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.4em] text-emerald-300/70 sm:block">
            beta
          </span>
        </Link>
        {user ? (
          <nav className="flex items-center gap-2">
            <Link
              to="/mypage"
              className="rounded-lg border border-slate-700/70 px-3.5 py-1.5 text-sm font-medium text-slate-200 transition-all hover:border-emerald-400/60 hover:bg-slate-900/70"
            >
              마이페이지
            </Link>
            <Link
              to="/posts/new"
              className="rounded-lg bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-3.5 py-1.5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              포스팅하기
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
            >
              로그아웃
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-3">
            <Link
              to="/signin"
              className="rounded-lg border border-slate-700/70 px-3.5 py-1.5 text-sm font-medium text-slate-200 transition-all hover:border-emerald-400/60 hover:bg-slate-900/70"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 px-3.5 py-1.5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Sign up
            </Link>
          </nav>
        )}
      </ViewContainer>
    </header>
  )
}

export default Header
