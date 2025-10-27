import { useCallback, useEffect, useRef, useState } from 'react'

export type PostDraftState = {
  title: string
  summary: string
  content: string
  tagsInput: string
  heroImageUrl: string
}

const makeDraftKey = (slug?: string | null) =>
  slug && slug.trim().length > 0 ? `devnest.draft.post.${slug}` : 'devnest.draft.post.new'

const parseDraft = (value: string | null): PostDraftState | null => {
  if (!value) {
    return null
  }
  try {
    const parsed = JSON.parse(value) as PostDraftState
    return parsed
  } catch {
    return null
  }
}

const serializeDraft = (draft: PostDraftState) => JSON.stringify(draft)

type UsePostDraftOptions = {
  slug?: string | null
  enabled: boolean
  initialState: PostDraftState
}

type UsePostDraftResult = {
  draft: PostDraftState | null
  saveDraft: (next: PostDraftState) => void
  clearDraft: () => void
  hasDraft: boolean
}

export const usePostDraft = ({
  slug,
  enabled,
  initialState,
}: UsePostDraftOptions): UsePostDraftResult => {
  const [draft, setDraft] = useState<PostDraftState | null>(() => {
    if (typeof window === 'undefined' || !enabled) {
      return null
    }
    return parseDraft(window.localStorage.getItem(makeDraftKey(slug)))
  })

  const keyRef = useRef(makeDraftKey(slug))

  useEffect(() => {
    keyRef.current = makeDraftKey(slug)
    if (typeof window === 'undefined') {
      return
    }
    if (!enabled) {
      setDraft(null)
      return
    }
    setDraft(parseDraft(window.localStorage.getItem(keyRef.current)))
  }, [slug, enabled])

  const saveDraft = useCallback(
    (next: PostDraftState) => {
      if (typeof window === 'undefined' || !enabled) {
        return
      }
      const snapshot = { ...initialState, ...next }
      window.localStorage.setItem(keyRef.current, serializeDraft(snapshot))
      setDraft(snapshot)
    },
    [enabled, initialState],
  )

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(keyRef.current)
    setDraft(null)
  }, [])

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft: draft !== null,
  }
}

