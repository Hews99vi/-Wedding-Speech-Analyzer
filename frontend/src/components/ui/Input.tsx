import { clsx } from 'clsx'
import { useState, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  )
}

export const Input = ({
  label,
  helperText,
  error,
  className,
  type,
  ...props
}: InputProps) => {
  const isPassword = type === 'password'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      {label && <span className="font-medium text-text">{label}</span>}
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={clsx(
            'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            isPassword && 'pr-10',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {(helperText || error) && (
        <span className={clsx('text-xs', error ? 'text-danger-700' : 'text-muted')}>
          {error ?? helperText}
        </span>
      )}
    </label>
  )
}
