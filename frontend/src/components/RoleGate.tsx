import type { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import type { Role } from '../types/auth'

export const RoleGate = ({
  roles,
  children
}: {
  roles: Role[]
  children: ReactNode
}) => {
  const hasRole = useAuthStore((state) => state.hasRole(roles))
  if (!hasRole) return null
  return <>{children}</>
}
