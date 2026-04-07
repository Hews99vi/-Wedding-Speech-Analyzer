import { Outlet, Link } from 'react-router-dom'
import { routePaths } from '../routes/routePaths'

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#1b160f] text-[#f8f1e7]">
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,188,102,0.2),_transparent_45%),radial-gradient(circle_at_15%_15%,_rgba(255,169,77,0.12),_transparent_40%)]" />
        <a
          href="#auth-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#f6c67a] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-[#1b160f]"
        >
          Skip to content
        </a>
        <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-10">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="flex flex-col justify-center gap-4">
              <Link
                to={routePaths.root}
                className="text-sm font-semibold text-[#f6c67a]"
              >
                Wedding Speech Analyzer
              </Link>
              <h1 className="text-4xl font-semibold text-white">
                Perfect every word with a polished, collaborative workflow.
              </h1>
              <p className="text-sm text-[#cdb89c]">
                Secure uploads, role-based review queues, and fast analysis for large audio files.
              </p>
            </section>
            <section
              id="auth-content"
              className="rounded-3xl border border-[#3a2e22] bg-[#231b13] p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]"
            >
              <Outlet />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
