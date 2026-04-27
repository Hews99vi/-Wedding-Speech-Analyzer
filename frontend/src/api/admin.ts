import api from './client'
import type { Role, User } from '../types/auth'

export type AdminUser = User & {
  status: 'active' | 'suspended'
  created_at: string
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>('/admin/users')
  return response.data
}

export async function updateAdminUserRole(
  userId: string,
  role: Role
): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role })
  return response.data
}

export async function updateAdminUserStatus(
  userId: string,
  status: AdminUser['status']
): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${userId}/status`, { status })
  return response.data
}

export async function deleteAdminUser(userId: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/admin/users/${userId}`)
  return response.data
}
