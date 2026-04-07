import type { Role } from '../types/auth'

export const routePaths = {
  root: '/',
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password'
  },
  app: {
    root: '/app',
    videographer: '/app/videographer',
    editor: '/app/editor',
    admin: '/app/admin',
    adminUsers: '/app/admin/users',
    jobs: '/app/jobs',
    newAnalysis: '/app/videographer/new-analysis',
    notifications: '/app/notifications',
    notificationSettings: '/app/notifications/settings',
    transcript: '/app/jobs/:jobId/transcript'
  },
  unauthorized: '/unauthorized'
}

export const getRoleRedirect = (role: Role) => {
  switch (role) {
    case 'admin':
      return routePaths.app.admin
    case 'editor':
      return routePaths.app.editor
    case 'videographer':
    default:
      return routePaths.app.videographer
  }
}
