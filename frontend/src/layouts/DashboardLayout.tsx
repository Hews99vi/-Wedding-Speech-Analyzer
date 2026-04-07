import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { TopBar } from '../components/TopBar'
import { MobileNav } from '../components/MobileNav'

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <TopBar />
          <main id="main-content" className="main-gradient flex-1 px-6 py-8 pb-24 md:pb-10">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
