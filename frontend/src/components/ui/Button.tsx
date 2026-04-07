import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = ({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-brand-600 text-white shadow-soft hover:bg-brand-700',
        variant === 'secondary' &&
          'bg-surface-alt text-text hover:bg-surface',
        variant === 'ghost' && 'bg-transparent text-text hover:bg-surface-alt',
        variant === 'danger' && 'bg-danger-500 text-white hover:bg-danger-700',
        className
      )}
      {...props}
    />
  )
}
