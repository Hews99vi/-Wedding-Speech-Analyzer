import { Button } from './Button'

export const ErrorState = ({
  title,
  description,
  actionLabel = 'Retry',
  onAction
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="rounded-full bg-danger-50 px-3 py-1 text-xs font-semibold text-danger-700">
        Error
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
