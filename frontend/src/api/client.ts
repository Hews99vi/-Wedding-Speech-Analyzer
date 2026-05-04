import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const store = useAuthStore.getState()
      if (store.isAuthenticated) {
        // Session expired mid-use — clear state and force re-login.
        store.clearAuth()
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
      // If not authenticated (e.g. during the login flow itself), just let
      // the error propagate so the caller can show a proper message.
    }
    return Promise.reject(error)
  }
)

export default api
