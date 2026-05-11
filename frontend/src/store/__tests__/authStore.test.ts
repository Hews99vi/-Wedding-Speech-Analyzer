import { useAuthStore } from '../authStore'
import type { User } from '../../types/auth'

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'videographer',
  status: 'active',
}

beforeEach(() => {
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false })
  localStorage.clear()
})

describe('authStore', () => {
  it('initial state is unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it('setAuth sets all fields and isAuthenticated', () => {
    useAuthStore.getState().setAuth({ user: MOCK_USER, accessToken: 'tok-abc' })
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(MOCK_USER)
    expect(state.accessToken).toBe('tok-abc')
  })

  it('clearAuth resets all fields', () => {
    useAuthStore.getState().setAuth({ user: MOCK_USER, accessToken: 'tok-abc' })
    useAuthStore.getState().clearAuth()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it('setAccessToken updates token without changing user', () => {
    useAuthStore.getState().setAuth({ user: MOCK_USER, accessToken: 'old-tok' })
    useAuthStore.getState().setAccessToken('new-tok')
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('new-tok')
    expect(state.user).toEqual(MOCK_USER)
  })

  it('hasRole returns true for matching role', () => {
    useAuthStore.getState().setAuth({ user: MOCK_USER, accessToken: 'tok' })
    expect(useAuthStore.getState().hasRole(['videographer'])).toBe(true)
  })

  it('hasRole returns true when role is in the list', () => {
    useAuthStore.getState().setAuth({ user: MOCK_USER, accessToken: 'tok' })
    expect(useAuthStore.getState().hasRole(['admin', 'videographer'])).toBe(true)
  })

  it('hasRole returns false for wrong role', () => {
    useAuthStore.getState().setAuth({ user: MOCK_USER, accessToken: 'tok' })
    expect(useAuthStore.getState().hasRole(['admin'])).toBe(false)
  })

  it('hasRole returns false when no user', () => {
    expect(useAuthStore.getState().hasRole(['videographer'])).toBe(false)
  })
})
