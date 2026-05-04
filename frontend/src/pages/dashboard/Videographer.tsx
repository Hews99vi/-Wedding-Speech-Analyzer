import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listJobs } from '../../api/jobs'
import type { JobOut } from '../../types/job'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { routePaths } from '../../routes/routePaths'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger'

function statusBadge(status: JobOut['status']): { variant: BadgeVariant; label: string } {
  switch (status) {
    case 'queued':     return { variant: 'warning', label: 'Queued' }
    case 'processing': return { variant: 'warning', label: 'Processing' }
    case 'ready':      return { variant: 'success', label: 'Ready for edit' }
    case 'failed':     return { variant: 'danger',  label: 'Failed' }
    default:           return { variant: 'default', label: status }
  }
}

function jobProgress(job: JobOut): number {
  if (job.status === 'ready')  return 100
  if (job.status === 'failed') return 0
  return Math.round((job.step_index / 6) * 100)
}

export const Videographer = () => {
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => listJobs({ page_size: 100 }),
  })

  const jobs = data?.items ?? []
  const totalJobs       = data?.total ?? 0
  const inProgressCount = jobs.filter(j => j.status === 'queued' || j.status === 'processing').length
  const readyCount      = jobs.filter(j => j.status === 'ready').length
  const recentJobs      = jobs.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">Videographer Dashboard</h1>
          <p className="text-sm text-muted">
            Ingest recordings, monitor processing, and hand off clean assets.
          </p>
        </div>
        <Button onClick={() => navigate(routePaths.app.newAnalysis)}>Quick upload</Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <Card>
              <p className="text-xs uppercase text-muted">Total jobs</p>
              <h3 className="mt-2 text-3xl font-semibold text-text">{totalJobs}</h3>
              <Badge variant="default" className="mt-4">All time</Badge>
            </Card>
            <Card>
              <p className="text-xs uppercase text-muted">In progress</p>
              <h3 className="mt-2 text-3xl font-semibold text-text">{inProgressCount}</h3>
              <Badge variant={inProgressCount > 0 ? 'warning' : 'default'} className="mt-4">
                {inProgressCount > 0 ? 'Processing' : 'None active'}
              </Badge>
            </Card>
            <Card>
              <p className="text-xs uppercase text-muted">Ready for editor</p>
              <h3 className="mt-2 text-3xl font-semibold text-text">{readyCount}</h3>
              <Badge variant={readyCount > 0 ? 'success' : 'default'} className="mt-4">
                {readyCount > 0 ? 'Editor ready' : 'None ready'}
              </Badge>
            </Card>
          </>
        )}
      </div>

      {/* Recent jobs */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Recent jobs</h3>
            <p className="text-sm text-muted">Latest recordings and progress.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate(routePaths.app.jobs)}>
            View all
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted">Failed to load jobs.</p>
            <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {!isLoading && !isError && jobs.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm font-medium text-text">No jobs yet</p>
            <p className="text-xs text-muted">Upload your first recording to get started.</p>
            <Button onClick={() => navigate(routePaths.app.newAnalysis)}>Quick upload</Button>
          </div>
        )}

        {!isLoading && !isError && recentJobs.length > 0 && (
          <div className="space-y-3">
            {recentJobs.map((job) => {
              const badge = statusBadge(job.status)
              const progress = jobProgress(job)
              return (
                <div key={job.id} className="rounded-xl border border-border bg-surface-alt px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-text">{job.name}</p>
                      <p className="text-xs text-muted">
                        {new Date(job.created_at).toLocaleDateString()}
                        {job.step_label ? ` · ${job.step_label}` : ''}
                      </p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={progress} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
