import { Link } from 'react-router-dom'
import ViewContainer from './ViewContainer'

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <ViewContainer className="flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg font-semibold text-white transition-colors hover:text-amber-300"
          aria-label="DevNest 홈으로 이동"
        >
          DevNest
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/signin"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
          >
            Sign up
          </Link>
        </nav>
      </ViewContainer>
    </header>
  )
}

export default Header
