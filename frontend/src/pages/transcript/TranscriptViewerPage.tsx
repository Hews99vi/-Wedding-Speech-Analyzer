import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import {
  downloadJobAudio,
  downloadExportCsv,
  downloadExportJson,
  getHighlights,
  getTranscript
} from '../../api/jobs'
import type { HighlightOut, TranscriptSegmentOut } from '../../types/job'
import { TranscriptViewer, type Highlight, type HighlightType, type TranscriptSegment } from '../../components/transcript/TranscriptViewer'

type ExportFormat = 'csv' | 'json'

const labelMap: Record<NonNullable<TranscriptSegmentOut['highlight_label']>, HighlightType> = {
  'Emotional Peak': 'Emotional peak',
  Humor: 'Humor',
  Toast: 'Toast',
  Vows: 'Vows',
  Advice: 'Advice'
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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

const mapSegment = (segment: TranscriptSegmentOut): TranscriptSegment => ({
  id: segment.id,
  speaker: segment.speaker ?? 'Speaker 1',
  start: segment.start_time,
  end: segment.end_time,
  text: segment.text,
  highlight: segment.highlight_label ? labelMap[segment.highlight_label] : undefined
})

const mapHighlight = (highlight: HighlightOut): Highlight => ({
  id: highlight.segment_id ?? highlight.id,
  label: labelMap[highlight.label],
  score: highlight.score,
  timestamp: highlight.start_time,
  end: highlight.end_time
})

export const TranscriptViewerPage = () => {
  const { jobId } = useParams()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const syncFrameRef = useRef<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopRange, setLoopRange] = useState<{ start: number; end: number } | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')

  const transcriptQuery = useQuery({
    queryKey: ['jobs', 'transcript', jobId],
    queryFn: () => getTranscript(jobId as string),
    enabled: !!jobId
  })

  const highlightsQuery = useQuery({
    queryKey: ['jobs', 'highlights', jobId],
    queryFn: () => getHighlights(jobId as string),
    enabled: !!jobId
  })

  const audioQuery = useQuery({
    queryKey: ['jobs', 'audio', jobId],
    queryFn: () => downloadJobAudio(jobId as string),
    enabled: !!jobId && !!transcriptQuery.data
  })

  const exportMutation = useMutation({
    mutationFn: async (format: ExportFormat) => {
      if (!jobId) throw new Error('Missing job id')
      return format === 'csv' ? downloadExportCsv(jobId) : downloadExportJson(jobId)
    },
    onSuccess: (blob, format) => {
      downloadBlob(blob, `${safeFilename(`job-${jobId}`)}_transcript.${format}`)
      toast.success(`${format.toUpperCase()} export ready`)
    },
    onError: () => {
      toast.error('Unable to download transcript export. Please try again.')
    }
  })

  const segments = useMemo(() => {
    return (transcriptQuery.data ?? []).map(mapSegment)
  }, [transcriptQuery.data])

  const highlights = useMemo(() => {
    return (highlightsQuery.data ?? []).map(mapHighlight)
  }, [highlightsQuery.data])

  const maxTime = useMemo(() => {
    return segments.reduce((max, segment) => Math.max(max, segment.end), 0)
  }, [segments])

  const playerDuration = audioDuration || maxTime

  const activeSegmentIndex = useMemo(() => {
    const lastIndex = segments.length - 1
    const syncedTime = Math.min(currentTime + 0.08, playerDuration || maxTime || currentTime)
    const active = segments.findIndex((segment) => syncedTime >= segment.start && syncedTime < segment.end)
    if (active >= 0) return active
    const next = segments.findIndex((segment) => segment.start > syncedTime)
    if (next >= 0 && segments[next].start - syncedTime <= 0.75) return next
    const previous = next > 0 ? next - 1 : next === -1 ? lastIndex : -1
    if (previous >= 0 && syncedTime - segments[previous].end <= 0.75) return previous
    if (lastIndex >= 0 && currentTime >= segments[lastIndex].end) return lastIndex
    return null
  }, [currentTime, maxTime, playerDuration, segments])

  const syncAudioTime = useCallback((time: number) => {
    if (loopEnabled && loopRange && time >= loopRange.end) {
      if (audioRef.current) {
        audioRef.current.currentTime = loopRange.start
      }
      setCurrentTime(loopRange.start)
      return
    }
    setCurrentTime(time)
  }, [loopEnabled, loopRange])

  useEffect(() => {
    setAudioUrl(null)
    setAudioDuration(0)
    setAudioError(null)
    setCurrentTime(0)
    setIsPlaying(false)
    setLoopRange(null)
  }, [jobId])

  useEffect(() => {
    if (!audioQuery.data) return
    const nextUrl = URL.createObjectURL(audioQuery.data)
    setAudioUrl(nextUrl)
    setAudioError(null)
    return () => {
      URL.revokeObjectURL(nextUrl)
    }
  }, [audioQuery.data])

  useEffect(() => {
    if (!isPlaying) {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current)
        syncFrameRef.current = null
      }
      return
    }

    let lastSyncAt = 0
    const sync = (timestamp: number) => {
      if (audioRef.current && timestamp - lastSyncAt >= 80) {
        syncAudioTime(audioRef.current.currentTime)
        lastSyncAt = timestamp
      }
      syncFrameRef.current = requestAnimationFrame(sync)
    }

    syncFrameRef.current = requestAnimationFrame(sync)
    return () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current)
        syncFrameRef.current = null
      }
    }
  }, [isPlaying, syncAudioTime])

  useEffect(() => {
    return () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current)
      }
    }
  }, [])

  const seekTo = (time: number) => {
    const next = Math.min(Math.max(0, time), playerDuration || maxTime || 0)
    if (audioRef.current) {
      audioRef.current.currentTime = next
    }
    setCurrentTime(next)
  }

  const handleSeek = (time: number, end?: number) => {
    seekTo(time)
    if (end && end > time) {
      setLoopRange({ start: time, end })
    }
  }

  const jump = (delta: number) => {
    seekTo(currentTime + delta)
  }

  const togglePlayback = async () => {
    if (!audioRef.current || !audioUrl) return
    try {
      if (audioRef.current.paused) {
        await audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    } catch {
      setAudioError('Audio could not start. Check browser permissions or try again.')
    }
  }

  if (!jobId) {
    return (
      <Card>
        <p className="text-sm text-muted">Job not found.</p>
      </Card>
    )
  }

  if (transcriptQuery.isLoading || highlightsQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-muted">Loading transcript...</p>
      </Card>
    )
  }

  if (transcriptQuery.isError || highlightsQuery.isError) {
    return (
      <ErrorState
        title="Transcript unavailable"
        description="We could not load transcript data for this job. The job may not be ready yet."
        onAction={() => {
          transcriptQuery.refetch()
          highlightsQuery.refetch()
        }}
      />
    )
  }

  if (segments.length === 0) {
    return (
      <EmptyState
        title="No transcript found"
        description="This ready job does not have any transcript segments yet."
      />
    )
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-text">Transcript Viewer</h2>
          <p className="text-sm text-muted">Job #{jobId} - Audio-synced transcript.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Ready</Badge>
          <div className="flex items-center gap-2">
            <select
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value as ExportFormat)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <Button
              variant="secondary"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(exportFormat)}
            >
              {exportMutation.isPending ? 'Exporting...' : 'Export transcript'}
            </Button>
          </div>
          <Button disabled>Share highlights</Button>
        </div>
      </div>

      <TranscriptViewer
        activeSegmentIndex={activeSegmentIndex}
        followActive={isPlaying}
        highlights={highlights}
        segments={segments}
        onSeek={handleSeek}
      />

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onLoadedMetadata={() => {
                if (audioRef.current?.duration && Number.isFinite(audioRef.current.duration)) {
                  setAudioDuration(audioRef.current.duration)
                  setCurrentTime(audioRef.current.currentTime)
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false)
                setAudioError('Audio playback failed. The uploaded file may be unavailable or unsupported.')
              }}
              onTimeUpdate={() => {
                if (!audioRef.current) return
                syncAudioTime(audioRef.current.currentTime)
              }}
            />
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => jump(-5)} aria-label="Jump back 5 seconds">
                -5s
              </Button>
              <Button
                disabled={!audioUrl || audioQuery.isLoading}
                onClick={togglePlayback}
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {audioQuery.isLoading ? 'Loading audio...' : isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button variant="ghost" onClick={() => jump(5)} aria-label="Jump forward 5 seconds">
                +5s
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(playerDuration)}</span>
              {loopEnabled && loopRange && (
                <span className="rounded-full bg-brand-50 px-2 py-1 font-semibold text-brand-700">
                  Loop {formatTime(loopRange.start)}-{formatTime(loopRange.end)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLoopEnabled((prev) => !prev)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                loopEnabled ? 'bg-brand-600 text-white' : 'bg-surface-alt text-muted'
              }`}
              aria-pressed={loopEnabled}
              aria-label="Toggle loop highlight segment"
            >
              Loop highlight
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {(audioQuery.isError || audioError) && (
              <div className="rounded-xl border border-warning-500/40 bg-warning-50 px-3 py-2 text-xs text-warning-700">
                {audioError ?? 'Audio is unavailable for this job, but the transcript can still be reviewed.'}
              </div>
            )}
            <input
              type="range"
              min={0}
              max={playerDuration || 0}
              value={currentTime}
              onChange={(event) => seekTo(Number(event.target.value))}
              className="w-full accent-brand-500"
              aria-label="Seek audio timestamp"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
