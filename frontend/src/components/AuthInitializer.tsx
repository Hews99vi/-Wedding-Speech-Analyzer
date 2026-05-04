import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { fetchMe } from '../api/auth'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      const store = useAuthStore.getState()
      if (session) {
        store.setAccessToken(session.access_token)
        if (!store.user) {
          try {
            const user = await fetchMe(session.access_token)
            if (!cancelled) store.setAuth({ user, accessToken: session.access_token })
          } catch {
            if (!cancelled) {
              store.clearAuth()
              // scope:'local' clears localStorage without hitting the server,
              // so a deleted/invalid user doesn't get stuck in a reload loop.
              supabase.auth.signOut({ scope: 'local' })
            }
          }
        }
      } else {
        store.clearAuth()
      }
      if (!cancelled) setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        useAuthStore.getState().setAccessToken(session.access_token)
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().clearAuth()
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    )
  }
  return <>{children}</>
}
