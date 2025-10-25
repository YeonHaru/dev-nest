import { API_BASE_URL } from '../config/api'

export type PostSummary = {
  id: number
  title: string
  slug: string
  summary: string | null
  tags: string[]
  authorName: string
  views: number
  likes: number
  publishedAt: string
  updatedAt: string
}

export type PostDetail = {
  id: number
  title: string
  slug: string
  summary: string | null
  content: string
  tags: string[]
  heroImageUrl: string | null
  author: {
    id: number
    username: string
    displayName: string
  }
  views: number
  likes: number
  publishedAt: string
  updatedAt: string
}

export type PostEngagement = {
  views: number
  likes: number
  liked: boolean
}

type PostListResponse = {
  items: PostSummary[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export type CreatePostPayload = {
  title: string
  content: string
  tags: string[]
  summary?: string
  heroImageUrl?: string
}

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 401 || response.status === 403) {
    throw new Error('로그인이 필요합니다.')
  }
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

export const postsApi = {
  async fetchLatest(limit = 10): Promise<PostSummary[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/posts/latest?limit=${encodeURIComponent(limit)}`,
    )
    return handleResponse<PostSummary[]>(response)
  },
  async fetchList(params: { page?: number; size?: number; keyword?: string } = {}): Promise<PostListResponse> {
    const search = new URLSearchParams()
    if (typeof params.page === 'number') search.set('page', String(params.page))
    if (typeof params.size === 'number') search.set('size', String(params.size))
    if (params.keyword && params.keyword.trim()) {
      search.set('keyword', params.keyword.trim())
    }
    const query = search.toString()
    const response = await fetch(
      `${API_BASE_URL}/api/posts${query ? `?${query}` : ''}`,
    )
    return handleResponse<PostListResponse>(response)
  },
  async fetchBySlug(slug: string): Promise<PostDetail> {
    const response = await fetch(`${API_BASE_URL}/api/posts/slug/${slug}`)
    return handleResponse<PostDetail>(response)
  },
  async createPost(payload: CreatePostPayload, accessToken: string): Promise<PostDetail> {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
    return handleResponse<PostDetail>(response)
  },
  async updatePost(
    postId: number,
    payload: CreatePostPayload,
    accessToken: string,
  ): Promise<PostDetail> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })
    return handleResponse<PostDetail>(response)
  },
  async deletePost(postId: number, accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ message: '삭제할 수 없습니다.' }))
      const message =
        typeof data?.message === 'string' ? data.message : '삭제할 수 없습니다.'
      throw new Error(message)
    }
  },
  async fetchEngagement(postId: number, accessToken?: string): Promise<PostEngagement> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/engagement`, {
      headers,
    })
    return handleResponse<PostEngagement>(response)
  },
  async likePost(postId: number, accessToken: string): Promise<PostEngagement> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return handleResponse<PostEngagement>(response)
  },
  async unlikePost(postId: number, accessToken: string): Promise<PostEngagement> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/likes`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return handleResponse<PostEngagement>(response)
  },
}
