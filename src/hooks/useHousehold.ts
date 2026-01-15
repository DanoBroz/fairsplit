import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Household, HouseholdMember } from '@/types'

interface HouseholdData {
  household: Household | null
  members: HouseholdMember[]
  currentUserId: string | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useHousehold(): HouseholdData {
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), [])

  useEffect(() => {
    async function loadHouseholdData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Not authenticated')
        }

        setCurrentUserId(user.id)

        // Get user's household membership
        const { data: membership, error: membershipError } = await supabase
          .from('household_members')
          .select('household_id')
          .eq('user_id', user.id)
          .single()

        if (membershipError) throw membershipError

        // Get household details
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', membership.household_id)
          .single()

        if (householdError) throw householdError

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

        // Get all household members
        const { data: membersData, error: membersError } = await supabase
          .from('household_members')
          .select('*')
          .eq('household_id', membership.household_id)

        if (membersError) throw membersError

        // Transform snake_case to camelCase
        const transformedMembers: HouseholdMember[] = membersData.map((m: any) => ({
          id: m.id,
          householdId: m.household_id,
          userId: m.user_id,
          displayName: m.display_name,
          role: m.role,
          income: parseFloat(m.income) || 0,
          joinedAt: m.joined_at,
        }))
        setMembers(transformedMembers)

        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadHouseholdData()
  }, [refetchTrigger])

  return { household, members, currentUserId, loading, error, refetch }
}

export async function updateMember(
  memberId: string,
  updates: { displayName?: string; income?: number }
) {
  const supabase = createClient()

  const snakeCaseUpdates: Record<string, unknown> = {}
  if (updates.displayName !== undefined) snakeCaseUpdates.display_name = updates.displayName
  if (updates.income !== undefined) snakeCaseUpdates.income = updates.income

  const { error } = await supabase
    .from('household_members')
    .update(snakeCaseUpdates)
    .eq('id', memberId)

  if (error) throw error
}
