import { routePaths, getRoleRedirect } from '../routePaths'

describe('routePaths', () => {
  it('routePaths.auth.login is /login', () => {
    expect(routePaths.auth.login).toBe('/login')
  })

  it('routePaths.app.videographer is /app/videographer', () => {
    expect(routePaths.app.videographer).toBe('/app/videographer')
  })

  it('routePaths.app.jobs is /app/jobs', () => {
    expect(routePaths.app.jobs).toBe('/app/jobs')
  })

  it('routePaths.app.admin is /app/admin', () => {
    expect(routePaths.app.admin).toBe('/app/admin')
  })
})

describe('getRoleRedirect', () => {
  it('admin → /app/admin', () => {
    expect(getRoleRedirect('admin')).toBe('/app/admin')
  })

  it('editor → /app/editor', () => {
    expect(getRoleRedirect('editor')).toBe('/app/editor')
  })

  it('videographer → /app/videographer', () => {
    expect(getRoleRedirect('videographer')).toBe('/app/videographer')
  })

  it('unknown role defaults to videographer path without crashing', () => {
    // TypeScript would catch this at compile time, but test runtime behaviour
    const result = getRoleRedirect('unknown' as any)
    expect(result).toBe('/app/videographer')
  })
})
