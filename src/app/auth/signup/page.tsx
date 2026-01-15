'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { SignupForm } from '@/components/auth/SignupForm'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/components/LanguageProvider'

export default function SignupPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
            <h1 className="text-3xl font-bold">{t.app.title}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t.app.subtitle}
          </p>
        </div>

        {/* Signup Card */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">{t.auth.createAccount}</h2>
          <SignupForm />
        </Card>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t.auth.alreadyHaveAccount}{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t.auth.signIn}
          </Link>
        </p>
      </div>
    </div>
  )
}
