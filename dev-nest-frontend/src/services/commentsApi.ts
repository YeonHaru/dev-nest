import { API_BASE_URL } from '../config/api'

export type CommentAuthor = {
  id: number
  username: string
  displayName: string
}

export type Comment = {
  id: number
  parentId: number | null
  deleted: boolean
  bodyMarkdown: string | null
  bodyHtml: string | null
  author: CommentAuthor
  likeCount: number
  liked: boolean
  createdAt: string
  updatedAt: string
  replies: Comment[]
}

export type CreateCommentPayload = {
  body: string
  parentCommentId?: number
}

export type UpdateCommentPayload = {
  body: string
}

export type CommentReaction = {
  likeCount: number
  liked: boolean
}

export type UserComment = {
  id: number
  postId: number | null
  postTitle: string | null
  postSlug: string | null
  parentId: number | null
  deleted: boolean
  bodyMarkdown: string | null
  bodyHtml: string | null
  likeCount: number
  createdAt: string
  updatedAt: string
}

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

const createAuthHeaders = (accessToken?: string): Record<string, string> =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

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

export const commentsApi = {
  async fetchComments(postId: number, accessToken?: string): Promise<Comment[]> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...createAuthHeaders(accessToken),
    }
    const response = await fetch(
      `${API_BASE_URL}/api/posts/${postId}/comments`,
      {
        headers,
      },
    )
    return handleResponse<Comment[]>(response)
  },
  async createComment(
    postId: number,
    payload: CreateCommentPayload,
    accessToken: string,
  ): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        ...createAuthHeaders(accessToken),
      },
      body: JSON.stringify(payload),
    })
    return handleResponse<Comment>(response)
  },
  async updateComment(
    commentId: number,
    payload: UpdateCommentPayload,
    accessToken: string,
  ): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        ...jsonHeaders,
        ...createAuthHeaders(accessToken),
      },
      body: JSON.stringify(payload),
    })
    return handleResponse<Comment>(response)
  },
  async deleteComment(commentId: number, accessToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        ...createAuthHeaders(accessToken),
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
  async likeComment(commentId: number, accessToken: string): Promise<CommentReaction> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/likes`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        ...createAuthHeaders(accessToken),
      },
    })
    return handleResponse<CommentReaction>(response)
  },
  async unlikeComment(commentId: number, accessToken: string): Promise<CommentReaction> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/likes`, {
      method: 'DELETE',
      headers: {
        ...createAuthHeaders(accessToken),
      },
    })
    return handleResponse<CommentReaction>(response)
  },
  async fetchMyComments(accessToken: string): Promise<UserComment[]> {
    const response = await fetch(`${API_BASE_URL}/api/comments/me`, {
      headers: {
        Accept: 'application/json',
        ...createAuthHeaders(accessToken),
      },
    })
    return handleResponse<UserComment[]>(response)
  },
}
