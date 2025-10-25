import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import HomePage from '../pages/HomePage'
import SignInPage from '../pages/SignInPage'
import SignUpPage from '../pages/SignUpPage'
import PostEditorPage from '../pages/PostEditorPage'
import MyPage from '../pages/MyPage'
import PostDetailPage from '../pages/PostDetailPage'

export const appRoutes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        path: 'mypage',
        element: <MyPage />, 
      },
      {
        path: 'posts/new',
        element: <PostEditorPage />, 
      },
      {
        path: 'posts/:slug/edit',
        element: <PostEditorPage />,
      },
      {
        path: 'posts/:slug',
        element: <PostDetailPage />,
      },
    ],
  },
])

export default appRoutes
