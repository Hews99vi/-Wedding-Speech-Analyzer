import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { Button } from '../../components/ui/Button'

const jobQueue = [
  { id: 'WSA-2401', couple: 'Maya & Luis', stage: 'Reviewing', eta: '1h 15m' },
  { id: 'WSA-2396', couple: 'Harper & Noel', stage: 'Highlighting', eta: '45m' },
  { id: 'WSA-2389', couple: 'Sienna & Theo', stage: 'Exporting', eta: '2h 10m' }
]

export const Editor = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">Editor Dashboard</h1>
          <p className="text-sm text-muted">
            Prioritize edits, manage highlights, and finalize reviews.
          </p>
        </div>
        <Button variant="secondary">Open review queue</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-muted">Jobs in queue</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">6</h3>
          <Badge variant="warning" className="mt-4">Due today</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Highlights exported</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">18</h3>
          <div className="mt-4">
            <Progress value={72} />
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Review accuracy</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">97%</h3>
          <Badge variant="success" className="mt-4">On target</Badge>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Jobs queue</h3>
            <p className="text-sm text-muted">Active review workflow.</p>
          </div>
          <Button variant="secondary">Manage queue</Button>
        </div>
        <div className="space-y-3">
          {jobQueue.map((job) => (
            <div key={job.id} className="rounded-xl border border-border bg-surface-alt px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text">{job.couple}</p>
                  <p className="text-xs text-muted">{job.id}</p>
                </div>
                <Badge variant="warning">{job.stage}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted">Estimated time remaining: {job.eta}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
