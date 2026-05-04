import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { fetchMe, registerUser } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { getRoleRedirect, routePaths } from '../../routes/routePaths'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['videographer', 'editor'])
})

type FormValues = z.infer<typeof schema>

export const Register = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'videographer' }
  })

  const onSubmit = async (values: FormValues) => {
    const { data, error } = await registerUser(values.name, values.email, values.password, values.role)

    if (error) {
      const msg = error.message.toLowerCase().includes('already registered')
        ? 'This email is already registered.'
        : 'Unable to create account. Please try again.'
      toast.error(msg)
      return
    }

    if (data.session) {
      // Email confirmation is disabled — session is returned immediately.
      try {
        const user = await fetchMe(data.session.access_token)
        useAuthStore.getState().setAuth({ user, accessToken: data.session.access_token })
        toast.success('Account created! Welcome.')
        navigate(getRoleRedirect(user.role))
      } catch {
        toast.error('Account created but unable to load your profile. Please sign in.')
        navigate(routePaths.auth.login)
      }
      return
    }

    // Email confirmation is enabled — no session yet.
    toast.success('Account created! Check your email to confirm before signing in.')
    navigate(routePaths.auth.login)
  }

  return (
    <div className="space-y-6 text-[#f8f1e7]">
      <div>
        <h2 className="text-2xl font-semibold text-white">Create account</h2>
        <p className="text-sm text-[#cdb89c]">
          Invite your team and start analyzing wedding speeches.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full name"
          {...register('name')}
          error={errors.name?.message}
          className="bg-[#1b160f] text-white border-[#3a2e22] focus:border-[#f6c67a]"
        />
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
        <label className="flex flex-col gap-1 text-sm text-[#cdb89c]">
          <span className="font-medium text-white">Role</span>
          <select
            className="w-full rounded-xl border border-[#3a2e22] bg-[#1b160f] px-3 py-2 text-sm text-white outline-none transition focus:border-[#f6c67a]"
            {...register('role')}
          >
            <option value="videographer">Videographer</option>
            <option value="editor">Editor</option>
          </select>
        </label>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-[#f6c67a] text-[#1b160f] hover:bg-[#f7b657]">
          Create account
        </Button>
      </form>
      <div className="text-xs text-[#cdb89c]">
        Already have an account?{' '}
        <Link to={routePaths.auth.login} className="font-semibold text-[#f6c67a]">
          Sign in
        </Link>
      </div>
    </div>
  )
}
