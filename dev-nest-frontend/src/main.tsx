import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import appRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={appRoutes} />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
