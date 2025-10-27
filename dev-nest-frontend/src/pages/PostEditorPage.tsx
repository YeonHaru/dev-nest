import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'
import { useAuth } from '../contexts/AuthContext'
import { postsApi } from '../services/postsApi'
import { renderMarkdown } from '../utils/markdown'
import { usePostDraft, type PostDraftState } from '../hooks/usePostDraft'
import { useNotifications } from '../contexts/NotificationContext'

const defaultPreview = {
  title: '새로운 기술 인사이트를 공유해 보세요',
  summary:
    'DevNest는 개발자의 경험과 지식을 연결합니다. 포스트를 작성하면 홈 피드와 마이페이지에 반영됩니다.',
  tags: ['devnest', 'guides'],
  content: `## Markdown으로 글을 작성하세요\n\n- 코드 블록\n- 강조 텍스트\n- 이미지 업로드 (추후 지원 예정)`,
}

const draftInitialState: PostDraftState = {
  title: '',
  summary: '',
  content: '',
  tagsInput: '',
  heroImageUrl: '',
}

const PostEditorPage = () => {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const isEditMode = Boolean(slug)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [postId, setPostId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [showDraftRestored, setShowDraftRestored] = useState(false)

  const {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
  } = usePostDraft({
    slug,
    enabled: !isEditMode,
    initialState: draftInitialState,
  })

  const draftAppliedRef = useRef(false)
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (!isEditMode) {
      if (draft && !draftAppliedRef.current) {
        setTitle(draft.title)
        setSummary(draft.summary)
        setContent(draft.content)
        setTagsInput(draft.tagsInput)
        setHeroImageUrl(draft.heroImageUrl)
        draftAppliedRef.current = true
        setShowDraftRestored(true)
      }
      return
    }

    if (!slug) {
      return
    }

    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        const detail = await postsApi.fetchBySlug(slug)
        if (!mounted) {
          return
        }
        if (user && detail.author.id !== user.id) {
          setError('본인이 작성한 포스트만 수정할 수 있습니다.')
          return
        }
        setPostId(detail.id)
        setTitle(detail.title)
        setSummary(detail.summary ?? '')
        setContent(detail.content)
        setTagsInput(detail.tags.join(', '))
        setHeroImageUrl(detail.heroImageUrl ?? '')
      } catch (fetchError) {
        if (mounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : '포스트를 불러오지 못했습니다.'
          setError(message)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [draft, isEditMode, slug, user])

  useEffect(() => {
    setSuccess(null)
  }, [title, summary, content, tagsInput, heroImageUrl])

  const tags = useMemo(() => {
    return tagsInput
      .split(/[\s,]+/)
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter((tag) => tag.length > 0)
      .slice(0, 10)
  }, [tagsInput])

  useEffect(() => {
    if (isEditMode) {
      return
    }
    const handler = window.setTimeout(() => {
      saveDraft({ title, summary, content, tagsInput, heroImageUrl })
    }, 800)
    return () => {
      window.clearTimeout(handler)
    }
  }, [isEditMode, title, summary, content, tagsInput, heroImageUrl, saveDraft])

  const previewData = useMemo(() => {
    return {
      title: title || defaultPreview.title,
      summary: summary || defaultPreview.summary,
      tags: tags.length > 0 ? tags : defaultPreview.tags,
      content: content || defaultPreview.content,
    }
  }, [title, summary, tags, content])
  const previewHtml = useMemo(
    () => renderMarkdown(previewData.content),
    [previewData.content],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setError('로그인 후 포스트를 작성할 수 있습니다.')
      return
    }
    setError(null)
    setSuccess(null)

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    if (!content.trim()) {
      setError('본문 내용을 입력해주세요.')
      return
    }

    const payload = {
      title: title.trim(),
      content,
      summary: summary.trim() || undefined,
      tags,
      heroImageUrl: heroImageUrl.trim() || undefined,
    }

    try {
      setIsSubmitting(true)
      if (isEditMode && slug) {
        if (!postId) {
          setError('포스트 정보를 불러오지 못했습니다.')
          return
        }
        const updated = await postsApi.updatePost(postId, payload, token.accessToken)
        setSuccess('포스트가 수정되었습니다.')
        addNotification({
          message: '포스트가 업데이트되었습니다.',
          link: `/posts/${updated.slug}`,
        })
        navigate(`/posts/${updated.slug}`, { replace: true })
      } else {
        const created = await postsApi.createPost(payload, token.accessToken)
        setSuccess('포스트가 발행되었습니다.')
        clearDraft()
        addNotification({
          message: '새 포스트가 발행되었습니다.',
          link: `/posts/${created.slug}`,
        })
        navigate(`/posts/${created.slug}`, { replace: true })
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '포스트를 저장하지 못했습니다.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <ViewContainer as="main" className="flex flex-col items-center justify-center py-24 text-slate-100">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-semibold">로그인이 필요합니다</h1>
          <p className="text-sm text-slate-400">
            포스트를 작성하려면 DevNest 계정으로 로그인해주세요.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/signin"
              className="rounded-md border border-emerald-400/40 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:border-emerald-300 hover:bg-emerald-500/10"
            >
              로그인하기
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300"
            >
              회원가입
            </Link>
          </div>
        </div>
      </ViewContainer>
    )
  }

  return (
    <ViewContainer as="main" className="flex flex-col gap-12 py-16 text-slate-100">
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-white">
            {isEditMode ? '포스트 수정' : '새 포스트 작성'}
          </h1>
          <p className="text-sm text-slate-300">
            마크다운 문법을 지원하며, 저장과 동시에 게시가 완료됩니다.
          </p>
        </header>
        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {success}
          </p>
        )}
        {!isEditMode && showDraftRestored && (
          <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            임시 저장된 초안이 불러와졌습니다. 계속 작성하거나 삭제할 수 있어요.
          </div>
        )}
        {!isEditMode && hasDraft && (
          <button
            type="button"
            onClick={() => {
              clearDraft()
              setTitle('')
              setSummary('')
              setContent('')
              setTagsInput('')
              setHeroImageUrl('')
              draftAppliedRef.current = false
              setShowDraftRestored(false)
            }}
            className="text-xs text-slate-400 underline underline-offset-2"
          >
            임시 저장 삭제하기
          </button>
        )}
        <form
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-200">
                제목
              </label>
              <input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="포스트 제목을 입력하세요"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="summary" className="block text-sm font-medium text-slate-200">
                요약 (선택)
              </label>
              <textarea
                id="summary"
                name="summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="핵심 내용을 2~3문장으로 정리해 보세요."
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-medium text-slate-200">
                해시태그
              </label>
              <input
                id="tags"
                name="tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="#react #performance"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading || isSubmitting}
              />
              <p className="text-xs text-slate-500">쉼표 또는 공백으로 태그를 구분하세요. 최대 10개까지 등록할 수 있습니다.</p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-200"
              >
                본문 (Markdown)
              </label>
              <textarea
                id="content"
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="## 섹션 제목을 입력해 보세요"
                rows={18}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="heroImageUrl"
                className="block text-sm font-medium text-slate-200"
              >
                대표 이미지 URL (선택)
              </label>
              <input
                id="heroImageUrl"
                name="heroImageUrl"
                value={heroImageUrl}
                onChange={(event) => setHeroImageUrl(event.target.value)}
                placeholder="https://example.com/cover.png"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                disabled={isLoading || isSubmitting}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? '저장 중...' : isEditMode ? '포스트 업데이트' : '포스트 발행'}
              </button>
            </div>
          </div>
          <aside className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <header className="space-y-1">
              <h2 className="text-xl font-semibold text-white">라이브 미리보기</h2>
              <p className="text-xs text-slate-400">
                실제 게시물은 Markdown을 HTML로 렌더링하여 표시됩니다.
              </p>
            </header>
            <article className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-white">
                  {previewData.title}
                </h3>
                <p className="text-sm text-slate-300">{previewData.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs text-amber-300">
                  {previewData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-amber-400/40 px-3 py-1"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="markdown-body text-sm text-slate-200"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </article>
          </aside>
        </form>
      </section>
    </ViewContainer>
  )
}

export default PostEditorPage
