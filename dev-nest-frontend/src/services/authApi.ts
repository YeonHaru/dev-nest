import { API_BASE_URL } from '../config/api'

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

type LoginResponse = {
  token: {
    access_token: string
    token_type: string
    expires_in: number
  }
  user: {
    id: number
    username: string
    email: string
    display_name: string
    role: string
  }
}

type SignUpResponse = {
  id: number
  username: string
  email: string
  display_name: string
  role: string
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => ({ message: '요청을 처리할 수 없습니다.' }))
    const message =
      typeof data?.message === 'string'
        ? data.message
        : '요청을 처리할 수 없습니다.'
    throw new Error(message)
  }
  return (await response.json()) as T
}

export const authApi = {
  async signIn(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ username, password }),
    })
    return handleResponse<LoginResponse>(response)
  },
  async signUp(
    username: string,
    email: string,
    password: string,
    displayName: string,
  ): Promise<SignUpResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ username, email, password, displayName }),
    })
    return handleResponse<SignUpResponse>(response)
  },
  async signOut(accessToken: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch(() => undefined)
  },
}
