'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'
import type { Household, HouseholdMember } from '@/types'

export default function AppPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUserId(user.id)

      // Get user's household membership
      const { data: membership } = await supabase
        .from('household_members')
        .select('household_id, display_name, role, income')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        router.push('/onboarding')
        return
      }

      // Get household details
      const { data: householdData } = await supabase
        .from('households')
        .select('*')
        .eq('id', membership.household_id)
        .single()

      if (householdData) {
        // Transform snake_case to camelCase
        const transformedHousehold: Household = {
          id: householdData.id,
          name: householdData.name,
          inviteCode: householdData.invite_code,
          currency: householdData.currency,
          createdAt: householdData.created_at,
          updatedAt: householdData.updated_at,
          createdBy: householdData.created_by,
        }
        setHousehold(transformedHousehold)
      }

      // Get all household members
      const { data: membersData } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', membership.household_id)

      if (membersData) {
        // Transform snake_case to camelCase
        const transformedMembers: HouseholdMember[] = membersData.map((m: any) => ({
          id: m.id,
          householdId: m.household_id,
          userId: m.user_id,
          displayName: m.display_name,
          role: m.role,
          income: m.income,
          joinedAt: m.joined_at,
        }))
        setMembers(transformedMembers)
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-600 fill-blue-600 animate-pulse" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
              <h1 className="text-3xl font-bold">{household?.name || 'FairSplit'}</h1>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/auth/login')
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Household Info */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Household Members</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
              >
                <div>
                  <p className="font-medium">
                    {member.displayName}
                    {member.userId === currentUserId && ' (You)'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {member.role}
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  {household?.currency} {member.income?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {household && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm font-medium mb-2">Invite Code</p>
              <p className="text-2xl font-mono font-bold tracking-wider">
                {household.inviteCode}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Share this code with your partner to join this household
              </p>
            </div>
          )}
        </div>

        {/* Expenses Section - Coming Soon */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Expenses</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Expense tracking coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
