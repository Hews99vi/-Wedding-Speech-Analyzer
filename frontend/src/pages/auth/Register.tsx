import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { registerUser } from '../../api/auth'
import { getRoleRedirect, routePaths } from '../../routes/routePaths'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['videographer', 'editor', 'admin'])
})

type FormValues = z.infer<typeof schema>

export const Register = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'videographer'
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await registerUser(values)

      setAuth({
        user: response.user,
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      })

      toast.success('Account created. Welcome!')
      navigate(getRoleRedirect(response.user.role))
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const detail = error.response.data?.detail
        toast.error(typeof detail === 'string' ? detail : 'Unable to create account.')
        return
      }

      toast.error('Unable to create account. Please try again.')
    }
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
            <option value="admin">Admin</option>
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
