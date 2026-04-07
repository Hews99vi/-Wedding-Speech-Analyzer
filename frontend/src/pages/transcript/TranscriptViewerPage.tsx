import { useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { TranscriptViewer, type Highlight, type TranscriptSegment } from '../../components/transcript/TranscriptViewer'

const buildMockTranscript = () => {
  const speakers = ['Speaker 1', 'Speaker 2']
  const labels: Array<TranscriptSegment['highlight']> = [
    'Emotional peak',
    'Humor',
    'Toast',
    'Vows',
    'Advice',
    undefined,
    undefined
  ]
  const segments: TranscriptSegment[] = []
  let time = 0

  for (let i = 0; i < 160; i += 1) {
    const duration = 8 + (i % 6)
    const label = labels[i % labels.length]
    segments.push({
      id: `seg-${i}`,
      speaker: speakers[i % speakers.length],
      start: time,
      end: time + duration,
      text:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer volutpat ex at sem viverra, sed aliquet purus posuere.',
      highlight: label
    })
    time += duration
  }

  const highlights: Highlight[] = segments
    .filter((segment) => segment.highlight)
    .slice(0, 8)
    .map((segment, index) => ({
      id: segment.id,
      label: segment.highlight ?? 'Advice',
      score: 9.4 - index * 0.4,
      timestamp: segment.start,
      end: segment.end
    }))

  return { segments, highlights }
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const TranscriptViewerPage = () => {
  const { jobId } = useParams()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopRange, setLoopRange] = useState<{ start: number; end: number } | null>(null)
  const playerRef = useRef<HTMLAudioElement | null>(null)

  const { segments, highlights } = useMemo(buildMockTranscript, [])

  const handleSeek = (time: number, end?: number) => {
    setCurrentTime(time)
    if (end && end > time) {
      setLoopRange({ start: time, end })
    }
    if (playerRef.current) {
      playerRef.current.currentTime = time
      playerRef.current.play().catch(() => undefined)
    }
  }

  const togglePlayback = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pause()
    } else {
      playerRef.current.play().catch(() => undefined)
    }
  }

  const jump = (delta: number) => {
    if (!playerRef.current) return
    const next = Math.min(Math.max(0, playerRef.current.currentTime + delta), duration)
    playerRef.current.currentTime = next
    setCurrentTime(next)
  }

  const handleTimeUpdate = () => {
    if (!playerRef.current) return
    const time = playerRef.current.currentTime
    setCurrentTime(time)
    if (loopEnabled && loopRange && time >= loopRange.end) {
      playerRef.current.currentTime = loopRange.start
    }
  }

  const handleLoaded = () => {
    if (!playerRef.current) return
    setDuration(playerRef.current.duration || 0)
    setIsLoading(false)
    setAudioError(null)
  }

  const handleError = () => {
    setAudioError('Audio failed to load. Please try again or upload a new file.')
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-text">Transcript Viewer</h2>
          <p className="text-sm text-muted">Job #{jobId} · Speaker diarization enabled.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Ready</Badge>
          <Button variant="secondary">Export transcript</Button>
          <Button>Share highlights</Button>
        </div>
      </div>

      <TranscriptViewer highlights={highlights} segments={segments} onSeek={handleSeek} />

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => jump(-5)} aria-label="Jump back 5 seconds">
                -5s
              </Button>
              <Button onClick={togglePlayback} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button variant="ghost" onClick={() => jump(5)} aria-label="Jump forward 5 seconds">
                +5s
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? 'secondary' : 'ghost'}
                  onClick={() => {
                    setPlaybackRate(rate)
                    if (playerRef.current) {
                      playerRef.current.playbackRate = rate
                    }
                  }}
                  aria-label={`Set playback speed to ${rate}x`}
                >
                  {rate}x
                </Button>
              ))}
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
          </div>

          <div className="flex flex-col gap-2">
            {audioError && (
              <div className="rounded-xl border border-danger-500/40 bg-danger-50 px-3 py-2 text-xs text-danger-700">
                {audioError}
              </div>
            )}
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(event) => {
                const value = Number(event.target.value)
                setCurrentTime(value)
                if (playerRef.current) {
                  playerRef.current.currentTime = value
                }
              }}
              className="w-full accent-brand-500"
              aria-label="Seek audio"
            />
            {isLoading && (
              <span className="text-xs text-muted">Loading audio...</span>
            )}
          </div>

          <audio
            ref={playerRef}
            className="hidden"
            onLoadedMetadata={handleLoaded}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleError}
          >
            <source src="/audio/sample.mp3" type="audio/mpeg" />
          </audio>
        </div>
      </div>
    </div>
  )
}
