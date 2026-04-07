import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { getRoleRedirect, routePaths } from '../../routes/routePaths'

export const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleRedirect(user.role), { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div className="min-h-screen bg-[#1b160f] text-[#f8f1e7]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,188,102,0.25),_transparent_45%),radial-gradient(circle_at_15%_15%,_rgba(255,169,77,0.15),_transparent_40%)]" />
        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6c67a] text-[#1b160f]">
              WS
            </div>
            <span className="text-sm font-semibold tracking-wide">Wedding Speech Analyzer</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-[#d7c4a9] md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#pricing" className="transition hover:text-white">Teams</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to={routePaths.auth.login} className="text-sm font-semibold text-[#f6c67a]">
              Sign in
            </Link>
            <Button className="bg-[#f6c67a] text-[#1b160f] hover:bg-[#f7b657]">
              <Link to={routePaths.auth.register}>Get Started</Link>
            </Button>
          </div>
        </nav>

        <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-6 pb-24 pt-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f6c67a]">
              Wedding Speech Analyzer
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Perfect Every Word,
              <span className="block text-[#f6c67a]">Together.</span>
            </h1>
            <p className="max-w-xl text-sm text-[#d7c4a9]">
              Collaborate on ceremony speeches with role-based workflows, emotion tags, and
              timestamped transcripts that keep every story on track.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="bg-[#f6c67a] text-[#1b160f] hover:bg-[#f7b657]">
                <Link to={routePaths.auth.register}>Start free trial</Link>
              </Button>
              <Button variant="ghost" className="border border-[#4a3b2a] text-[#f8f1e7] hover:bg-[#2a2117]">
                Watch demo
              </Button>
            </div>
            <div className="grid gap-3 pt-6 sm:grid-cols-3">
              {[
                { label: 'Studios onboarded', value: '120+' },
                { label: 'Hours analyzed', value: '18.4k' },
                { label: 'Processing accuracy', value: '98%' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[#3a2e22] bg-[#231b13] px-4 py-3">
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-xs text-[#cdb89c]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[#3a2e22] bg-[#231b13] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#cdb89c]">
                <span>Live processing</span>
                <span>01:12</span>
              </div>
              <div className="rounded-2xl border border-[#3a2e22] bg-[#1b160f] p-4">
                <p className="text-sm font-semibold text-white">Highlight detected</p>
                <p className="text-xs text-[#cdb89c]">“You taught me how to be brave.”</p>
                <div className="mt-4 h-2 rounded-full bg-[#2f261b]">
                  <div className="h-2 w-3/4 rounded-full bg-[#f6c67a]" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#3a2e22] bg-[#1b160f] p-4">
                  <p className="text-xs text-[#cdb89c]">Audio quality</p>
                  <p className="text-xl font-semibold text-white">92%</p>
                </div>
                <div className="rounded-2xl border border-[#3a2e22] bg-[#1b160f] p-4">
                  <p className="text-xs text-[#cdb89c]">Highlights ready</p>
                  <p className="text-xl font-semibold text-white">14</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Elevate Your Edit</h2>
            <p className="text-sm text-[#cdb89c]">
              Precision workflows for videographers, editors, and studio admins.
            </p>
          </div>
          <Button variant="ghost" className="border border-[#3a2e22] text-[#f6c67a] hover:bg-[#2a2117]">
            Explore features
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-3xl border border-[#3a2e22] bg-[#231b13] p-6">
            {[
              'AI-powered transcription with diarization',
              'Emotional highlight tagging for storytelling',
              'Role-based review workflows for large teams'
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#f6c67a]" />
                <p className="text-sm text-[#e6d5c1]">{item}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-[#3a2e22] bg-[#1b160f] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f6c67a]">Precision workflow</p>
            <p className="mt-3 text-lg font-semibold text-white">From ingest to final cut.</p>
            <p className="mt-2 text-sm text-[#cdb89c]">
              Use job pipelines, notifications, and exports to deliver polished films faster.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['Transcription', 'Collaboration', 'Secure storage'].map((item) => (
                <div key={item} className="rounded-2xl border border-[#3a2e22] bg-[#231b13] px-4 py-3 text-xs text-[#e6d5c1]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-20">
        <h3 className="text-xl font-semibold text-white">Workflow highlights</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'AI-powered transcription',
              desc: 'Speaker diarization and timestamps built for speeches.'
            },
            {
              title: 'Collaborative editing',
              desc: 'Assign jobs, track status, and deliver approvals faster.'
            },
            {
              title: 'Secure cloud storage',
              desc: 'Protect large uploads with resilient, resumable pipelines.'
            }
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-[#3a2e22] bg-[#231b13] p-6">
              <p className="text-sm font-semibold text-white">{card.title}</p>
              <p className="mt-2 text-sm text-[#cdb89c]">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-[#3a2e22] bg-[#231b13] p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">Ready to streamline your storytelling?</h3>
          <p className="mt-2 text-sm text-[#cdb89c]">
            Join studios delivering unforgettable speeches with powerful analytics.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button className="bg-[#f6c67a] text-[#1b160f] hover:bg-[#f7b657]">
              <Link to={routePaths.auth.register}>Get Started</Link>
            </Button>
            <Button variant="ghost" className="border border-[#3a2e22] text-[#f8f1e7] hover:bg-[#2a2117]">
              Talk to sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
