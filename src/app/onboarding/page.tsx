'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { createClient } from '@/lib/supabase/client'
import { CURRENCIES, type CurrencyCode } from '@/types'

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
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create household state
  const [householdName, setHouseholdName] = useState('')
  const [yourName, setYourName] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('USD')
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

      if (!user) throw new Error('Not authenticated')

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
    } catch (err: any) {
      setError(err.message)
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

      if (!user) throw new Error('Not authenticated')

      // Find household by invite code using RPC function
      const { data: households, error: householdError } = await supabase
        .rpc('find_household_by_invite', { code: inviteCode.toUpperCase() })

      if (householdError || !households || households.length === 0) {
        throw new Error('Invalid invite code')
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
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
            <h1 className="text-3xl font-bold">Welcome to FairSplit!</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Let&apos;s set up your household
          </p>
        </div>

        <Card>
          {step === 'choice' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Get Started</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new household or join an existing one
              </p>
              <div className="space-y-3">
                <Button onClick={() => setStep('create')} className="w-full" size="lg">
                  Create New Household
                </Button>
                <Button
                  onClick={() => setStep('join')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Join with Invite Code
                </Button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <form onSubmit={handleCreateHousehold} className="space-y-4">
              <h2 className="text-xl font-bold">Create Household</h2>

              <div>
                <Label htmlFor="householdName">Household Name</Label>
                <Input
                  id="householdName"
                  placeholder="Our Home"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="yourName">Your Name</Label>
                <Input
                  id="yourName"
                  placeholder="Alex"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="income">Your Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="3000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  disabled={isLoading}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.name}
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
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Household'}
                </Button>
              </div>
            </form>
          )}

          {step === 'join' && (
            <form onSubmit={handleJoinHousehold} className="space-y-4">
              <h2 className="text-xl font-bold">Join Household</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the 8-character invite code your partner shared
              </p>

              <div>
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  placeholder="ABC12345"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  required
                  disabled={isLoading}
                  maxLength={8}
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  placeholder="Jordan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="partnerIncome">Your Monthly Income</Label>
                <Input
                  id="partnerIncome"
                  type="number"
                  placeholder="2000"
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
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join Household'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
