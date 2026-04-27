export interface Notification {
  id: string
  user_id: string
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'ProcessingComplete'
    | 'KeyMomentsDetected'
    | 'AudioQualityIssue'
  title: string
  message: string
  read: boolean
  job_id: string | null
  created_at: string

  // Compatibility field for existing UI pages.
  createdAt?: string
}

export type NotificationOut = Notification
export type NotificationType = Notification['type']
export type NotificationItem = Notification
