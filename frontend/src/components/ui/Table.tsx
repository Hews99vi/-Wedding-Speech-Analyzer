import { clsx } from 'clsx'
import type { TableHTMLAttributes } from 'react'

export const Table = ({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <table
        className={clsx('min-w-full text-sm text-text', className)}
        {...props}
      />
    </div>
  )
}
