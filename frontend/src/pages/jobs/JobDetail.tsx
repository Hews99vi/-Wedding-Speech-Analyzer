import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import {
  downloadExportCsv,
  downloadExportJson,
  getJob,
  retryJob
} from '../../api/jobs'
import type { JobOut } from '../../types/job'
import { routePaths } from '../../routes/routePaths'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger'
type ExportFormat = 'csv' | 'json'

const timelineSteps = [
  'Queued',
  'Uploading Audio',
  'Noise Reduction',
  'Speaker Diarization',
  'Speech Recognition',
  'NLP Analysis',
  'Highlights ready'
]

const statusVariant: Record<JobOut['status'], BadgeVariant> = {
  queued: 'default',
  uploading: 'warning',
  processing: 'warning',
  ready: 'success',
  failed: 'danger'
}

const statusLabel: Record<JobOut['status'], string> = {
  queued: 'Queued',
  uploading: 'Uploading',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed'
}

const formatDuration = (seconds: number | null) => {
  if (seconds === null || !Number.isFinite(seconds)) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString()
}

const formatLanguage = (language: JobOut['language']) => {
  return language === 'si' || language === 'Sinhala' ? 'Sinhala' : 'English'
}

const safeFilename = (name: string) => {
  return name.trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'job'
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const JobDetail = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const hasShownReadyToast = useRef(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['jobs', 'detail', jobId],
    queryFn: () => getJob(jobId as string),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'queued' || status === 'processing' ? 6000 : false
    }
  })

  const retryMutation = useMutation({
    mutationFn: () => retryJob(jobId as string),
    onSuccess: () => {
      toast.success('Job queued for retry')
      refetch()
    },
    onError: () => {
      toast.error('Unable to retry this job. Please try again.')
    }
  })

  const exportMutation = useMutation({
    mutationFn: async (format: ExportFormat) => {
      if (!jobId) throw new Error('Missing job id')
      return format === 'csv' ? downloadExportCsv(jobId) : downloadExportJson(jobId)
    },
    onSuccess: (blob, format) => {
      const baseName = safeFilename(data?.name ?? `job-${jobId}`)
      downloadBlob(blob, `${baseName}_transcript.${format}`)
      toast.success(`${format.toUpperCase()} export ready`)
      setExportOpen(false)
    },
    onError: () => {
      toast.error('Unable to download export. Please try again.')
    }
  })

  const status = data?.status
  const canOpenResults = status === 'ready'
  const stepIndex = data ? Math.min(data.step_index, timelineSteps.length - 1) : 0

  const metadata = useMemo(() => {
    if (!data) return null
    return {
      duration: formatDuration(data.duration_seconds),
      createdAt: formatDate(data.created_at),
      language: formatLanguage(data.language),
      owner: data.user_id,
      keyMoments: '--',
      updatedAt: formatDate(data.updated_at)
    }
  }, [data])

  useEffect(() => {
    if (!data) return
    if (data.status === 'ready' && !hasShownReadyToast.current) {
      hasShownReadyToast.current = true
      toast.success('Processing complete. Transcript and highlights are ready.', {
        action: {
          label: 'View transcript',
          onClick: () => navigate(`${routePaths.app.jobs}/${data.id}/transcript`)
        }
      })
    }
    if (data.status !== 'ready') {
      hasShownReadyToast.current = false
    }
  }, [data, navigate])

  if (!jobId) {
    return (
      <Card>
        <p className="text-sm text-muted">Job not found.</p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted">Loading job details...</p>
      </Card>
    )
  }

  if (isError || !data || !metadata) {
    return (
      <ErrorState
        title="Job unavailable"
        description="We could not load this job from the API."
        onAction={() => refetch()}
      />
    )
  }

  const openTranscript = () => {
    if (!canOpenResults) return
    navigate(`${routePaths.app.jobs}/${jobId}/transcript`)
  }

  const openExport = () => {
    if (!canOpenResults) return
    setExportOpen(true)
  }

  const handleExport = () => {
    exportMutation.mutate(exportFormat)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-text">{data.name}</h2>
          <p className="text-sm text-muted">
            Job #{data.id} - {metadata.duration} - {metadata.createdAt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[data.status]}>{statusLabel[data.status]}</Badge>
          <Button variant="secondary" disabled={!canOpenResults} onClick={openTranscript}>
            View transcript
          </Button>
          <Button variant="ghost" disabled={!canOpenResults} onClick={openExport}>
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text">Processing timeline</p>
              <p className="text-xs text-muted">
                Status refreshes every 6 seconds while processing.
              </p>
            </div>
            <Badge variant={statusVariant[data.status]}>{statusLabel[data.status]}</Badge>
          </div>
          <div className="space-y-3">
            {timelineSteps.map((step, index) => {
              const isComplete = data.status === 'ready' || index < stepIndex
              const isCurrent =
                data.status !== 'ready' && data.status !== 'failed' && index === stepIndex
              return (
                <div
                  key={step}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                    isComplete
                      ? 'border-success-500/40 bg-success-50 text-success-700'
                      : isCurrent
                      ? 'border-brand-200 bg-brand-50 text-brand-700'
                      : 'border-border bg-surface-alt text-muted'
                  }`}
                >
                  <span>{step}</span>
                  <span className="text-xs font-semibold">
                    {isComplete && 'Done'}
                    {isCurrent && 'In progress'}
                    {!isComplete && !isCurrent && 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
          {data.status === 'failed' && (
            <div className="rounded-xl border border-danger-500/40 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              <p className="font-semibold text-danger-700">Processing failed</p>
              <p className="mt-2 text-xs text-danger-700">
                {data.error_message ?? 'The analysis failed before completion.'}
              </p>
              <Button
                variant="secondary"
                className="mt-3"
                disabled={retryMutation.isPending}
                onClick={() => retryMutation.mutate()}
              >
                {retryMutation.isPending ? 'Retrying...' : 'Retry processing'}
              </Button>
            </div>
          )}
          {data.status === 'ready' && (
            <div className="rounded-xl border border-success-500/40 bg-success-50 px-4 py-3 text-sm text-success-700">
              Transcript and highlights are ready for review or export.
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={openTranscript}>View transcript</Button>
                <Button variant="secondary" onClick={openExport}>Export transcript</Button>
              </div>
            </div>
          )}
        </Card>
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-text">Job metadata</p>
            <p className="text-xs text-muted">Workflow context and ownership.</p>
          </div>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted">Owner</span>
              <span className="truncate font-semibold text-text">{metadata.owner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Language</span>
              <span className="font-semibold text-text">{metadata.language}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Key moments</span>
              <span className="font-semibold text-text">{metadata.keyMoments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Last update</span>
              <span className="font-semibold text-text">{metadata.updatedAt}</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Button className="justify-start" disabled={!canOpenResults} onClick={openExport}>
              Export transcript
            </Button>
            <Button variant="secondary" className="justify-start" disabled={!canOpenResults} onClick={openTranscript}>
              Download transcript
            </Button>
          </div>
        </Card>
      </div>

      {exportOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-text">Export transcript</p>
                <p className="text-xs text-muted">
                  Download the backend transcript and highlights export.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setExportOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-muted">Format</label>
                <div className="flex flex-wrap gap-2">
                  {(['csv', 'json'] as const).map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setExportFormat(format)}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        exportFormat === format
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-alt text-muted'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-alt px-4 py-3 text-xs text-muted">
                The export contains transcript segments and detected highlights for this ready job.
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={() => setExportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={exportMutation.isPending}>
                  {exportMutation.isPending ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
