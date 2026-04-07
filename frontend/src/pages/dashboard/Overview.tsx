import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'

export const Overview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-text">Overview</h1>
        <p className="text-sm text-muted">
          Track uploads, transcription status, and review queues.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-muted">Active Projects</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">12</h3>
          <Badge variant="success" className="mt-4">On schedule</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Pending Reviews</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">7</h3>
          <Badge variant="warning" className="mt-4">Needs editor</Badge>
        </Card>
        <Card>
          <p className="text-xs uppercase text-muted">Audio Quality</p>
          <h3 className="mt-2 text-3xl font-semibold text-text">92%</h3>
          <div className="mt-4">
            <Progress value={92} />
          </div>
        </Card>
      </div>
      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text">Large File Pipeline</h3>
          <p className="text-sm text-muted">
            Chunked uploads and accelerated transcription are ready.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-surface-alt p-4">
            <p className="text-xs uppercase text-muted">Uploads</p>
            <p className="mt-2 text-2xl font-semibold text-text">3.2 TB</p>
          </div>
          <div className="rounded-xl bg-surface-alt p-4">
            <p className="text-xs uppercase text-muted">Average turnaround</p>
            <p className="mt-2 text-2xl font-semibold text-text">4.1 hrs</p>
          </div>
          <div className="rounded-xl bg-surface-alt p-4">
            <p className="text-xs uppercase text-muted">Editor capacity</p>
            <p className="mt-2 text-2xl font-semibold text-text">78%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
