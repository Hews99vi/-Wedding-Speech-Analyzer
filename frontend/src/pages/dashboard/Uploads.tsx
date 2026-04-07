import { Card } from '../../components/ui/Card'
import { Table } from '../../components/ui/Table'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'

export const Uploads = () => {
  const rows: Array<{ id: string; name: string; size: string; status: string }> = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text">Uploads</h1>
          <p className="text-sm text-muted">
            Track large video/audio ingestion and transcription.
          </p>
        </div>
        <Button>New upload</Button>
      </div>
      <Card className="space-y-4">
        {rows.length === 0 ? (
          <EmptyState
            title="No uploads yet"
            description="Add your first wedding speech recording to kick off analysis."
            actionLabel="Start upload"
            onAction={() => {}}
          />
        ) : (
          <Table>
            <thead className="bg-surface-alt text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.size}</td>
                  <td className="px-4 py-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}
