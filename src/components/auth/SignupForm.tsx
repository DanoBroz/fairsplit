'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { useLanguage } from '../LanguageProvider'

export function SignupForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch)
      return
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort)
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Redirect to onboarding/household creation
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t.auth.email}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t.auth.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="password">{t.auth.password}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t.auth.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={6}
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {t.auth.passwordHint}
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={t.auth.passwordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t.auth.creatingAccount : t.auth.createAccount}
      </Button>
    </form>
  )
}
