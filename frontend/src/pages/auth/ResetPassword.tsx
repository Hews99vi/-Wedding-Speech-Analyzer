import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { updatePassword } from '../../api/auth'
import { routePaths } from '../../routes/routePaths'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type FormValues = z.infer<typeof schema>

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

export const ResetPassword = () => {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    let cancelled = false

    // AuthInitializer may have already processed the recovery token before
    // this component mounted, so the PASSWORD_RECOVERY event has already fired.
    // Calling getSession() here catches that case — if there's an active
    // session on the reset page, the user arrived via the recovery link.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) {
        setPageState('ready')
      }
    })

    // Also subscribe in case the token exchange happens after mount
    // (e.g., the page is loaded directly without AuthInitializer processing first).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!cancelled && event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      }
    })

    const timeout = setTimeout(() => {
      setPageState((current) => current === 'loading' ? 'invalid' : current)
    }, 5000)

    return () => {
      cancelled = true
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const onSubmit = async (values: FormValues) => {
    const { error } = await updatePassword(values.password)
    if (error) {
      toast.error('Unable to update password. Please request a new reset link.')
      return
    }
    setPageState('success')
    await supabase.auth.signOut()
    toast.success('Password updated. Please sign in with your new password.')
    navigate(routePaths.auth.login)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Password Reset
        </div>
        <h2 className="text-2xl font-semibold text-text">Set new password</h2>
        <p className="text-sm text-muted">
          Choose a strong password for your account.
        </p>
      </div>

      {pageState === 'loading' && (
        <div className="rounded-2xl border border-border bg-surface-alt px-4 py-4 text-sm text-muted">
          Verifying your reset link...
        </div>
      )}

      {pageState === 'invalid' && (
        <div className="rounded-2xl border border-danger-500/40 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          This reset link is invalid or has already been used. Please{' '}
          <a href={routePaths.auth.forgotPassword} className="font-semibold underline">
            request a new one
          </a>
          .
        </div>
      )}

      {pageState === 'ready' && (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="New password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="Confirm new password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      )}

      {pageState === 'success' && (
        <div className="rounded-2xl border border-success-500/40 bg-success-50 px-4 py-3 text-sm text-success-700">
          Password updated successfully. Redirecting to sign in...
        </div>
      )}
    </div>
  )
}
