import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { routePaths } from '../../routes/routePaths'

type JobStatus = 'uploading' | 'processing' | 'ready' | 'failed'

type Highlight = {
  startTime: number
  endTime: number
  text: string
  score: number
  label: string
  speaker: string
}

interface JobDetailData {
  id: string
  name: string
  createdAt: string
  duration: string
  status: JobStatus
  keyMoments: number
  owner: string
  language: string
  stepIndex: number
  error?: string
}

const timelineSteps = [
  'Uploaded',
  'Noise reduction',
  'Diarization',
  'STT',
  'NLP scoring',
  'Highlights ready'
]

const runtimeMap = new Map<string, number>()
const overrideMap = new Map<string, { retriedAt?: number }>()

const mockHighlights: Highlight[] = [
  {
    startTime: 42,
    endTime: 58,
    text: 'You taught me how to be brave, and today I promise to do the same.',
    score: 9.6,
    label: 'Emotional peak',
    speaker: 'Speaker 1'
  },
  {
    startTime: 128,
    endTime: 142,
    text: 'We laughed through the rain and still found the dance floor.',
    score: 8.8,
    label: 'Humor',
    speaker: 'Speaker 2'
  },
  {
    startTime: 201,
    endTime: 226,
    text: 'Raise your glasses to the couple who make every moment shine.',
    score: 8.4,
    label: 'Toast',
    speaker: 'Speaker 1'
  },
  {
    startTime: 302,
    endTime: 330,
    text: 'I promise to choose you every day and honor the life we are building.',
    score: 9.1,
    label: 'Vows',
    speaker: 'Speaker 1'
  },
  {
    startTime: 412,
    endTime: 430,
    text: 'Let your love be the gentle compass in every season.',
    score: 7.9,
    label: 'Advice',
    speaker: 'Speaker 2'
  }
]

const mockFetchJobDetail = async (jobId: string): Promise<JobDetailData> => {
  if (!runtimeMap.has(jobId)) {
    runtimeMap.set(jobId, Date.now())
  }

  const retriedAt = overrideMap.get(jobId)?.retriedAt
  if (retriedAt) {
    runtimeMap.set(jobId, retriedAt)
  }

  const start = runtimeMap.get(jobId) ?? Date.now()
  const elapsed = Math.floor((Date.now() - start) / 1000)
  const baseName = jobId.includes('1021') ? 'Riverview Reception' : `Job ${jobId}`
  const failLocked = jobId.includes('1021') || jobId.toLowerCase().includes('fail')
  const shouldFail = failLocked && !retriedAt

  if (shouldFail) {
    return {
      id: jobId,
      name: baseName,
      createdAt: '2026-02-15',
      duration: '51:12',
      status: 'failed',
      keyMoments: 0,
      owner: 'Studio Ops',
      language: 'English',
      stepIndex: 2,
      error: 'Audio signal dropped during diarization. Re-upload or retry processing.'
    }
  }

  const stepIndex = Math.min(timelineSteps.length - 1, Math.floor(elapsed / 6))
  const status: JobStatus = stepIndex >= timelineSteps.length - 1 ? 'ready' : 'processing'

  return {
    id: jobId,
    name: baseName,
    createdAt: '2026-02-20',
    duration: '42:18',
    status,
    keyMoments: status === 'ready' ? 12 : Math.max(3, stepIndex + 1),
    owner: 'Lydia Rivera',
    language: 'English',
    stepIndex
  }
}

