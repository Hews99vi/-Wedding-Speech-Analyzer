import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { listJobs } from '../../api/jobs'
import type { JobOut } from '../../types/job'
import { routePaths } from '../../routes/routePaths'

type JobStatus = 'Queued' | 'Uploading' | 'Processing' | 'Ready' | 'Failed'
type StatusFilter = 'All' | 'Queued' | 'Processing' | 'Ready' | 'Failed'
type LanguageFilter = 'All' | 'English' | 'Sinhala'

interface JobRow {
  id: string
  name: string
  duration: string
  createdAt: string
  createdAtIso: string
  status: JobStatus
  language: Exclude<LanguageFilter, 'All'>
  keyMoments: string
}

const statusVariant: Record<JobStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  Queued: 'default',
  Uploading: 'warning',
  Processing: 'warning',
  Ready: 'success',
  Failed: 'danger'
}

const pageSize = 6

const statusParam: Record<StatusFilter, JobOut['status'] | undefined> = {
  All: undefined,
  Queued: 'queued',
  Processing: 'processing',
  Ready: 'ready',
  Failed: 'failed'
}

const statusLabel: Record<JobOut['status'], JobStatus> = {
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

const mapJob = (job: JobOut): JobRow => {
  return {
    id: job.id,
    name: job.name,
    duration: formatDuration(job.duration_seconds),
    createdAt: formatDate(job.created_at),
    createdAtIso: job.created_at,
    status: statusLabel[job.status],
    language: job.language === 'si' || job.language === 'Sinhala' ? 'Sinhala' : 'English',
    keyMoments: '--'
  }
}

export const JobsList = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs', 'list', page, statusFilter],
    queryFn: () =>
      listJobs({
        page,
        page_size: pageSize,
        status: statusParam[statusFilter]
      })
  })

  const jobs = useMemo(() => {
    return (data?.items ?? []).map(mapJob)
  }, [data?.items])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase())
      const matchesLanguage = languageFilter === 'All' || job.language === languageFilter
      const createdTime = new Date(job.createdAtIso).getTime()
      const startTime = startDate ? new Date(startDate).getTime() : null
      const endTime = endDate ? new Date(endDate).getTime() : null
      const matchesStart = startTime ? createdTime >= startTime : true
      const matchesEnd = endTime ? createdTime <= endTime : true
      return matchesSearch && matchesLanguage && matchesStart && matchesEnd
    })
  }, [jobs, search, languageFilter, startDate, endDate])

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const showingStart = filtered.length > 0 ? (page - 1) * pageSize + 1 : 0
  const showingEnd = filtered.length > 0 ? (page - 1) * pageSize + filtered.length : 0

  const paginationControls = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        disabled={page <= 1 || isLoading}
        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
      >
        Previous
      </Button>
      <span className="text-xs font-semibold text-text">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="ghost"
        disabled={page >= totalPages || isLoading}
        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      >
        Next
      </Button>
    </div>
  )

  if (isError) {
    return (
      <ErrorState
        title="Jobs unavailable"
        description="We could not load jobs from the API."
        onAction={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-text">Jobs</p>
            <p className="text-sm text-muted">
              Track analysis jobs across upload, processing, and delivery.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(routePaths.app.newAnalysis)}>
            Create job
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <Input
            label="Search"
            placeholder="Search by job name"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <label className="flex w-full flex-col gap-1 text-sm">
            <span className="font-medium text-text">Status</span>
            <select
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as StatusFilter)
                setPage(1)
              }}
            >
              <option value="All">All statuses</option>
              <option value="Queued">Queued</option>
              <option value="Processing">Processing</option>
              <option value="Ready">Ready</option>
              <option value="Failed">Failed</option>
            </select>
          </label>
          <label className="flex w-full flex-col gap-1 text-sm">
            <span className="font-medium text-text">Language</span>
            <select
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              value={languageFilter}
              onChange={(event) => {
                setLanguageFilter(event.target.value as LanguageFilter)
                setPage(1)
              }}
            >
              <option value="All">All languages</option>
              <option value="English">English</option>
              <option value="Sinhala">Sinhala</option>
            </select>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex w-full flex-col gap-1 text-sm">
              <span className="font-medium text-text">Start date</span>
              <input
                type="date"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  setPage(1)
                }}
              />
            </label>
            <label className="flex w-full flex-col gap-1 text-sm">
              <span className="font-medium text-text">End date</span>
              <input
                type="date"
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value)
                  setPage(1)
                }}
              />
            </label>
          </div>
        </div>
      </Card>

      <div className="hidden md:block">
        {isLoading ? (
          <Card>
            <p className="text-sm text-muted">Loading jobs...</p>
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try changing your filters or create a new analysis job."
            actionLabel="Create job"
            onAction={() => navigate(routePaths.app.newAnalysis)}
          />
        ) : (
          <Table>
            <thead className="bg-surface-alt text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Key moments</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-text">{job.name}</p>
                      <p className="text-xs text-muted">{job.language}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{job.duration}</td>
                  <td className="px-4 py-3">{job.createdAt}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{job.keyMoments}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => navigate(`${routePaths.app.jobs}/${job.id}`)}>
                        View
                      </Button>
                      <Button variant="secondary">Export</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>
            Showing {showingStart}-{showingEnd} of {total}
          </span>
          {paginationControls}
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {isLoading && (
          <Card>
            <p className="text-sm text-muted">Loading jobs...</p>
          </Card>
        )}
        {!isLoading && filtered.length === 0 && (
          <EmptyState
            title="No jobs found"
            description="Try changing your filters or create a new analysis job."
            actionLabel="Create job"
            onAction={() => navigate(routePaths.app.newAnalysis)}
          />
        )}
        {!isLoading && filtered.map((job) => (
          <Card key={job.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text">{job.name}</p>
                <p className="text-xs text-muted">{job.language}</p>
              </div>
              <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted">
              <div>
                <p className="text-[11px] uppercase text-muted">Duration</p>
                <p className="text-sm text-text">{job.duration}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted">Created</p>
                <p className="text-sm text-text">{job.createdAt}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-muted">Key moments</p>
                <p className="text-sm text-text">{job.keyMoments}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate(`${routePaths.app.jobs}/${job.id}`)}>
                View
              </Button>
              <Button variant="secondary">Export</Button>
            </div>
          </Card>
        ))}
        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>
              Showing {showingStart}-{showingEnd} of {total}
            </span>
            {paginationControls}
          </div>
        )}
      </div>
    </div>
  )
}
