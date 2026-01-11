import Link from 'next/link'
import { Heart } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
            <h1 className="text-3xl font-bold">FairSplit</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track and split expenses fairly
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">Sign In</h2>
          <LoginForm />
        </Card>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
