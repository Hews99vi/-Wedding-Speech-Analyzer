import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types/auth'
import { getRoleRedirect, routePaths } from './routePaths'

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={routePaths.auth.login} state={{ from: location }} replace />
  }

  return <>{children}</>
}

export const RequireRole = ({
  roles,
  children
}: {
  roles: Role[]
  children: ReactNode
}) => {
  const hasRole = useAuthStore((state) => state.hasRole(roles))

  if (!hasRole) {
    return <Navigate to={routePaths.unauthorized} replace />
  }

  return <>{children}</>
}

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.user?.role)

  if (isAuthenticated && role) {
    return <Navigate to={getRoleRedirect(role)} replace />
  }

  return <>{children}</>
}

export const RootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.user?.role)

  if (!isAuthenticated || !role) {
    return <Navigate to={routePaths.auth.login} replace />
  }

  return <Navigate to={getRoleRedirect(role)} replace />
}
