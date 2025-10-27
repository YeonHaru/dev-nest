import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import ViewContainer from '../components/ViewContainer'
import { useAuth } from '../contexts/AuthContext'
import ProfileSummaryCard from '../components/mypage/ProfileSummaryCard'
import PostListSection from '../components/mypage/PostListSection'
import CommentListSection from '../components/mypage/CommentListSection'
import { useMyPosts } from '../hooks/useMyPosts'
import { useMyComments } from '../hooks/useMyComments'
import type { PostSummary } from '../services/postsApi'

const summarizePost = (post: PostSummary): string => {
  if (post.summary && post.summary.trim().length > 0) {
    return post.summary.trim()
  }
  return '요약이 등록되지 않은 글입니다. 상세 페이지에서 내용을 확인해보세요.'
}

const MyPage = () => {
  const { user, token } = useAuth()
  const accessToken = token?.accessToken ?? null

  const {
    posts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useMyPosts(accessToken)

  const {
    comments,
    isLoading: isLoadingComments,
    error: commentsError,
  } = useMyComments(accessToken)

  const totalStats = useMemo(() => {
    const views = posts.reduce((acc, post) => acc + (Number.isFinite(post.views) ? post.views : 0), 0)
    const likes = posts.reduce((acc, post) => acc + (Number.isFinite(post.likes) ? post.likes : 0), 0)
    return { views, likes }
  }, [posts])

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <ViewContainer as="main" className="flex flex-col gap-10 py-16 text-slate-100">
      <ProfileSummaryCard
        user={user}
        postCount={posts.length}
        commentCount={comments.length}
        totalViews={totalStats.views}
        totalLikes={totalStats.likes}
      />

      <PostListSection
        posts={posts}
        isLoading={isLoadingPosts}
        error={postsError}
        renderSummary={summarizePost}
      />

      <CommentListSection
        comments={comments}
        isLoading={isLoadingComments}
        error={commentsError}
      />
    </ViewContainer>
  )
}

export default MyPage
