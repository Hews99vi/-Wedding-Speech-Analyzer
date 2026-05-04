import { Routes, Route } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Login } from '../pages/auth/Login'
import { Register } from '../pages/auth/Register'
import { ForgotPassword } from '../pages/auth/ForgotPassword'
import { ResetPassword } from '../pages/auth/ResetPassword'
import { Videographer } from '../pages/dashboard/Videographer'
import { Editor } from '../pages/dashboard/Editor'
import { Admin } from '../pages/dashboard/Admin'
import { AdminUsers } from '../pages/admin/AdminUsers'
import { JobsList } from '../pages/jobs/JobsList'
import { JobDetail } from '../pages/jobs/JobDetail'
import { NewAnalysis } from '../pages/dashboard/NewAnalysis'
import { Notifications } from '../pages/notifications/Notifications'
import { NotificationSettings } from '../pages/notifications/NotificationSettings'
import { TranscriptViewerPage } from '../pages/transcript/TranscriptViewerPage'
import { Landing } from '../pages/common/Landing'
import { NotFound } from '../pages/common/NotFound'
import { Unauthorized } from '../pages/common/Unauthorized'
import { PublicRoute, RequireAuth, RequireRole } from './guards'
import { routePaths } from './routePaths'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path={routePaths.root} element={<Landing />} />

      <Route
        path={routePaths.auth.login}
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route index element={<Login />} />
      </Route>
      <Route
        path={routePaths.auth.register}
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route index element={<Register />} />
      </Route>
      <Route
        path={routePaths.auth.forgotPassword}
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route index element={<ForgotPassword />} />
      </Route>
      <Route
        path={routePaths.auth.resetPassword}
        element={<AuthLayout />}
      >
        <Route index element={<ResetPassword />} />
      </Route>

      <Route
        path={routePaths.app.root}
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route
          path="videographer"
          element={
            <RequireRole roles={['videographer']}>
              <Videographer />
            </RequireRole>
          }
        />
        <Route
          path="videographer/new-analysis"
          element={
            <RequireRole roles={['videographer']}>
              <NewAnalysis />
            </RequireRole>
          }
        />
        <Route
          path="editor"
          element={
            <RequireRole roles={['editor']}>
              <Editor />
            </RequireRole>
          }
        />
        <Route
          path="admin"
          element={
            <RequireRole roles={['admin']}>
              <Admin />
            </RequireRole>
          }
        />
        <Route
          path="admin/users"
          element={
            <RequireRole roles={['admin']}>
              <AdminUsers />
            </RequireRole>
          }
        />
        <Route
          path="jobs"
          element={
            <RequireRole roles={['videographer', 'editor']}>
              <JobsList />
            </RequireRole>
          }
        />
        <Route
          path="jobs/:jobId"
          element={
            <RequireRole roles={['videographer', 'editor']}>
              <JobDetail />
            </RequireRole>
          }
        />
        <Route
          path="jobs/:jobId/transcript"
          element={
            <RequireRole roles={['videographer', 'editor']}>
              <TranscriptViewerPage />
            </RequireRole>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="notifications/settings" element={<NotificationSettings />} />
      </Route>

      <Route path={routePaths.unauthorized} element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
