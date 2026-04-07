import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger'

export const Badge = ({
  variant = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'default' && 'bg-surface-alt text-text',
        variant === 'success' && 'bg-success-50 text-success-700',
        variant === 'warning' && 'bg-warning-50 text-warning-700',
        variant === 'danger' && 'bg-danger-50 text-danger-700',
        className
      )}
      {...props}
    />
  )
}
