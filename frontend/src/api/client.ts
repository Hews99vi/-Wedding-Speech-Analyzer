import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import type { TokenResponse } from '../types/auth'

type PersistContainer = {
  state?: Record<string, unknown>
  [key: string]: unknown
}

type PersistRead = {
  key: 'auth-storage' | 'wsa-auth'
  container: PersistContainer
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

const AUTH_KEYS: Array<'auth-storage' | 'wsa-auth'> = ['auth-storage', 'wsa-auth']
const BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL
})

function getPersistedAuth(): PersistRead | null {
  for (const key of AUTH_KEYS) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw) as PersistContainer
      if (parsed && typeof parsed === 'object') {
        return { key, container: parsed }
      }
    } catch {
      continue
    }
  }
  return null
}

function getStateObject(container: PersistContainer): Record<string, unknown> {
  const maybeState = container.state
  if (maybeState && typeof maybeState === 'object') {
    return maybeState as Record<string, unknown>
  }
  return container
}

function readAccessToken(): string | null {
  const persisted = getPersistedAuth()
  if (!persisted) return null
  const state = getStateObject(persisted.container)
  const snake = state.access_token
  if (typeof snake === 'string' && snake) return snake
  const camel = state.accessToken
  if (typeof camel === 'string' && camel) return camel
  return null
}

function readRefreshToken(): string | null {
  const persisted = getPersistedAuth()
  if (!persisted) return null
  const state = getStateObject(persisted.container)
  const snake = state.refresh_token
  if (typeof snake === 'string' && snake) return snake
  const camel = state.refreshToken
  if (typeof camel === 'string' && camel) return camel
  return null
}

function persistTokens(payload: TokenResponse): void {
  const persisted = getPersistedAuth()
  const key = persisted?.key ?? 'auth-storage'
  const container: PersistContainer = persisted?.container ?? { state: {}, version: 0 }
  const state = getStateObject(container)

  state.access_token = payload.access_token
  state.refresh_token = payload.refresh_token
  state.accessToken = payload.access_token
  state.refreshToken = payload.refresh_token
  state.token_type = payload.token_type
  state.user = payload.user
  state.isAuthenticated = true

  if ('state' in container) {
    container.state = state
  }

  localStorage.setItem(key, JSON.stringify(container))
}

function clearPersistedAuth(): void {
  for (const key of AUTH_KEYS) {
    localStorage.removeItem(key)
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const requestUrl = originalRequest.url ?? ''
    if (
      originalRequest._retry ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const refreshToken = readRefreshToken()
    if (!refreshToken) {
      useAuthStore.getState().clearAuth()
      clearPersistedAuth()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const refreshResponse = await axios.post<TokenResponse>(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken
      })
      const refreshed = refreshResponse.data

      persistTokens(refreshed)
      useAuthStore.getState().setAuth({
        user: refreshed.user,
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token
      })

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`
      return api(originalRequest)
    } catch (refreshError) {
      useAuthStore.getState().clearAuth()
      clearPersistedAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  }
)

export default api
