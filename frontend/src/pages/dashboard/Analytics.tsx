import { useQuery } from '@tanstack/react-query'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/ui/ErrorState'

const fetchInsights = async () => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    sentiment: 'Warm & celebratory',
    highlights: 18,
    riskFlags: 2
  }
}

export const Analytics = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['speech-insights'],
    queryFn: fetchInsights
  })

  if (isError) {
    return (
      <ErrorState
        title="Insights unavailable"
        description="We could not load analytics right now."
        onAction={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-text">Analytics</h1>
        <p className="text-sm text-muted">
          Sentiment, highlights, and risk detection for each speech.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))
        ) : (
          <>
            <Card>
              <p className="text-xs uppercase text-muted">Sentiment</p>
              <h3 className="mt-2 text-2xl font-semibold text-text">
                {data?.sentiment}
              </h3>
            </Card>
            <Card>
              <p className="text-xs uppercase text-muted">Highlights</p>
              <h3 className="mt-2 text-2xl font-semibold text-text">
                {data?.highlights}
              </h3>
            </Card>
            <Card>
              <p className="text-xs uppercase text-muted">Risk flags</p>
              <h3 className="mt-2 text-2xl font-semibold text-text">
                {data?.riskFlags}
              </h3>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
