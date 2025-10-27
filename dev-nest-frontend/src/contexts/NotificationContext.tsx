import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type NotificationItem = {
  id: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

type NotificationContextValue = {
  notifications: NotificationItem[]
  unreadCount: number
  markAllAsRead: () => void
  addNotification: (notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void
  clearNotifications: () => void
}

const STORAGE_KEY = 'devnest.notifications'

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

const readStoredNotifications = (): NotificationItem[] => {
  if (typeof window === 'undefined') {
    return []
  }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed = JSON.parse(raw) as NotificationItem[]
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map((item) => ({ ...item, read: Boolean(item.read) }))
  } catch {
    return []
  }
}

const persistNotifications = (items: NotificationItem[]) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(readStoredNotifications)

  useEffect(() => {
    persistNotifications(notifications)
  }, [notifications])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
          ...notification,
        },
        ...prev,
      ])
    },
    [],
  )

  const value = useMemo(
    () => ({ notifications, unreadCount, markAllAsRead, addNotification, clearNotifications }),
    [notifications, unreadCount, markAllAsRead, addNotification, clearNotifications],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
