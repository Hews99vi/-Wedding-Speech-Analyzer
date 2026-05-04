import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/authStore'
import { loginUser, fetchMe } from '../../api/auth'
import { getRoleRedirect, routePaths } from '../../routes/routePaths'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

type FormValues = z.infer<typeof schema>

type AuthStatus = 'idle' | 'loading' | 'invalid' | 'locked' | 'unconfirmed'

export const Login = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
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

  const onSubmit = async (values: FormValues) => {
    if (isOffline) {
      toast.error('You appear to be offline. Check your connection and try again.')
      return
    }

    setStatus('loading')

    const { data, error } = await loginUser(values.email, values.password)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setStatus('invalid')
        return
      }
      if (error.message.includes('Email not confirmed')) {
        setStatus('unconfirmed')
        return
      }
      if (error.message.includes('suspended') || error.message.includes('banned')) {
        setStatus('locked')
        return
      }
      setStatus('idle')
      toast.error('Unable to sign in. Please try again.')
      return
    }

    const session = data?.session
    if (!session) {
      setStatus('idle')
      toast.error('Sign in failed unexpectedly.')
      return
    }

    try {
      const user = await fetchMe(session.access_token)
      setAuth({ user, accessToken: session.access_token })
      setStatus('idle')
      toast.success('Welcome back!')
      navigate(getRoleRedirect(user.role))
    } catch {
      setStatus('idle')
      toast.error('Unable to load your profile. Please try again.')
    }
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

      {status === 'unconfirmed' && (
        <div className="rounded-2xl border border-warning-500/40 bg-warning-50 px-4 py-3 text-xs text-warning-700">
          Please confirm your email before signing in. Check your inbox for the confirmation link.
        </div>
      )}

      {status === 'locked' && (
        <div className="rounded-2xl border border-danger-500/40 bg-danger-50 px-4 py-3 text-xs text-danger-700">
          This account is locked. Contact an administrator for access.
        </div>
      )}

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
        <Button
          type="submit"
          disabled={isSubmitting || status === 'loading' || isOffline}
          className="w-full bg-[#f6c67a] text-[#1b160f] hover:bg-[#f7b657]"
        >
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="flex items-center justify-between text-xs text-[#cdb89c]">
        <span>Need access for your team?</span>
        <Link to={routePaths.auth.register} className="font-semibold text-[#f6c67a]">
          Create account
        </Link>
      </div>
    </div>
  )
}
