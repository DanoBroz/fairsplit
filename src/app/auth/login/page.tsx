'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { useLanguage } from '@/components/LanguageProvider'

export default function LoginPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.app.title}</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.app.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">{t.auth.signIn}</h2>
          <LoginForm />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {t.auth.dontHaveAccount}{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {t.auth.signUp}
          </Link>
        </p>
      </div>
    </div>
  )
}
