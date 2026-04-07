import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

type UserStatus = 'active' | 'suspended'

type UserRole = 'videographer' | 'editor' | 'admin'

type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive: string
  jobs: number
  storage: string
}

const mockUsers: User[] = [
  {
    id: 'user-01',
    name: 'Amina Rivera',
    email: 'amina@weddingspeech.ai',
    role: 'admin',
    status: 'active',
    lastActive: '2026-03-03 18:22',
    jobs: 42,
    storage: '84 GB'
  },
  {
    id: 'user-02',
    name: 'Theo Jacobs',
    email: 'theo@weddingspeech.ai',
    role: 'editor',
    status: 'active',
    lastActive: '2026-03-03 16:05',
    jobs: 19,
    storage: '26 GB'
  },
  {
    id: 'user-03',
    name: 'Maya Hill',
    email: 'maya@weddingspeech.ai',
    role: 'videographer',
    status: 'suspended',
    lastActive: '2026-02-28 10:11',
    jobs: 11,
    storage: '12 GB'
  },
  {
    id: 'user-04',
    name: 'Luis Carter',
    email: 'luis@weddingspeech.ai',
    role: 'videographer',
    status: 'active',
    lastActive: '2026-03-03 12:47',
    jobs: 28,
    storage: '51 GB'
  }
]

export const AdminUsers = () => {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[0])
  const [confirmAction, setConfirmAction] = useState<null | {
    user: User
    type: 'suspend' | 'activate' | 'role'
    nextRole?: UserRole
  }>(null)

  const filtered = useMemo(() => {
    return mockUsers.filter((user) =>
      `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const handleRoleChange = (user: User, nextRole: UserRole) => {
    setConfirmAction({ user, type: 'role', nextRole })
  }

  const handleStatusToggle = (user: User) => {
    setConfirmAction({
      user,
      type: user.status === 'active' ? 'suspend' : 'activate'
    })
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'role') {
      toast.success(`Role updated to ${confirmAction.nextRole}`)
    } else if (confirmAction.type === 'suspend') {
      toast.success('User suspended')
    } else {
      toast.success('User activated')
    }
    setConfirmAction(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-text">User Management</h1>
          <p className="text-sm text-muted">Roles, access, and audit visibility.</p>
        </div>
        <Button variant="secondary">Invite user</Button>
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
            <span className="text-xs text-muted">{filtered.length} users</span>
          </div>
          <div className="space-y-3">
            {filtered.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUser(user)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selectedUser?.id === user.id
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-border bg-surface-alt'
                }`}
              >
                <div>
                  <p className="font-semibold text-text">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                    {user.status}
                  </Badge>
                  <Badge variant="default">{user.role}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-text">Profile</p>
            <p className="text-xs text-muted">View account usage and actions.</p>
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
                <div className="flex items-center justify-between">
                  <span className="text-muted">Jobs processed</span>
                  <span className="font-semibold text-text">{selectedUser.jobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Storage usage</span>
                  <span className="font-semibold text-text">{selectedUser.storage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Last active</span>
                  <span className="font-semibold text-text">{selectedUser.lastActive}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted">Role</label>
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text"
                  value={selectedUser.role}
                  onChange={(event) => handleRoleChange(selectedUser, event.target.value as UserRole)}
                >
                  <option value="videographer">Videographer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Button variant="secondary" onClick={() => handleStatusToggle(selectedUser)}>
                  {selectedUser.status === 'active' ? 'Suspend user' : 'Activate user'}
                </Button>
                <Button variant="ghost">View audit log</Button>
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
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
