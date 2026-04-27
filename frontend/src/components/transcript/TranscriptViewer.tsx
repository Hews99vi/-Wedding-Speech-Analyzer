import { useEffect, useMemo, useRef, useState } from 'react'
import { List, type ListImperativeAPI, type RowComponentProps } from 'react-window'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'

export type HighlightType = 'Emotional peak' | 'Humor' | 'Toast' | 'Vows' | 'Advice'

export type Highlight = {
  id: string
  label: HighlightType
  score: number
  timestamp: number
  end?: number
}

export type TranscriptSegment = {
  id: string
  speaker: string
  start: number
  end: number
  text: string
  highlight?: HighlightType
}

type TranscriptRowProps = {
  activeMatchIndex: number | null
  onSeek?: (time: number, end?: number) => void
  segments: TranscriptSegment[]
}

const highlightStyles: Record<HighlightType, string> = {
  'Emotional peak': 'border-brand-300 bg-brand-50 text-brand-700',
  Humor: 'border-warning-500/40 bg-warning-50 text-warning-700',
  Toast: 'border-success-500/40 bg-success-50 text-success-700',
  Vows: 'border-danger-500/40 bg-danger-50 text-danger-700',
  Advice: 'border-border bg-surface-alt text-muted'
}

const formatTimestamp = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const TranscriptRow = ({
  activeMatchIndex,
  index,
  onSeek,
  segments,
  style
}: RowComponentProps<TranscriptRowProps>) => {
  const segment = segments[index]
  const isMatch = activeMatchIndex === index
  const highlightStyle = segment.highlight
    ? highlightStyles[segment.highlight]
    : 'border-border bg-surface-alt text-muted'

  return (
    <div style={style} className="px-2">
      <button
        type="button"
        onClick={() => onSeek?.(segment.start, segment.end)}
        className={`relative flex h-[96px] w-full overflow-hidden flex-col justify-between rounded-xl border px-4 py-3 text-left text-sm ${highlightStyle} ${
          isMatch ? 'ring-2 ring-warning-500/50' : ''
        }`}
        aria-label={`Transcript segment from ${formatTimestamp(
          segment.start
        )} to ${formatTimestamp(segment.end)} by ${segment.speaker}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            {segment.speaker}
          </span>
          <span className="text-xs font-semibold">
            {formatTimestamp(segment.start)} - {formatTimestamp(segment.end)}
          </span>
        </div>
        <p className="text-sm text-text line-clamp-3">{segment.text}</p>
      </button>
    </div>
  )
}

export const TranscriptViewer = ({
  activeSegmentIndex = null,
  followActive = false,
  highlights,
  segments,
  onSeek
}: {
  activeSegmentIndex?: number | null
  followActive?: boolean
  highlights: Highlight[]
  segments: TranscriptSegment[]
  onSeek?: (time: number, end?: number) => void
}) => {
  const [query, setQuery] = useState('')
  const [matchIndex, setMatchIndex] = useState(0)
  const listRef = useRef<ListImperativeAPI | null>(null)
  const highlightRefs = useRef<Array<HTMLButtonElement | null>>([])

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return segments
      .map((segment, index) => ({ index, text: segment.text.toLowerCase() }))
      .filter(({ text }) => text.includes(lower))
      .map(({ index }) => index)
  }, [segments, query])

  const activeMatchIndex = matches[matchIndex] ?? null

  useEffect(() => {
    if (!followActive || activeSegmentIndex === null) return
    listRef.current?.scrollToRow({ align: 'center', index: activeSegmentIndex })
  }, [activeSegmentIndex, followActive])

  const handleHighlightClick = (highlight: Highlight) => {
    const targetIndex = segments.findIndex((segment) => segment.id === highlight.id)
    if (targetIndex >= 0) {
      listRef.current?.scrollToRow({ align: 'center', index: targetIndex })
    }
    onSeek?.(highlight.timestamp, highlight.end)
  }

  const navigateMatch = (direction: 1 | -1) => {
    if (matches.length === 0) return
    const next = (matchIndex + direction + matches.length) % matches.length
    setMatchIndex(next)
    const target = matches[next]
    if (target !== undefined) {
      listRef.current?.scrollToRow({ align: 'center', index: target })
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-text">Highlights</p>
          <p className="text-xs text-muted">Ranked moments from the transcript.</p>
        </div>
        {highlights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
            No highlights detected for this transcript.
          </div>
        ) : (
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1" role="list">
            {highlights.map((highlight, index) => (
              <button
                key={highlight.id}
                type="button"
                ref={(el) => {
                  highlightRefs.current[index] = el
                }}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    highlightRefs.current[index + 1]?.focus()
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    highlightRefs.current[index - 1]?.focus()
                  }
                }}
                className="flex w-full flex-col gap-2 rounded-xl border border-border bg-surface-alt px-3 py-2 text-left text-xs text-muted transition hover:border-brand-300 hover:bg-brand-50"
                onClick={() => handleHighlightClick(highlight)}
                aria-label={`Highlight ${index + 1}: ${highlight.label} at ${formatTimestamp(
                  highlight.timestamp
                )}`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="default">#{index + 1}</Badge>
                  <span className="text-xs font-semibold text-text">
                    {formatTimestamp(highlight.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text">{highlight.label}</span>
                  <span className="text-xs text-muted">Score {highlight.score.toFixed(1)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-text">Transcript</p>
            <p className="text-xs text-muted">Speaker labels and timestamps.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              label=""
              placeholder="Search transcript"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setMatchIndex(0)
              }}
            />
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{matches.length} matches</span>
              <Button variant="ghost" onClick={() => navigateMatch(-1)}>
                Prev
              </Button>
              <Button variant="ghost" onClick={() => navigateMatch(1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="h-[520px]">
          <List<TranscriptRowProps>
            listRef={listRef}
            rowComponent={TranscriptRow}
            rowCount={segments.length}
            rowHeight={110}
            rowProps={{ activeMatchIndex, onSeek, segments }}
            style={{ height: 520, width: '100%' }}
          />
        </div>
      </Card>
    </div>
  )
}
