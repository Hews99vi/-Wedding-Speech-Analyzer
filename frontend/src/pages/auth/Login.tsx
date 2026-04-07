import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import type { Role } from '../../types/auth'
import { getRoleRedirect, routePaths } from '../../routes/routePaths'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['videographer', 'editor', 'admin'])
})

type FormValues = z.infer<typeof schema>

type DevAccount = {
  label: string
  role: Role
  email: string
  password: string
}

type AuthStatus = 'idle' | 'loading' | 'invalid' | 'locked'

const devAccounts: DevAccount[] = [
  {
    label: 'Admin',
    role: 'admin',
    email: 'admin@weddingspeech.ai',
    password: 'Admin123!'
  },
  {
    label: 'Editor',
    role: 'editor',
    email: 'editor@weddingspeech.ai',
    password: 'Editor123!'
  },
  {
    label: 'Videographer',
    role: 'videographer',
    email: 'video@weddingspeech.ai',
    password: 'Video123!'
  }
]

export const Login = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'demo@weddingspeech.ai',
      role: 'videographer'
    }
  })

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const roles = useMemo(
    () => [
      { value: 'videographer', label: 'Videographer' },
      { value: 'editor', label: 'Editor' },
      { value: 'admin', label: 'Admin' }
    ],
    []
  )

  const loginWithRole = (values: FormValues) => {
    const userRole = values.role as Role
    setAuth({
      user: {
        id: 'demo-user',
        name: 'Amina Rivera',
        email: values.email,
        role: userRole
      },
      accessToken: 'demo-access-token'
    })

    toast.success('Welcome back!')
    navigate(getRoleRedirect(userRole))
  }

  const simulateAuth = async (values: FormValues) => {
    setStatus('loading')
    await new Promise((resolve) => setTimeout(resolve, 700))

    const password = values.password.toLowerCase()
    if (password.includes('locked')) {
      setStatus('locked')
      return
    }
    if (password.includes('invalid')) {
      setStatus('invalid')
      return
    }

    setStatus('idle')
    loginWithRole(values)
  }

  const onSubmit = (values: FormValues) => {
    if (isOffline) {
      toast.error('You appear to be offline. Check your connection and try again.')
      return
    }

    simulateAuth(values)
  }

  const handleDevLogin = (account: DevAccount) => {
    setValue('email', account.email)
    setValue('password', account.password)
    setValue('role', account.role)
    setStatus('idle')
    loginWithRole({
      email: account.email,
      password: account.password,
      role: account.role
    })
  }

  return (
    <div className="space-y-6 text-[#f8f1e7]">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#2b2117] px-3 py-1 text-xs font-semibold text-[#f6c67a]">
          Secure Access
        </div>
        <h2 className="text-2xl font-semibold text-white">Sign in</h2>
        <p className="text-sm text-[#cdb89c]">
          Manage wedding speech uploads, transcripts, and edits.
        </p>
      </div>

      {isOffline && (
        <div className="rounded-2xl border border-warning-500/40 bg-warning-50 px-4 py-3 text-xs text-warning-700">
          You are offline. Sign in will resume once the connection is restored.
        </div>
      )}

      {status === 'invalid' && (
        <div className="rounded-2xl border border-danger-500/40 bg-danger-50 px-4 py-3 text-xs text-danger-700">
          Invalid credentials. Please check your email and password.
        </div>
      )}

      {status === 'locked' && (
        <div className="rounded-2xl border border-danger-500/40 bg-danger-50 px-4 py-3 text-xs text-danger-700">
          This account is locked. Contact an administrator for access.
        </div>
      )}

      <div className="rounded-2xl border border-[#3a2e22] bg-[#1b160f] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#cdb89c]">
          Developer login
        </p>
        <p className="mt-2 text-xs text-[#9e8a71]">
          Quick-fill demo accounts for role-based access checks.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {devAccounts.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => handleDevLogin(account)}
              className="flex h-full flex-col justify-between gap-2 rounded-xl border border-[#3a2e22] bg-[#231b13] px-3 py-3 text-left text-xs font-semibold text-white transition hover:border-[#f6c67a]"
            >
              <span className="text-xs font-semibold text-white">{account.label}</span>
              <span className="break-all text-[11px] font-normal text-[#cdb89c]">
                {account.email}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          className="bg-[#1b160f] text-white border-[#3a2e22] focus:border-[#f6c67a]"
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          className="bg-[#1b160f] text-white border-[#3a2e22] focus:border-[#f6c67a]"
        />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-[#cdb89c]">
            <input type="checkbox" className="h-4 w-4 rounded border-[#3a2e22]" />
            Remember me
          </label>
          <Link to={routePaths.auth.forgotPassword} className="font-semibold text-[#f6c67a]">
            Forgot password?
          </Link>
        </div>
        <label className="flex flex-col gap-1 text-sm text-[#cdb89c]">
          <span className="font-medium text-white">Role</span>
          <select
            className="w-full rounded-xl border border-[#3a2e22] bg-[#1b160f] px-3 py-2 text-sm text-white outline-none transition focus:border-[#f6c67a]"
            {...register('role')}
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="submit"
          disabled={isSubmitting || status === 'loading' || isOffline}
          className="w-full bg-[#f6c67a] text-[#1b160f] hover:bg-[#f7b657]"
        >
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="flex items-center justify-between text-xs text-[#cdb89c]">
        <span>Demo mode: role selection changes route access.</span>
        <Link to={routePaths.auth.register} className="font-semibold text-[#f6c67a]">
          Create account
        </Link>
      </div>
    </div>
  )
}
