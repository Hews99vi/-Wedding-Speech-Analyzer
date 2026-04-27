import api from './client'
import type { NotificationOut } from '../types/notification'

const withCreatedAtAlias = (item: NotificationOut): NotificationOut => ({
  ...item,
  createdAt: item.created_at
})

export async function fetchNotifications(): Promise<NotificationOut[]> {
  const response = await api.get<NotificationOut[]>('/notifications')
  return response.data.map(withCreatedAtAlias)
}

export async function markNotificationRead(id: string): Promise<NotificationOut> {
  const response = await api.patch<NotificationOut>(`/notifications/${id}`)
  return withCreatedAtAlias(response.data)
}

export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const response = await api.patch<{ message: string }>('/notifications/read-all')
  return response.data
}

export async function clearAllNotifications(): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>('/notifications')
  return response.data
}
