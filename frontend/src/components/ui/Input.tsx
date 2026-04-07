import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Input = ({
  label,
  helperText,
  error,
  className,
  ...props
}: InputProps) => {
  return (
    <label className="flex w-full flex-col gap-1 text-sm">
      {label && <span className="font-medium text-text">{label}</span>}
      <input
        className={clsx(
          'w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/30',
          className
        )}
        {...props}
      />
      {(helperText || error) && (
        <span className={clsx('text-xs', error ? 'text-danger-700' : 'text-muted')}>
          {error ?? helperText}
        </span>
      )}
    </label>
  )
}
