import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../services/authApi'

export type AuthUser = {
  id: number
  username: string
  email: string
  displayName: string
  role: string
}

type AuthToken = {
  accessToken: string
  tokenType: string
  expiresAt: number
}

type AuthState = {
  user: AuthUser
  token: AuthToken
}

type SignInParams = {
  username: string
  password: string
}

type SignUpParams = {
  username: string
  email: string
  password: string
  displayName: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: AuthToken | null
  signIn: (params: SignInParams) => Promise<void>
  signUp: (params: SignUpParams) => Promise<void>
  signOut: () => Promise<void>
}

const AUTH_STORAGE_KEY = 'devnest.auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const parseStoredState = (): AuthState | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as AuthState
    if (!parsed.token || parsed.token.expiresAt <= Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState | null>(() => parseStoredState())

  const persistState = useCallback((state: AuthState | null) => {
    if (typeof window === 'undefined') {
      return
    }
    if (state) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!authState) {
      const stored = parseStoredState()
      if (stored) {
        setAuthState(stored)
      }
    }
  }, [authState])

  const signIn = useCallback(async ({ username, password }: SignInParams) => {
    const response = await authApi.signIn(username, password)
    const { token, user } = response
    const expiresAt = Date.now() + token.expires_in * 1000
    const nextState: AuthState = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
      token: {
        accessToken: token.access_token,
        tokenType: token.token_type,
        expiresAt,
      },
    }
    setAuthState(nextState)
    persistState(nextState)
  }, [persistState])

  const signUp = useCallback(async ({ username, email, password, displayName }: SignUpParams) => {
    await authApi.signUp(username, email, password, displayName)
  }, [])

  const signOut = useCallback(async () => {
    if (authState?.token) {
      await authApi.signOut(authState.token.accessToken)
    }
    setAuthState(null)
    persistState(null)
  }, [authState, persistState])

  const value = useMemo(
    () => ({
      user: authState?.user ?? null,
      token: authState?.token ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [authState, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
