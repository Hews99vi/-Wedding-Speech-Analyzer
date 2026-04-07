import api from './client'
import { useAuthStore } from '../store/authStore'

export const refreshAccessToken = async () => {
  try {
    // TODO: Replace with real refresh endpoint and response shape.
    const response = await api.post('/auth/refresh')
    const accessToken = (response.data as { accessToken?: string }).accessToken
    const user = useAuthStore.getState().user

    if (accessToken && user) {
      useAuthStore.getState().setAuth({ user, accessToken })
      return true
    }

    return false
  } catch {
    return false
  }
}
