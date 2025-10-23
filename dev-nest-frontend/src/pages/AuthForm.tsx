import { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'

type AuthFormProps = {
  title: string
  description: string
  submitLabel: string
  alternateLink: {
    text: string
    to: string
  }
  showConfirmPassword?: boolean
}

const AuthForm = ({
  title,
  description,
  submitLabel,
  alternateLink,
  showConfirmPassword = false,
}: AuthFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <ViewContainer
      as="main"
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm">
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="text-sm text-slate-300">{description}</p>
        </header>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 ring-amber-400 transition focus:border-amber-400 focus:outline-none focus:ring-2"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="********"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 ring-amber-400 transition focus:border-amber-400 focus:outline-none focus:ring-2"
            />
          </div>
          {showConfirmPassword && (
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-200"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="********"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 ring-amber-400 transition focus:border-amber-400 focus:outline-none focus:ring-2"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-amber-400 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
          >
            {submitLabel}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400">
          {alternateLink.text}{' '}
          <Link
            to={alternateLink.to}
            className="font-medium text-amber-300 hover:text-amber-200"
          >
            이동
          </Link>
        </p>
      </div>
    </ViewContainer>
  )
}

export default AuthForm
