import { routePaths } from './routePaths'

export const routeMeta = {
  [routePaths.app.videographer]: {
    title: 'Videographer Dashboard',
    breadcrumbs: ['Dashboard', 'Videographer']
  },
  [routePaths.app.newAnalysis]: {
    title: 'Create Analysis Job',
    breadcrumbs: ['Dashboard', 'Videographer', 'New Analysis']
  },
  [routePaths.app.jobs]: {
    title: 'Jobs',
    breadcrumbs: ['Dashboard', 'Jobs']
  },
  [routePaths.app.notifications]: {
    title: 'Notifications',
    breadcrumbs: ['Dashboard', 'Notifications']
  },
  [routePaths.app.notificationSettings]: {
    title: 'Notification Settings',
    breadcrumbs: ['Dashboard', 'Notifications', 'Settings']
  },
  [routePaths.app.editor]: {
    title: 'Editor Dashboard',
    breadcrumbs: ['Dashboard', 'Editor']
  },
  [routePaths.app.admin]: {
    title: 'Admin Dashboard',
    breadcrumbs: ['Dashboard', 'Admin']
  },
  [routePaths.app.adminUsers]: {
    title: 'User Management',
    breadcrumbs: ['Dashboard', 'Admin', 'Users']
  },
  [routePaths.app.transcript]: {
    title: 'Transcript Viewer',
    breadcrumbs: ['Dashboard', 'Jobs', 'Transcript']
  }
}

export const getRouteMeta = (pathname: string) => {
  const cleaned = pathname.replace(/\/+$/, '')
  if (cleaned.startsWith(`${routePaths.app.jobs}/`) && cleaned.endsWith('/transcript')) {
    return routeMeta[routePaths.app.transcript]
  }
  if (cleaned.startsWith(`${routePaths.app.jobs}/`)) {
    return {
      title: 'Job Details',
      breadcrumbs: ['Dashboard', 'Jobs', 'Detail']
    }
  }
  return (
    routeMeta[cleaned as keyof typeof routeMeta] ?? {
      title: 'Dashboard',
      breadcrumbs: ['Dashboard']
    }
  )
}