const formatTimestamp = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const toCsv = (rows: Highlight[]) => {
  const header = ['startTime', 'endTime', 'text', 'score', 'label', 'speaker']
  const lines = rows.map((row) => [
    row.startTime.toString(),
    row.endTime.toString(),
    JSON.stringify(row.text),
    row.score.toString(),
    JSON.stringify(row.label),
    JSON.stringify(row.speaker)
  ])
  return [header.join(','), ...lines.map((line) => line.join(','))].join('\n')
}

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
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

  const { data, refetch } = useQuery({
    queryKey: ['jobs', 'detail', jobId],
    queryFn: () => mockFetchJobDetail(jobId ?? 'unknown'),
    refetchInterval: 6000,
    enabled: !!jobId
  })

  const statusVariant = useMemo(() => {
    if (!data) return 'default'
    if (data.status === 'ready') return 'success'
    if (data.status === 'failed') return 'danger'
    if (data.status === 'processing') return 'warning'
    return 'default'
  }, [data])

  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [topCount, setTopCount] = useState(5)
  const [minScore, setMinScore] = useState(7.5)
  const [includeTranscript, setIncludeTranscript] = useState(false)

  const filteredHighlights = useMemo(() => {
    return mockHighlights
      .filter((item) => item.score >= minScore)
      .slice(0, topCount)
  }, [minScore, topCount])

  useEffect(() => {
    if (!data) return
    if (data.status === 'ready' && !hasShownReadyToast.current) {
      hasShownReadyToast.current = true
      toast.success('Processing complete. Transcript and highlights are ready.', {
        action: {
          label: 'View transcript',
          onClick: () => navigate(routePaths.app.jobs)
        }
      })
    }
    if (data.status !== 'ready') {
      hasShownReadyToast.current = false
    }
  }, [data, navigate])

  if (!jobId || !data) {
    return (
      <Card>
        <p className="text-sm text-muted">Loading job details...</p>
      </Card>
    )
  }

  const handleRetry = () => {
    overrideMap.set(jobId, { retriedAt: Date.now() })
    refetch()
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      downloadFile(toCsv(filteredHighlights), `job-${jobId}-highlights.csv`, 'text/csv')
      toast.success('CSV export ready')
      return
    }

    const payload = {
      jobId,
      includeTranscript,
      highlights: filteredHighlights,
      metadata: {
        createdAt: data.createdAt,
        duration: data.duration,
        language: data.language,
        owner: data.owner
      }
    }
    downloadFile(JSON.stringify(payload, null, 2), `job-${jobId}-highlights.json`, 'application/json')
    toast.success('JSON export ready')
  }

  const handleCopyTimestamps = async () => {
    const text = filteredHighlights
      .map((item) => `${formatTimestamp(item.startTime)} - ${formatTimestamp(item.endTime)}: ${item.label}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Timestamps copied')
    } catch {
      toast.error('Unable to copy timestamps')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-text">{data.name}</h2>
          <p className="text-sm text-muted">
            Job #{data.id} · {data.duration} · {data.createdAt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant as 'default' | 'success' | 'warning' | 'danger'}>
            {data.status}
          </Badge>
          <Button variant="secondary">View transcript</Button>
          <Button variant="ghost" onClick={() => setExportOpen(true)}>
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
                Live status updates every 6 seconds. WebSocket channel placeholder ready.
              </p>
            </div>
            <Badge variant={statusVariant as 'default' | 'success' | 'warning' | 'danger'}>
              {data.status}
            </Badge>
          </div>
          <div className="space-y-3">
            {timelineSteps.map((step, index) => {
              const isComplete = index < data.stepIndex
              const isCurrent = index === data.stepIndex && data.status !== 'failed'
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
              <p className="mt-2 text-xs text-danger-700">{data.error}</p>
              <Button variant="secondary" className="mt-3" onClick={handleRetry}>
                Retry processing
              </Button>
            </div>
          )}
          {data.status === 'ready' && (
            <div className="rounded-xl border border-success-500/40 bg-success-50 px-4 py-3 text-sm text-success-700">
              Highlights are ready. Share with your editor or export the transcript.
              <div className="mt-3 flex flex-wrap gap-2">
                <Button>View transcript</Button>
                <Button variant="secondary">Notify editor</Button>
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
            <div className="flex items-center justify-between">
              <span className="text-muted">Owner</span>
              <span className="font-semibold text-text">{data.owner}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Language</span>
              <span className="font-semibold text-text">{data.language}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Key moments</span>
              <span className="font-semibold text-text">{data.keyMoments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Last update</span>
              <span className="font-semibold text-text">Just now</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Button className="justify-start" onClick={() => setExportOpen(true)}>
              Export highlights
            </Button>
            <Button variant="secondary" className="justify-start">
              Download transcript
            </Button>
            <Button variant="ghost" className="justify-start">
              Add notes
            </Button>
          </div>
        </Card>
      </div>

      {exportOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-text">Export highlights</p>
                <p className="text-xs text-muted">Prepare CSV or JSON outputs for editing.</p>
              </div>
              <Button variant="ghost" onClick={() => setExportOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-muted">Format</label>
                  <div className="flex flex-wrap gap-2">
                    {['csv', 'json'].map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setExportFormat(format as 'csv' | 'json')}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          exportFormat === format
                            ? 'bg-brand-600 text-white'
                            : 'bg-surface-alt text-muted'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                    <span className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-xs text-muted">
                      EDL / XML · Coming soon
                    </span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="text-xs font-semibold text-muted">Top highlights</label>
                  <input
                    type="range"
                    min={1}
                    max={mockHighlights.length}
                    value={topCount}
                    onChange={(event) => setTopCount(Number(event.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Top {topCount} highlights</span>
                    <span>{mockHighlights.length} total</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="text-xs font-semibold text-muted">Minimum score</label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={minScore}
                    onChange={(event) => setMinScore(Number(event.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Min score {minScore.toFixed(1)}</span>
                    <span>Out of 10</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={includeTranscript}
                    onChange={() => setIncludeTranscript((prev) => !prev)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Include full transcript (JSON only)
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleExport}>Download</Button>
                  <Button variant="secondary" onClick={handleCopyTimestamps}>
                    Copy timestamps
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">Preview</p>
                  <span className="text-xs text-muted">{filteredHighlights.length} items</span>
                </div>
                <div className="max-h-80 overflow-auto rounded-2xl border border-border">
                  <table className="min-w-full text-left text-xs text-muted">
                    <thead className="bg-surface-alt text-[11px] uppercase text-muted">
                      <tr>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Label</th>
                        <th className="px-3 py-2">Score</th>
                        <th className="px-3 py-2">Speaker</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHighlights.map((item) => (
                        <tr key={`${item.label}-${item.startTime}`} className="border-t border-border">
                          <td className="px-3 py-2 text-text">
                            {formatTimestamp(item.startTime)} - {formatTimestamp(item.endTime)}
                          </td>
                          <td className="px-3 py-2">{item.label}</td>
                          <td className="px-3 py-2">{item.score.toFixed(1)}</td>
                          <td className="px-3 py-2">{item.speaker}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
