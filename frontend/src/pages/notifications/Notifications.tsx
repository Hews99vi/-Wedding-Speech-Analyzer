import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { fetchNotifications, markNotificationRead, clearAllNotifications } from '../../api/notifications'
import type { NotificationItem } from '../../types/notification'
import { routePaths } from '../../routes/routePaths'

const typeLabel: Record<NotificationItem['type'], string> = {
  info: 'Info',
  success: 'Processing complete',
  warning: 'Warning',
  error: 'Error',
  ProcessingComplete: 'Processing complete',
  KeyMomentsDetected: 'Key moments detected',
  AudioQualityIssue: 'Audio quality issue'
}

const typeVariant: Record<NotificationItem['type'], 'default' | 'success' | 'warning' | 'danger'> = {
  info: 'default',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  ProcessingComplete: 'success',
  KeyMomentsDetected: 'warning',
  AudioQualityIssue: 'danger'
}

const getCreatedAt = (item: NotificationItem) => item.created_at ?? item.createdAt

export const Notifications = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  })

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  )

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (current = []) =>
        current.map((item) => (item.id === updatedNotification.id ? updatedNotification : item))
      )
    }
  })

  const clearAllMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.setQueryData<NotificationItem[]>(['notifications'], [])
    }
  })

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-text">Notifications</p>
            <p className="text-sm text-muted">
              Alerts on processing completion, key moments, and audio issues.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? 'warning' : 'default'}>
              {unreadCount} unread
            </Badge>
            <Button variant="ghost" onClick={() => navigate(routePaths.app.notificationSettings)}>
              Email settings
            </Button>
            <Button variant="secondary" onClick={() => clearAllMutation.mutate()}>
              Clear all
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
            All quiet. Processing alerts will show up here.
          </div>
        )}
        {!isLoading &&
          notifications.map((item) => (
            <div
              key={item.id}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-2xl border px-4 py-3 ${
                item.read
                  ? 'border-border bg-surface-alt/60'
                  : 'border-brand-200 bg-brand-50'
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={typeVariant[item.type]}>{typeLabel[item.type]}</Badge>
                  <span className="text-xs text-muted">
                    {new Date(getCreatedAt(item)).toLocaleString()}
                  </span>
                </div>
                <p className="break-words text-sm font-semibold text-text">{item.title}</p>
                <p className="break-words text-sm leading-6 text-muted">{item.message}</p>
              </div>
              <div className="flex items-center gap-2">
                {!item.read && (
                  <Button variant="secondary" onClick={() => markReadMutation.mutate(item.id)}>
                    Mark read
                  </Button>
                )}
                <Button variant="ghost">View job</Button>
              </div>
            </div>
          ))}
      </Card>
    </div>
  )
}
