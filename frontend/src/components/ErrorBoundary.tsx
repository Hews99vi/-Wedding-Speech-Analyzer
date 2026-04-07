import React from 'react'
import { ErrorState } from './ui/ErrorState'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught an error', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text">
          <ErrorState
            title="Something went wrong"
            description="We hit an unexpected error. Try refreshing the page."
          />
        </div>
      )
    }

    return this.props.children
  }
}
