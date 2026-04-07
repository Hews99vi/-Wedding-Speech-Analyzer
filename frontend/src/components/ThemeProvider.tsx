import { useEffect, type ReactNode } from 'react'
import { useUiStore } from '../store/uiStore'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useUiStore()

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark)

    root.classList.toggle('dark', isDark)
  }, [theme])

  return <>{children}</>
}
