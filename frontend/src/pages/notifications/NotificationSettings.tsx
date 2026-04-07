import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export const NotificationSettings = () => {
  const [processingEmail, setProcessingEmail] = useState(true)
  const [momentsEmail, setMomentsEmail] = useState(true)
  const [qualityEmail, setQualityEmail] = useState(false)

  return (
    <div className="space-y-6">
      <Card className="space-y-2">
        <p className="text-lg font-semibold text-text">Notification settings</p>
        <p className="text-sm text-muted">
          Choose which alerts are delivered to email. In-app notifications are always on.
        </p>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Processing complete</p>
            <p className="text-xs text-muted">Email when a job finishes processing.</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              processingEmail ? 'bg-brand-600' : 'bg-border'
            }`}
            onClick={() => setProcessingEmail((prev) => !prev)}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                processingEmail ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Key moments detected</p>
            <p className="text-xs text-muted">Email when key moments are tagged.</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              momentsEmail ? 'bg-brand-600' : 'bg-border'
            }`}
            onClick={() => setMomentsEmail((prev) => !prev)}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                momentsEmail ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Audio quality issue</p>
            <p className="text-xs text-muted">Email when quality drops or noise is detected.</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              qualityEmail ? 'bg-brand-600' : 'bg-border'
            }`}
            onClick={() => setQualityEmail((prev) => !prev)}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                qualityEmail ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <Button variant="secondary" className="justify-start">
          Save preferences
        </Button>
      </Card>
    </div>
  )
}
