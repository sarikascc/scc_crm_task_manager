import { login } from '@/lib/auth/actions'
import { LoginForm } from './login-form'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your email and password to access the CRM
          </p>
        </div>
        <LoginForm error={searchParams.error} />
      </div>
    </div>
  )
}

