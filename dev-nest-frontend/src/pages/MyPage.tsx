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
    hasMore: hasMorePosts,
    loadMore: loadMorePosts,
    totalElements: totalPostCount,
    totalViews,
    totalLikes,
  } = useMyPosts(accessToken)

  const {
    comments,
    isLoading: isLoadingComments,
    error: commentsError,
    hasMore: hasMoreComments,
    loadMore: loadMoreComments,
    totalElements: totalCommentCount,
  } = useMyComments(accessToken)

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <ViewContainer as="main" className="flex flex-col gap-10 py-16 text-slate-100">
      <ProfileSummaryCard
        user={user}
        postCount={totalPostCount}
        commentCount={totalCommentCount}
        totalViews={totalViews}
        totalLikes={totalLikes}
      />

      <PostListSection
        posts={posts}
        isLoading={isLoadingPosts}
        error={postsError}
        renderSummary={summarizePost}
        hasMore={hasMorePosts}
        onLoadMore={loadMorePosts}
        totalCount={totalPostCount}
      />

      <CommentListSection
        comments={comments}
        isLoading={isLoadingComments}
        error={commentsError}
        hasMore={hasMoreComments}
        onLoadMore={loadMoreComments}
        totalCount={totalCommentCount}
      />
    </ViewContainer>
  )
}

export default MyPage
