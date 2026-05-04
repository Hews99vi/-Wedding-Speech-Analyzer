import { supabase } from '../lib/supabase'
import api from './client'
import type { User } from '../types/auth'

export async function loginUser(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'videographer' | 'editor'
) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } }
  })
}

export async function logoutUser() {
  return supabase.auth.signOut()
}

export async function forgotPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword })
}

export async function fetchMe(accessToken: string): Promise<User> {
  const { data } = await api.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  return data
}
