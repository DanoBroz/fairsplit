import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Expense } from '@/types'

export function useExpenses(householdId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = () => setRefetchTrigger((prev) => prev + 1)

  useEffect(() => {
    if (!householdId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function fetchExpenses() {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('household_id', householdId)
          .is('deleted_at', null)
          .order('date', { ascending: false })

        if (error) throw error

        // Transform snake_case to camelCase
        const transformedExpenses: Expense[] = (data || []).map((e: any) => ({
          id: e.id,
          householdId: e.household_id,
          amount: parseFloat(e.amount),
          description: e.description,
          category: e.category,
          type: e.type,
          paidBy: e.paid_by,
          includeInHousehold: e.include_in_household,
          paidByOwnerOnly: e.paid_by_owner_only ?? false,
          isTemporary: e.is_temporary ?? false,
          date: e.date,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
          deletedAt: e.deleted_at,
        }))

        setExpenses(transformedExpenses)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          // Refetch expenses when any change occurs
          fetchExpenses()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [householdId, refetchTrigger])

  return { expenses, loading, error, refetch }
}

export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = createClient()

  // Transform camelCase to snake_case
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      household_id: expense.householdId,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      type: expense.type,
      paid_by: expense.paidBy,
      include_in_household: expense.includeInHousehold,
      paid_by_owner_only: expense.paidByOwnerOnly ?? false,
      is_temporary: expense.isTemporary ?? false,
      date: expense.date,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'householdId' | 'createdAt' | 'updatedAt'>>
) {
  const supabase = createClient()

  // Transform camelCase to snake_case
  const snakeCaseUpdates: any = {}
  if (updates.amount !== undefined) snakeCaseUpdates.amount = updates.amount
  if (updates.description !== undefined) snakeCaseUpdates.description = updates.description
  if (updates.category !== undefined) snakeCaseUpdates.category = updates.category
  if (updates.type !== undefined) snakeCaseUpdates.type = updates.type
  if (updates.paidBy !== undefined) snakeCaseUpdates.paid_by = updates.paidBy
  if (updates.includeInHousehold !== undefined)
    snakeCaseUpdates.include_in_household = updates.includeInHousehold
  if (updates.paidByOwnerOnly !== undefined)
    snakeCaseUpdates.paid_by_owner_only = updates.paidByOwnerOnly
  if (updates.isTemporary !== undefined)
    snakeCaseUpdates.is_temporary = updates.isTemporary
  if (updates.date !== undefined) snakeCaseUpdates.date = updates.date

  const { data, error } = await supabase
    .from('expenses')
    .update(snakeCaseUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id: string) {
  const supabase = createClient()

  // Use RPC function for soft delete (bypasses RLS issues)
  const { error } = await supabase.rpc('soft_delete_expense', {
    expense_id: id
  })

  if (error) throw error
}
