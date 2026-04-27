import api from './client'
import type { TokenResponse } from '../types/auth'

export async function registerUser(data: {
  name: string
  email: string
  password: string
  role: 'videographer' | 'editor' | 'admin'
}): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/register', data)
  return response.data
}

export async function loginUser(data: {
  email: string
  password: string
}): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/login', data)
  return response.data
}

export async function refreshToken(refresh_token: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/refresh', { refresh_token })
  return response.data
}
