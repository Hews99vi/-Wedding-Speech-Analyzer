import { Link } from 'react-router-dom'
import { routePaths } from '../../routes/routePaths'

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 bg-brand-600 text-white shadow-soft hover:bg-brand-700'

export const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-text">Access denied</h1>
        <p className="text-sm text-muted">
          Your role does not have permission to view this page.
        </p>
        <Link to={routePaths.root} className={buttonClass}>
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
