export type Role = 'videographer' | 'editor' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}
