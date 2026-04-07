import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Table } from '../../components/ui/Table'
import type { JobLanguage } from '../../types/job'
import { routePaths } from '../../routes/routePaths'

type JobStatus = 'Uploading' | 'Processing' | 'Ready' | 'Failed'

interface JobRow {
  id: string
  name: string
  duration: string
  createdAt: string
  status: JobStatus
  language: JobLanguage
  keyMoments: number
}

const statusVariant: Record<JobStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  Uploading: 'warning',
  Processing: 'warning',
  Ready: 'success',
  Failed: 'danger'
}

const mockJobs: JobRow[] = [
  {
    id: 'job-1024',
    name: 'Lydia & James',
    duration: '42:18',
    createdAt: '2026-02-20',
    status: 'Processing',
    language: 'English',
    keyMoments: 12
  },
  {
    id: 'job-1023',
    name: 'Siena Garden Ceremony',
    duration: '36:05',
    createdAt: '2026-02-18',
    status: 'Ready',
    language: 'English',
    keyMoments: 9
  },
  {
    id: 'job-1022',
    name: 'Ava + Noah Highlight',
    duration: '18:40',
    createdAt: '2026-02-17',
    status: 'Uploading',
    language: 'Sinhala',
    keyMoments: 5
  },
  {
    id: 'job-1021',
    name: 'Riverview Reception',
    duration: '51:12',
    createdAt: '2026-02-15',
    status: 'Failed',
    language: 'English',
    keyMoments: 0
  },
  {
    id: 'job-1020',
    name: 'Oceanview Toasts',
    duration: '29:54',
    createdAt: '2026-02-12',
    status: 'Ready',
    language: 'Sinhala',
    keyMoments: 7
  },
  {
    id: 'job-1019',
    name: 'Forest Manor Vows',
    duration: '44:03',
    createdAt: '2026-02-10',
    status: 'Processing',
    language: 'English',
    keyMoments: 11
  },
  {
    id: 'job-1018',
    name: 'Sunset Ballroom',
    duration: '33:27',
    createdAt: '2026-02-09',
    status: 'Ready',
    language: 'English',
    keyMoments: 8
  },
  {
    id: 'job-1017',
    name: 'Hilltop Exchange',
    duration: '24:18',
    createdAt: '2026-02-05',
    status: 'Processing',
    language: 'Sinhala',
    keyMoments: 6
  },
  {
    id: 'job-1016',
    name: 'Rosa Terrace',
    duration: '38:41',
    createdAt: '2026-02-03',
    status: 'Ready',
    language: 'English',
    keyMoments: 10
  }
]

const fetchJobs = async () => {
  return mockJobs
}

export const JobsList = () => {
  const navigate = useNavigate()
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs', 'list'],
    queryFn: fetchJobs
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All')
  const [languageFilter, setLanguageFilter] = useState<JobLanguage | 'All'>('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [itemsToShow, setItemsToShow] = useState(6)

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter
      const matchesLanguage = languageFilter === 'All' || job.language === languageFilter
      const createdTime = new Date(job.createdAt).getTime()
      const startTime = startDate ? new Date(startDate).getTime() : null
      const endTime = endDate ? new Date(endDate).getTime() : null
      const matchesStart = startTime ? createdTime >= startTime : true
      const matchesEnd = endTime ? createdTime <= endTime : true
      return matchesSearch && matchesStatus && matchesLanguage && matchesStart && matchesEnd
    })
  }, [jobs, search, statusFilter, languageFilter, startDate, endDate])

  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedJobs = filtered.slice((page - 1) * pageSize, page * pageSize)
  const mobileJobs = filtered.slice(0, itemsToShow)

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
                setStatusFilter(event.target.value as JobStatus | 'All')
                setPage(1)
              }}
            >
              <option value="All">All statuses</option>
              <option value="Uploading">Uploading</option>
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
                setLanguageFilter(event.target.value as JobLanguage | 'All')
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
            {pagedJobs.map((job) => (
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <span>
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-text">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {mobileJobs.map((job) => (
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
        {itemsToShow < filtered.length && (
          <Button
            variant="secondary"
            onClick={() => setItemsToShow((prev) => prev + pageSize)}
          >
            Load more
          </Button>
        )}
      </div>
    </div>
  )
}
