import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Role, User } from '../types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (payload: { user: User; accessToken: string; refreshToken: string }) => void
  clearAuth: () => void
  hasRole: (roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      hasRole: (roles) => {
        const role = get().user?.role
        return role ? roles.includes(role) : false
      }
    }),
    {
      name: 'wsa-auth',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
