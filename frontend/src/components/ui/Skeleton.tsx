import { clsx } from 'clsx'

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-surface-alt/70',
        className
      )}
    />
  )
}
