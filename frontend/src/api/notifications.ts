import type { NotificationItem, NotificationType } from '../types/notification'

const now = new Date()

const buildNotification = (
  id: string,
  type: NotificationType,
  title: string,
  message: string,
  offsetMinutes: number,
  read = false
): NotificationItem => ({
  id,
  type,
  title,
  message,
  createdAt: new Date(now.getTime() - offsetMinutes * 60000).toISOString(),
  read
})

let notifications: NotificationItem[] = [
  buildNotification(
    'notif-1',
    'ProcessingComplete',
    'Job complete',
    'Lydia & James highlights are ready to review.',
    12
  ),
  buildNotification(
    'notif-2',
    'KeyMomentsDetected',
    'Key moments detected',
    '8 key moments tagged for Siena Garden Ceremony.',
    45
  ),
  buildNotification(
    'notif-3',
    'AudioQualityIssue',
    'Audio quality issue',
    'Riverview Reception has low signal in segment 02.',
    90,
    true
  )
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fetchNotifications = async () => {
  await delay(400)
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export const markNotificationRead = async (id: string) => {
  await delay(200)
  notifications = notifications.map((item) =>
    item.id === id ? { ...item, read: true } : item
  )
  return notifications
}

export const clearAllNotifications = async () => {
  await delay(200)
  notifications = []
  return notifications
}
