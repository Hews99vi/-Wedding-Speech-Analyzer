import { clsx } from 'clsx'

export const Progress = ({
  value,
  className
}: {
  value: number
  className?: string
}) => {
  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-surface-alt', className)}>
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
