import { Switch } from '@headlessui/react'
import { clsx } from 'clsx'
import { useUiStore, type ThemeMode } from '../../store/uiStore'

const nextTheme = (theme: ThemeMode) => {
  if (theme === 'light') return 'dark'
  if (theme === 'dark') return 'system'
  return 'light'
}

export const ThemeToggle = () => {
  const { theme, setTheme } = useUiStore()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <span className="hidden sm:inline">Theme</span>
      <Switch
        checked={isDark}
        onChange={() => setTheme(nextTheme(theme))}
        className={clsx(
          'relative inline-flex h-6 w-12 items-center rounded-full transition',
          isDark ? 'bg-brand-600' : 'bg-surface-alt'
        )}
      >
        <span
          className={clsx(
            'inline-block h-5 w-5 transform rounded-full bg-white transition',
            isDark ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </Switch>
      <span className="capitalize">{theme}</span>
    </div>
  )
}
