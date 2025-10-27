import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { formatDateTime } from '../utils/date'

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const toggleOpen = () => {
    setOpen((prev) => !prev)
    if (!open && unreadCount > 0) {
      markAllAsRead()
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/70 text-slate-200 transition-colors hover:border-emerald-400/60 hover:text-emerald-200 ${open ? 'bg-slate-900/80' : ''}`}
        aria-label="알림 보기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
          <path d="M18 16v-5a6 6 0 0 0-12 0v5" />
          <path d="M20 16H4" />
          <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-slate-950">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-72 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>최근 알림</span>
            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300 transition-colors hover:border-emerald-400 hover:text-emerald-200"
            >
              모두 읽음 처리
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500">새로운 알림이 없습니다.</p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-300">
              {notifications.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
                  <p className="text-slate-200">{item.message}</p>
                  <p className="mt-1 text-[10px] text-slate-500">{formatDateTime(item.createdAt)}</p>
                  {item.link && (
                    <Link
                      to={item.link}
                      className="mt-2 inline-flex text-[11px] font-medium text-emerald-300 underline underline-offset-2"
                      onClick={() => setOpen(false)}
                    >
                      바로가기
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
