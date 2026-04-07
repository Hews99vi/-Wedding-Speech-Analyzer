import { useMemo, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { routePaths } from '../../routes/routePaths'
import { useNavigate } from 'react-router-dom'

type JobStatus = 'Uploading' | 'Processing' | 'Ready' | 'Failed'

type JobRow = {
  id: string
  name: string
  owner: string
  createdAt: string
  status: JobStatus
  duration: string
  language: string
}

type Issue = {
  id: string
  title: string
  type: 'AudioQualityIssue' | 'FailedJob'
  owner: string
  createdAt: string
}

type AuditEntry = {
  id: string
  action: string
  actor: string
  when: string
  ip: string
}

const statusVariant: Record<JobStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  Uploading: 'warning',
  Processing: 'warning',
  Ready: 'success',
  Failed: 'danger'
}

const mockJobs: JobRow[] = [
  {
    id: 'job-2011',
    name: 'Lydia & James',
    owner: 'Amina Rivera',
    createdAt: '2026-03-03',
    status: 'Processing',
    duration: '42:18',
    language: 'English'
  },
  {
    id: 'job-2010',
    name: 'Sienna Garden Ceremony',
    owner: 'Theo Jacobs',
    createdAt: '2026-03-03',
    status: 'Ready',
    duration: '36:05',
    language: 'English'
  },
  {
    id: 'job-2009',
    name: 'Ava + Noah Highlight',
    owner: 'Maya Hill',
    createdAt: '2026-03-02',
    status: 'Failed',
    duration: '18:40',
    language: 'Sinhala'
  },
  {
    id: 'job-2008',
    name: 'Riverview Reception',
    owner: 'Luis Carter',
    createdAt: '2026-03-01',
    status: 'Uploading',
    duration: '51:12',
    language: 'English'
  }
]

const mockIssues: Issue[] = [
  {
    id: 'issue-01',
    title: 'Low signal-to-noise detected',
    type: 'AudioQualityIssue',
    owner: 'Maya Hill',
    createdAt: '2026-03-03 15:21'
  },
  {
    id: 'issue-02',
    title: 'Processing failed during diarization',
    type: 'FailedJob',
    owner: 'Luis Carter',
    createdAt: '2026-03-02 18:02'
  }
]

const mockAudit: AuditEntry[] = [
  {
    id: 'audit-01',
    action: 'Uploaded job WSA-2008',
    actor: 'Luis Carter',
    when: '2026-03-03 12:42',
    ip: '192.168.20.42'
  },
  {
    id: 'audit-02',
    action: 'Changed role for Theo Jacobs to Editor',
    actor: 'Amina Rivera',
    when: '2026-03-02 17:15',
    ip: '192.168.20.12'
  },
  {
    id: 'audit-03',
    action: 'Exported highlights CSV',
    actor: 'Theo Jacobs',
    when: '2026-03-02 10:05',
    ip: '192.168.20.66'
  }
]

export const Admin = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All')

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch = job.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">Admin Monitoring</h1>
          <p className="text-sm text-muted">
            System health, workload distribution, and audit readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(routePaths.app.adminUsers)}>
            Manage users
          </Button>
          <Button>Invite admin</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase text-muted">Total users</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">48</h3>
          <Badge variant="success" className="mt-4">+6 this month</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Jobs today</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">26</h3>
          <Badge variant="warning" className="mt-4">4 in progress</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Failures</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">2</h3>
          <Badge variant="danger" className="mt-4">Needs triage</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Avg processing</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">4.6 hrs</h3>
          <Badge variant="success" className="mt-4">Within SLA</Badge>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-text">Jobs monitoring</p>
            <p className="text-sm text-muted">Live view across all studios.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              label=""
              placeholder="Search job"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as JobStatus | 'All')}
            >
              <option value="All">All statuses</option>
              <option value="Uploading">Uploading</option>
              <option value="Processing">Processing</option>
              <option value="Ready">Ready</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm text-text">
            <thead className="bg-surface-alt text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Language</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-text">{job.name}</p>
                      <p className="text-xs text-muted">{job.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{job.owner}</td>
                  <td className="px-4 py-3 text-sm text-muted">{job.createdAt}</td>
                  <td className="px-4 py-3 text-sm text-muted">{job.duration}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[job.status]}>{job.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{job.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-text">Issue queue</p>
              <p className="text-sm text-muted">Audio quality and failed jobs.</p>
            </div>
            <Button variant="secondary">Open triage</Button>
          </div>
          <div className="space-y-3">
            {mockIssues.map((issue) => (
              <div key={issue.id} className="rounded-xl border border-border bg-surface-alt px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">{issue.title}</p>
                  <Badge variant={issue.type === 'FailedJob' ? 'danger' : 'warning'}>
                    {issue.type === 'FailedJob' ? 'Failed job' : 'Audio issue'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">{issue.owner} · {issue.createdAt}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-text">Audit trail</p>
            <p className="text-sm text-muted">Operational activity and access logs.</p>
          </div>
          <div className="space-y-3">
            {mockAudit.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm">
                <p className="font-semibold text-text">{entry.action}</p>
                <p className="mt-1 text-xs text-muted">
                  {entry.actor} · {entry.when} · IP {entry.ip}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
