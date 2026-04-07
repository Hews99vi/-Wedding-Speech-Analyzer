import { useEffect, useRef, useState } from 'react'
import { ThemeToggle } from './ui/ThemeToggle'
import { Button } from './ui/Button'
import { Skeleton } from './ui/Skeleton'
import { useAuthStore } from '../store/authStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRouteMeta } from '../routes/routeMeta'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, markNotificationRead, clearAllNotifications } from '../api/notifications'
import type { NotificationItem } from '../types/notification'
import { routePaths } from '../routes/routePaths'

export const TopBar = () => {
  const { user, clearAuth } = useAuthStore()
  const location = useLocation()
  const meta = getRouteMeta(location.pathname)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const profileRef = useRef<HTMLDivElement | null>(null)

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  })

  const unreadCount = notifications.filter((item) => !item.read).length

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: (data) => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], data)
    }
  })

  const clearAllMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: (data) => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], data)
    }
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (notificationsRef.current && notificationsRef.current.contains(target)) {
        return
      }
      if (profileRef.current && profileRef.current.contains(target)) {
        return
      }
      setNotificationsOpen(false)
      setProfileOpen(false)
    }
    if (notificationsOpen || profileOpen) {
      window.addEventListener('mousedown', handleClickOutside)
    }
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [notificationsOpen, profileOpen])

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-surface px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          {meta.breadcrumbs.map((crumb, index) => (
            <span key={`${crumb}-${index}`} className="flex items-center gap-2">
              <span>{crumb}</span>
              {index < meta.breadcrumbs.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-muted/60" />
              )}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-text">{meta.title}</h1>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {user?.role ?? 'guest'}
          </span>
        </div>
        <p className="text-sm text-muted">Welcome back {user?.name ?? 'Guest'}.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative" ref={notificationsRef}>
          <button
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition hover:bg-surface-alt"
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setNotificationsOpen((prev) => !prev)
              setProfileOpen(false)
            }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4a5 5 0 0 0-5 5v3l-2 3h14l-2-3V9a5 5 0 0 0-5-5z" />
              <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text">Notifications</p>
                <button
                  className="text-xs font-semibold text-muted transition hover:text-text"
                  type="button"
                  onClick={() => {
                    clearAllMutation.mutate()
                  }}
                >
                  Clear all
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {isLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}
                {!isLoading && notifications.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
                    No alerts yet.
                  </div>
                )}
                {!isLoading &&
                  notifications.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (!item.read) {
                          markReadMutation.mutate(item.id)
                        }
                        navigate(routePaths.app.notifications)
                        setNotificationsOpen(false)
                      }}
                      className={`flex w-full flex-col gap-1 rounded-xl border px-3 py-2 text-left text-xs transition ${
                        item.read
                          ? 'border-border bg-surface-alt text-muted'
                          : 'border-brand-200 bg-brand-50 text-brand-700'
                      }`}
                    >
                      <span className="font-semibold text-text">{item.title}</span>
                      <span>{item.message}</span>
                    </button>
                  ))}
              </div>
              <Button
                variant="ghost"
                className="mt-3 w-full justify-center"
                onClick={() => {
                  navigate(routePaths.app.notifications)
                  setNotificationsOpen(false)
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-3 rounded-full border border-border bg-surface-alt px-3 py-1.5 text-sm font-semibold text-text transition hover:bg-surface"
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev)
              setNotificationsOpen(false)
            }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-200 text-brand-800">
              {user?.name?.slice(0, 1) ?? 'G'}
            </span>
            <span className="hidden sm:block">{user?.name ?? 'Guest'}</span>
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-muted" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.1l3.71-3.87a.75.75 0 1 1 1.08 1.04l-4.25 4.42a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
            </svg>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text">{user?.name ?? 'Guest'}</p>
                <p className="text-xs text-muted">{user?.email ?? 'guest@weddingspeech.ai'}</p>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    navigate(routePaths.app.notificationSettings)
                    setProfileOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-alt"
                >
                  Account settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAuth()
                    setProfileOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-danger-700 transition hover:bg-danger-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
