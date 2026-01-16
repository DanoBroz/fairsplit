'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES, type CurrencyCode } from '@/types'
import { useLanguage } from '@/components/LanguageProvider'
import { LanguageToggle } from '@/components/LanguageToggle'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create household state
  const [householdName, setHouseholdName] = useState('')
  const [yourName, setYourName] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('CZK')
  const [income, setIncome] = useState('')

  // Join household state
  const [inviteCode, setInviteCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [partnerIncome, setPartnerIncome] = useState('')

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error(t.onboarding.notAuthenticated)

      const inviteCodeGenerated = generateInviteCode()

      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: householdName,
          invite_code: inviteCodeGenerated,
          currency,
          created_by: user.id,
        })
        .select()
        .single()

      if (householdError) throw householdError

      // Add user as owner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          display_name: yourName,
          role: 'owner',
          income: parseFloat(income) || 0,
        })

      if (memberError) throw memberError

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setIsLoading(false)
    }
  }

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error(t.onboarding.notAuthenticated)

      // Find household by invite code using RPC function
      const { data: households, error: householdError } = await supabase
        .rpc('find_household_by_invite', { code: inviteCode.toUpperCase() })

      if (householdError || !households || households.length === 0) {
        throw new Error(t.onboarding.invalidInviteCode)
      }

      const household = households[0]

      // Add user as member
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          display_name: displayName,
          role: 'member',
          income: parseFloat(partnerIncome) || 0,
        })

      if (memberError) throw memberError

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      {/* Language toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.onboarding.welcome}</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.onboarding.letsSetup}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
          {step === 'choice' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.onboarding.getStarted}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.onboarding.createOrJoin}
              </p>
              <div className="space-y-3">
                <Button onClick={() => setStep('create')} className="w-full" size="lg">
                  {t.onboarding.createNewHousehold}
                </Button>
                <Button
                  onClick={() => setStep('join')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  {t.onboarding.joinWithCode}
                </Button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <form onSubmit={handleCreateHousehold} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.onboarding.createHousehold}</h2>

              <div>
                <Label htmlFor="householdName">{t.onboarding.householdName}</Label>
                <Input
                  id="householdName"
                  placeholder={t.onboarding.householdNamePlaceholder}
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="yourName">{t.onboarding.yourName}</Label>
                <Input
                  id="yourName"
                  placeholder={t.onboarding.yourNamePlaceholder}
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="income">{t.onboarding.monthlyIncome}</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder={t.onboarding.incomePlaceholder}
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="currency">{t.onboarding.currency}</Label>
                <Select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  disabled={isLoading}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {t.currencies[c.code]}
                    </option>
                  ))}
                </Select>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('choice')}
                  disabled={isLoading}
                >
                  {t.common.back}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? t.onboarding.creating : t.onboarding.createHousehold}
                </Button>
              </div>
            </form>
          )}

          {step === 'join' && (
            <form onSubmit={handleJoinHousehold} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.onboarding.joinHousehold}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.onboarding.inviteCodeHint}
              </p>

              <div>
                <Label htmlFor="inviteCode">{t.onboarding.inviteCode}</Label>
                <Input
                  id="inviteCode"
                  placeholder={t.onboarding.inviteCodePlaceholder}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  disabled={isLoading}
                  maxLength={8}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="displayName">{t.onboarding.yourName}</Label>
                <Input
                  id="displayName"
                  placeholder={t.onboarding.partnerNamePlaceholder}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="partnerIncome">{t.onboarding.monthlyIncome}</Label>
                <Input
                  id="partnerIncome"
                  type="number"
                  placeholder={t.onboarding.partnerIncomePlaceholder}
                  value={partnerIncome}
                  onChange={(e) => setPartnerIncome(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('choice')}
                  disabled={isLoading}
                >
                  {t.common.back}
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? t.onboarding.joining : t.onboarding.joinHousehold}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
