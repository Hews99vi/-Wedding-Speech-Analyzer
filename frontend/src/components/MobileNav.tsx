import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { routePaths } from '../routes/routePaths'
import { RoleGate } from './RoleGate'

const navClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold transition',
    isActive ? 'text-brand-700' : 'text-muted'
  )

const iconClass = 'h-5 w-5'

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-2 rounded-2xl border border-border bg-surface/95 p-2 shadow-card backdrop-blur md:hidden">
      <RoleGate roles={['videographer']}>
        <NavLink to={routePaths.app.videographer} className={navClass}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 7h10a2 2 0 0 1 2 2v2" />
            <path d="M4 17h10a2 2 0 0 0 2-2v-2" />
            <path d="M18 9l3-2v10l-3-2" />
          </svg>
          Video
        </NavLink>
      </RoleGate>
      <RoleGate roles={['editor']}>
        <NavLink to={routePaths.app.editor} className={navClass}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6h16" />
            <path d="M4 12h10" />
            <path d="M4 18h14" />
            <path d="M16 10l4 2-4 2z" />
          </svg>
          Edit
        </NavLink>
      </RoleGate>
      <RoleGate roles={['videographer', 'editor']}>
        <NavLink to={routePaths.app.jobs} className={navClass}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M8 8h8" />
            <path d="M8 12h5" />
            <path d="M8 16h6" />
          </svg>
          Jobs
        </NavLink>
      </RoleGate>
      <NavLink to={routePaths.app.notifications} className={navClass}>
        <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 4a5 5 0 0 0-5 5v3l-2 3h14l-2-3V9a5 5 0 0 0-5-5z" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
        Alerts
      </NavLink>
      <RoleGate roles={['admin']}>
        <NavLink to={routePaths.app.admin} className={navClass}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l7 4v5c0 4.4-3 8.2-7 9-4-0.8-7-4.6-7-9V7l7-4z" />
            <path d="M9 12h6" />
          </svg>
          Admin
        </NavLink>
      </RoleGate>
      <RoleGate roles={['admin']}>
        <NavLink to={routePaths.app.adminUsers} className={navClass}>
          <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
            <path d="M3 21a9 9 0 0 1 18 0" />
          </svg>
          Users
        </NavLink>
      </RoleGate>
    </nav>
  )
}
