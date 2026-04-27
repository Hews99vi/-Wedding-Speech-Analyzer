export type Role = 'videographer' | 'editor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status?: 'active' | 'suspended'
  created_at?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}
