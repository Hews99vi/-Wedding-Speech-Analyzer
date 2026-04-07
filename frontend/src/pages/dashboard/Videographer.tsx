import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { Button } from '../../components/ui/Button'
import { routePaths } from '../../routes/routePaths'
import { useNavigate } from 'react-router-dom'

const recentJobs = [
  { id: 'WSA-2401', couple: 'Maya & Luis', status: 'Uploading', progress: 42 },
  { id: 'WSA-2396', couple: 'Harper & Noel', status: 'Transcribing', progress: 78 },
  { id: 'WSA-2392', couple: 'Ava & Jonah', status: 'Ready for edit', progress: 100 }
]

export const Videographer = () => {
  const navigate = useNavigate()

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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-muted">Uploads in queue</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">4</h3>
          <Badge variant="warning" className="mt-4">Awaiting ingest</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Audio quality</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">94%</h3>
          <div className="mt-4">
            <Progress value={94} />
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Handoff readiness</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">8 jobs</h3>
          <Badge variant="success" className="mt-4">Editor ready</Badge>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Recent jobs</h3>
            <p className="text-sm text-muted">Latest recordings and progress.</p>
          </div>
          <Button variant="secondary">View all</Button>
        </div>
        <div className="space-y-3">
          {recentJobs.map((job) => (
            <div key={job.id} className="rounded-xl border border-border bg-surface-alt px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">{job.couple}</p>
                  <p className="text-xs text-muted">{job.id}</p>
                </div>
                <Badge variant={job.progress === 100 ? 'success' : 'warning'}>
                  {job.status}
                </Badge>
              </div>
              <div className="mt-3">
                <Progress value={job.progress} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
