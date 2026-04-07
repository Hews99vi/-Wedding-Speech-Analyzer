import { Button } from './Button'

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        Empty
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
