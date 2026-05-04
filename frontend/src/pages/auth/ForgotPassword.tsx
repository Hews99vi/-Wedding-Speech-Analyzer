import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { forgotPassword } from '../../api/auth'
import { routePaths } from '../../routes/routePaths'

const schema = z.object({
  email: z.string().email()
})

type FormValues = z.infer<typeof schema>

export const ForgotPassword = () => {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (values: FormValues) => {
    const { error } = await forgotPassword(values.email)
    if (error) {
      toast.error('Unable to send reset email. Please try again.')
      return
    }
    setSent(true)
    toast.success('Reset link sent — check your inbox.')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          Password Reset
        </div>
        <h2 className="text-2xl font-semibold text-text">Forgot password</h2>
        <p className="text-sm text-muted">
          Enter your email and we will send a secure reset link.
        </p>
      </div>

      {sent && (
        <div className="rounded-2xl border border-success-500/40 bg-success-50 px-4 py-3 text-xs text-success-700">
          A reset link has been sent. Check your inbox (and spam folder).
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Button type="submit" disabled={isSubmitting || sent} className="w-full">
          {sent ? 'Email sent' : 'Send reset link'}
        </Button>
      </form>

      <div className="text-xs text-muted">
        Remembered your password?{' '}
        <Link to={routePaths.auth.login} className="font-semibold text-brand-600">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
