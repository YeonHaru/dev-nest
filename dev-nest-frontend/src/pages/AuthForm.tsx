import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'
import { useAuth } from '../contexts/AuthContext'

type AuthFormProps = {
  mode: 'signin' | 'signup'
  title: string
  description: string
  submitLabel: string
  alternateLink: {
    text: string
    to: string
  }
}

const AuthForm = ({
  mode,
  title,
  description,
  submitLabel,
  alternateLink,
}: AuthFormProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { message?: string } | null)?.message ?? null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const username = formValues.username.trim()
    const password = formValues.password.trim()

    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'signin') {
        await signIn({ username, password })
        navigate('/mypage', { replace: true })
        return
      }

      const displayName = formValues.displayName.trim()
      const email = formValues.email.trim()
      const confirmPassword = formValues.confirmPassword.trim()

      if (!displayName || !email) {
        setError('모든 필드를 입력해주세요.')
        return
      }
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.')
        return
      }

      await signUp({ username, email, password, displayName })
      navigate('/signin', {
        replace: true,
        state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' },
      })
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '요청 처리 중 오류가 발생했습니다.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ViewContainer
      as="main"
      className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20"
    >
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 -translate-y-10 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-emerald-400/5 to-transparent blur-3xl" />
        <div className="relative space-y-6 rounded-2xl border border-slate-800/80 bg-slate-950/80 p-8 shadow-[0_40px_120px_-40px_rgba(16,185,129,0.35)]">
          <header className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-slate-300">{description}</p>
          </header>
          {successMessage && (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              {successMessage}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-200"
              >
                아이디
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formValues.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-slate-200"
                  >
                    표시 이름
                  </label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required
                    value={formValues.displayName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
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
                    value={formValues.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
              </>
            )}
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
                value={formValues.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
            {mode === 'signup' && (
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
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 py-2.5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? '처리 중...' : submitLabel}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400">
            {alternateLink.text}{' '}
            <Link
              to={alternateLink.to}
              className="font-medium text-emerald-300 transition-colors hover:text-emerald-200"
            >
              이동
            </Link>
          </p>
        </div>
      </div>
    </ViewContainer>
  )
}

export default AuthForm
