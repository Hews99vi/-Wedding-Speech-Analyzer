import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Role, User } from '../types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (payload: { user: User; accessToken: string }) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  hasRole: (roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: ({ user, accessToken }) =>
        set({ user, accessToken, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
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
