export type NotificationType =
  | 'ProcessingComplete'
  | 'KeyMomentsDetected'
  | 'AudioQualityIssue'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  createdAt: string
  read: boolean
}
