import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { createAnalysisJob } from '../../api/jobs'
import { routePaths } from '../../routes/routePaths'
import type { CreateJobPayload, Job, JobLanguage } from '../../types/job'

const MAX_FILE_SIZE_MB = 2048
const allowedExtensions = ['.mp3', '.wav', '.m4a']
const allowedTypes = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a'
]
const recordingMimeTypes = ['audio/mp4', 'audio/m4a', 'audio/wav']

type UploadState = 'idle' | 'uploading' | 'success' | 'error' | 'canceled'

type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped' | 'error' | 'denied'

type MicSupport = 'checking' | 'supported' | 'unsupported'

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes)) return '0 MB'
  const mb = bytes / 1024 / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

const validateFile = (file: File | null) => {
  if (!file) return 'Select an audio file to upload.'
  const lowerName = file.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext))
  const hasValidType = allowedTypes.includes(file.type)
  if (!hasValidExtension && !hasValidType) {
    return 'Allowed formats: mp3, wav, m4a.'
  }
  const sizeMb = file.size / 1024 / 1024
  if (sizeMb > MAX_FILE_SIZE_MB) {
    return `File exceeds ${MAX_FILE_SIZE_MB} MB.`
  }
  return null
}

const getRecordingMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return null
  return recordingMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

const extensionFromMime = (mimeType: string | null) => {
  if (!mimeType) return 'm4a'
  if (mimeType.includes('wav')) return 'wav'
  if (mimeType.includes('mpeg')) return 'mp3'
  return 'm4a'
}

