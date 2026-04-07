import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { routePaths } from '../routes/routePaths'
import { RoleGate } from './RoleGate'

const navClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-surface-alt'
  )

export const Sidebar = () => {
  return (
    <aside className="hidden h-full w-full flex-col gap-6 bg-surface px-6 py-8 md:flex md:w-64">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Wedding Speech</p>
        <h1 className="text-2xl font-semibold text-text">Analyzer Platform</h1>
      </div>
      <nav className="flex flex-col gap-2">
        <RoleGate roles={['videographer']}>
          <NavLink to={routePaths.app.videographer} className={navClass}>
            Videographer Hub
          </NavLink>
        </RoleGate>
        <RoleGate roles={['editor']}>
          <NavLink to={routePaths.app.editor} className={navClass}>
            Editor Workspace
          </NavLink>
        </RoleGate>
        <RoleGate roles={['videographer', 'editor']}>
          <NavLink to={routePaths.app.jobs} className={navClass}>
            Jobs
          </NavLink>
        </RoleGate>
        <NavLink to={routePaths.app.notifications} className={navClass}>
          Notifications
        </NavLink>
        <RoleGate roles={['admin']}>
          <NavLink to={routePaths.app.admin} className={navClass}>
            Admin Console
          </NavLink>
        </RoleGate>
        <RoleGate roles={['admin']}>
          <NavLink to={routePaths.app.adminUsers} className={navClass}>
            User Management
          </NavLink>
        </RoleGate>
      </nav>
      <div className="rounded-2xl bg-surface-alt p-4 text-xs text-muted">
        <p className="font-semibold text-text">Role-based workflow</p>
        <p>Videographer, Editor, and Admin dashboards.</p>
      </div>
    </aside>
  )
}
