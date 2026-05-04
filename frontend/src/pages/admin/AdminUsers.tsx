import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import {
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser
} from '../../api/admin'
import type { Role } from '../../types/auth'

type UserRole = Role

type ConfirmAction =
  | { user: AdminUser; type: 'suspend' | 'activate' | 'delete' }
  | { user: AdminUser; type: 'role'; nextRole: UserRole }

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
}

export const AdminUsers = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)

  const {
    data: users = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers
  })

  const selectedUser = useMemo(() => {
    if (selectedUserId) return users.find((user) => user.id === selectedUserId) ?? null
    return users[0] ?? null
  }, [selectedUserId, users])

  const filtered = useMemo(() => {
    return users.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [search, users])

  const updateCachedUser = (updated: AdminUser) => {
    queryClient.setQueryData<AdminUser[]>(['admin', 'users'], (current = []) =>
      current.map((user) => (user.id === updated.id ? updated : user))
    )
    setSelectedUserId(updated.id)
  }

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateAdminUserRole(userId, role),
    onSuccess: (updated) => {
      updateCachedUser(updated)
      toast.success(`Role updated to ${updated.role}`)
      setConfirmAction(null)
    },
    onError: () => {
      toast.error('Unable to update user role. Please try again.')
    }
  })

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminUser['status'] }) =>
      updateAdminUserStatus(userId, status),
    onSuccess: (updated) => {
      updateCachedUser(updated)
      toast.success(updated.status === 'active' ? 'User activated' : 'User suspended')
      setConfirmAction(null)
    },
    onError: () => {
      toast.error('Unable to update user status. Please try again.')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData<AdminUser[]>(['admin', 'users'], (current = []) =>
        current.filter((user) => user.id !== userId)
      )
      if (selectedUserId === userId) {
        const nextUser = users.find((user) => user.id !== userId)
        setSelectedUserId(nextUser?.id ?? null)
      }
      toast.success('User deleted')
      setConfirmAction(null)
    },
    onError: () => {
      toast.error('Unable to delete user. Please try again.')
    }
  })

  const isMutating = roleMutation.isPending || statusMutation.isPending || deleteMutation.isPending

  const handleRoleChange = (user: AdminUser, nextRole: UserRole) => {
    if (user.role === nextRole) return
    setConfirmAction({ user, type: 'role', nextRole })
  }

  const handleStatusToggle = (user: AdminUser) => {
    setConfirmAction({
      user,
      type: user.status === 'active' ? 'suspend' : 'activate'
    })
  }

  const handleConfirm = () => {
    if (!confirmAction) return

    if (confirmAction.type === 'role') {
      roleMutation.mutate({ userId: confirmAction.user.id, role: confirmAction.nextRole })
      return
    }

    if (confirmAction.type === 'delete') {
      deleteMutation.mutate(confirmAction.user.id)
      return
    }

    statusMutation.mutate({
      userId: confirmAction.user.id,
      status: confirmAction.type === 'activate' ? 'active' : 'suspended'
    })
  }

  if (isError) {
    return (
      <ErrorState
        title="Users unavailable"
        description="We could not load admin users from the API."
        onAction={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-text">User Management</h1>
          <p className="text-sm text-muted">Roles, access, and account status.</p>
        </div>
        <Button variant="secondary" disabled>
          Invite user
        </Button>
      </div>

      <Card className="space-y-3">
        <Input
          label="Search users"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-text">All users</p>
            <span className="text-xs text-muted">
              {isLoading ? 'Loading...' : `${filtered.length} users`}
            </span>
          </div>
          {isLoading ? (
            <div className="rounded-xl border border-border bg-surface-alt px-4 py-6 text-center text-sm text-muted">
              Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Try a different name or email search."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setSelectedUserId(user.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selectedUser?.id === user.id
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-border bg-surface-alt'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                    <Badge variant="default">{user.role}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-text">Profile</p>
            <p className="text-xs text-muted">View account details and actions.</p>
          </div>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-alt p-4">
                <p className="text-lg font-semibold text-text">{selectedUser.name}</p>
                <p className="text-xs text-muted">{selectedUser.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="default">{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.status === 'active' ? 'success' : 'danger'}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">User ID</span>
                  <span className="truncate font-semibold text-text">{selectedUser.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Created</span>
                  <span className="font-semibold text-text">{formatDate(selectedUser.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Status</span>
                  <span className="font-semibold text-text">{selectedUser.status}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted">Role</label>
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
                  value={selectedUser.role}
                  disabled={isMutating}
                  onChange={(event) => handleRoleChange(selectedUser, event.target.value as UserRole)}
                >
                  <option value="videographer">Videographer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Button
                  variant="secondary"
                  disabled={isMutating}
                  onClick={() => handleStatusToggle(selectedUser)}
                >
                  {selectedUser.status === 'active' ? 'Suspend user' : 'Activate user'}
                </Button>
                <Button
                  variant="danger"
                  disabled={isMutating}
                  onClick={() => setConfirmAction({ user: selectedUser, type: 'delete' })}
                >
                  Delete user
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted">
              Select a user to view profile details.
            </div>
          )}
        </Card>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card">
            <p className="text-lg font-semibold text-text">Confirm action</p>
            <p className="mt-2 text-sm text-muted">
              {confirmAction.type === 'role' &&
                `Change role for ${confirmAction.user.name} to ${confirmAction.nextRole}?`}
              {confirmAction.type === 'suspend' &&
                `Suspend ${confirmAction.user.name}? They will lose access until reactivated.`}
              {confirmAction.type === 'activate' &&
                `Activate ${confirmAction.user.name}? Access will be restored.`}
              {confirmAction.type === 'delete' &&
                `Delete ${confirmAction.user.name}? This removes their account and related jobs.`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" disabled={isMutating} onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button
                variant={confirmAction.type === 'delete' ? 'danger' : 'primary'}
                disabled={isMutating}
                onClick={handleConfirm}
              >
                {isMutating ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