export const NewAnalysis = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [jobName, setJobName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [language, setLanguage] = useState<JobLanguage>('English')
  const [notes, setNotes] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const lastPayloadRef = useRef<CreateJobPayload | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const [micSupport] = useState<MicSupport>(() => {
    if (typeof window === 'undefined') return 'checking'
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof MediaRecorder !== 'undefined'
      ? 'supported' : 'unsupported'
  })
  const [recordingMime] = useState<string | null>(getRecordingMimeType)
  const [micMessage, setMicMessage] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof MediaRecorder !== 'undefined'
    if (!supported) return 'Microphone capture is not supported in this browser.'
    return getRecordingMimeType() ? null : 'Recording is unavailable for mp3/wav/m4a in this browser.'
  })
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const timerRef = useRef<number | null>(null)

  const isUploading = uploadState === 'uploading'

  useEffect(() => {
    if (recorderState === 'recording') {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      return
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [recorderState])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
    }
  }, [audioUrl])

  const canSubmit = useMemo(() => {
    if (!jobName.trim() || !eventDate || !file) return false
    return !isUploading
  }, [jobName, eventDate, file, isUploading])

  const mutation = useMutation({
    mutationFn: async (payload: CreateJobPayload) => {
      abortRef.current = new AbortController()
      return createAnalysisJob(payload, setProgress, abortRef.current.signal)
    },
    onMutate: async (payload) => {
      setUploadState('uploading')
      setProgress(0)
      const now = new Date().toISOString()
      const eventDate = payload.eventDate || null
      const optimisticJob: Job = {
        id: `temp-${Date.now()}`,
        user_id: 'pending',
        name: payload.name,
        event_date: eventDate,
        eventDate: payload.eventDate,
        language: payload.language,
        notes: payload.notes ?? null,
        status: 'uploading',
        step_index: 0,
        step_label: 'Uploading',
        error_message: null,
        duration_seconds: null,
        created_at: now,
        updated_at: now,
        createdAt: now,
        updatedAt: now
      }
      const previousJobs = queryClient.getQueryData<Job[]>(['jobs']) ?? []
      queryClient.setQueryData<Job[]>(['jobs'], [optimisticJob, ...previousJobs])
      return { previousJobs, optimisticId: optimisticJob.id }
    },
    onError: (error, _payload, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData<Job[]>(['jobs'], context.previousJobs)
      }
      if (axios.isCancel(error)) {
        setUploadState('canceled')
      } else {
        setUploadState('error')
      }
    },
    onSuccess: (data, _payload, context) => {
      const jobId = data.jobId ?? data.id ?? context?.optimisticId ?? `job-${Date.now()}`
      queryClient.setQueryData<Job[]>(['jobs'], (current = []) =>
        current.map((job) =>
          job.id === context?.optimisticId
            ? { ...job, id: jobId, status: data.status ?? 'processing' }
            : job
        )
      )
      setUploadState('success')
      setProgress(100)
      navigate(`${routePaths.app.jobs}/${jobId}`)
    },
    onSettled: () => {
      abortRef.current = null
    }
  })

  const handleFileChange = (incoming: File | null) => {
    const error = validateFile(incoming)
    setFile(incoming)
    setFileError(error)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    handleFileChange(dropped ?? null)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const error = validateFile(file)
    setFileError(error)
    if (error) return
    if (!file) return
    if (!jobName.trim() || !eventDate) return

    const payload: CreateJobPayload = {
      name: jobName.trim(),
      eventDate,
      language,
      notes: notes.trim() ? notes.trim() : undefined,
      file
    }
    lastPayloadRef.current = payload
    mutation.mutate(payload)
  }

  const handleCancel = () => {
    if (!isUploading) return
    abortRef.current?.abort()
    setUploadState('canceled')
  }

  const handleRetry = () => {
    if (!lastPayloadRef.current) return
    setUploadState('idle')
    setProgress(0)
    mutation.mutate(lastPayloadRef.current)
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    chunksRef.current = []
    setAudioUrl(null)
    setAudioBlob(null)
    setRecordingTime(0)
  }

  const startRecording = async () => {
    if (micSupport !== 'supported') return
    if (!recordingMime) {
      setMicMessage('Recording is unavailable for mp3/wav/m4a in this browser.')
      return
    }
    try {
      resetRecording()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: recordingMime })
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recordingMime })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }
      recorder.start()
      setRecorderState('recording')
      setMicMessage(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Microphone permission denied.'
      setMicMessage(message)
      setRecorderState('denied')
    }
  }

  const pauseRecording = () => {
    if (!recorderRef.current) return
    recorderRef.current.pause()
    setRecorderState('paused')
  }

  const resumeRecording = () => {
    if (!recorderRef.current) return
    recorderRef.current.resume()
    setRecorderState('recording')
  }

  const stopRecording = () => {
    if (!recorderRef.current) return
    recorderRef.current.stop()
    setRecorderState('stopped')
  }

  const uploadRecording = () => {
    if (!audioBlob) return
    const extension = extensionFromMime(recordingMime)
    const recordingFile = new File([audioBlob], `recording-${Date.now()}.${extension}`, {
      type: recordingMime ?? audioBlob.type
    })
    handleFileChange(recordingFile)
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-text">New analysis job</p>
            <p className="text-sm text-muted">
              Upload an audio file to start transcription and speech insights.
            </p>
          </div>
          <Badge variant="warning">Large file ready</Badge>
        </div>
        <div
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            dragging ? 'border-brand-500 bg-brand-50/60' : 'border-border bg-surface-alt'
          }`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3v12" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Drag & drop audio here</p>
            <p className="text-xs text-muted">mp3, wav, m4a up to {MAX_FILE_SIZE_MB} MB</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".mp3,.wav,.m4a,audio/*"
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
              <span className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700">
                Choose file
              </span>
            </label>
            {file && (
              <span className="text-xs text-muted">
                {file.name} � {formatFileSize(file.size)}
              </span>
            )}
          </div>
          {fileError && <p className="text-xs text-danger-700">{fileError}</p>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Job name"
            placeholder="Wedding speech - Lydia & James"
            value={jobName}
            onChange={(event) => setJobName(event.target.value)}
          />
          <label className="flex w-full flex-col gap-1 text-sm">
            <span className="font-medium text-text">Event date</span>
            <input
              type="date"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
            />
          </label>
          <label className="flex w-full flex-col gap-1 text-sm">
            <span className="font-medium text-text">Language</span>
            <select
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={language}
              onChange={(event) => setLanguage(event.target.value as JobLanguage)}
            >
              <option value="English">English</option>
              <option value="Sinhala">Sinhala</option>
            </select>
          </label>
          <label className="flex w-full flex-col gap-1 text-sm md:col-span-2">
            <span className="font-medium text-text">Notes (optional)</span>
            <textarea
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Add context for the editor or key moments to flag."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full border border-border px-3 py-1">Chunked upload ready</span>
            <span className="rounded-full border border-border px-3 py-1">Auto-resume</span>
            <span className="rounded-full border border-border px-3 py-1">Checksum verify</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uploadState === 'error' && (
              <Button type="button" variant="secondary" onClick={handleRetry}>
                Retry upload
              </Button>
            )}
            {uploadState === 'canceled' && (
              <Button type="button" variant="secondary" onClick={handleRetry}>
                Resume upload
              </Button>
            )}
            {isUploading && (
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel upload
              </Button>
            )}
            <Button type="submit" disabled={!canSubmit}>
              Create job
            </Button>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-text">Record audio</p>
            <p className="text-sm text-muted">
              Capture a live recording directly from your microphone.
            </p>
          </div>
          <Badge variant={micSupport === 'unsupported' ? 'danger' : 'default'}>
            {micSupport === 'checking' && 'Checking'}
            {micSupport === 'supported' && 'Mic ready'}
            {micSupport === 'unsupported' && 'Not supported'}
          </Badge>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-surface-alt p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">Live capture</p>
              <span className="text-xs font-semibold text-muted">{formatTimer(recordingTime)}</span>
            </div>
            <div className="mt-4 flex h-28 items-center justify-center gap-2 rounded-2xl border border-border bg-surface">
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={`wave-${index}`}
                  className={`h-4 w-2 rounded-full bg-brand-400 transition ${
                    recorderState === 'recording' ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
            {micMessage && <p className="mt-3 text-xs text-danger-700">{micMessage}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={startRecording}
                disabled={micSupport !== 'supported' || recorderState === 'recording' || !recordingMime}
              >
                Start
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={pauseRecording}
                disabled={recorderState !== 'recording'}
              >
                Pause
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resumeRecording}
                disabled={recorderState !== 'paused'}
              >
                Resume
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={stopRecording}
                disabled={recorderState !== 'recording' && recorderState !== 'paused'}
              >
                Stop
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-alt p-5">
            <p className="text-sm font-semibold text-text">Playback</p>
            <p className="mt-1 text-xs text-muted">
              Preview your recording before uploading.
            </p>
            {audioUrl ? (
              <audio className="mt-4 w-full" controls src={audioUrl} />
            ) : (
              <div className="mt-4 flex h-16 items-center justify-center rounded-xl border border-border bg-surface text-xs text-muted">
                No recording yet
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={uploadRecording} disabled={!audioBlob}>
                Upload recording
              </Button>
              <Button type="button" variant="ghost" onClick={resetRecording} disabled={!audioBlob}>
                Discard
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text">Upload progress</p>
            <p className="text-xs text-muted">Large file streaming with resumable chunks.</p>
          </div>
          <Badge variant={uploadState === 'error' ? 'danger' : 'default'}>
            {uploadState === 'idle' && 'Idle'}
            {uploadState === 'uploading' && 'Uploading'}
            {uploadState === 'success' && 'Complete'}
            {uploadState === 'error' && 'Failed'}
            {uploadState === 'canceled' && 'Canceled'}
          </Badge>
        </div>
        <Progress value={progress} />
        <div className="grid gap-3 text-xs text-muted md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface-alt p-3">
            <p className="font-semibold text-text">Chunk planner</p>
            <p>Prepare 64 MB slices for resilient uploads.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-alt p-3">
            <p className="font-semibold text-text">Safe retries</p>
            <p>Only re-send failed chunks, not the entire file.</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-alt p-3">
            <p className="font-semibold text-text">Post-upload</p>
            <p>Audio analysis starts automatically after completion.</p>
          </div>
        </div>
      </Card>
    </form>
  )
}
