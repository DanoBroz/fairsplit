'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHousehold } from '@/hooks/useHousehold'
import { useExpenses } from '@/hooks/useExpenses'
import { AddExpenseModal } from '@/components/AddExpenseModal'
import { ExpenseList } from '@/components/ExpenseList'
import { SummaryCards } from '@/components/SummaryCards'
import { Button } from '@/components/ui/Button'

export default function AppPage() {
  const router = useRouter()
  const { household, members, currentUserId, loading: householdLoading } = useHousehold()
  const { expenses, loading: expensesLoading, refetch } = useExpenses(household?.id || null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  if (householdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-600 fill-blue-600 animate-pulse" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (!household || !currentUserId) {
    router.push('/onboarding')
    return null
  }

  const currentMember = members.find((m) => m.userId === currentUserId)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
              <h1 className="text-3xl font-bold">{household.name}</h1>
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

        {/* Summary Cards */}
        <SummaryCards
          expenses={expenses}
          members={members}
          currentUserId={currentUserId}
          currency={household.currency}
        />

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
                  {household.currency} {member.income.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm font-medium mb-2">Invite Code</p>
            <p className="text-2xl font-mono font-bold tracking-wider">
              {household.inviteCode}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Share this code with your partner to join this household
            </p>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Expenses</h2>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {expensesLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No expenses yet. Click "Add Expense" to get started.
            </p>
          ) : (
            <ExpenseList
              expenses={expenses}
              members={members}
              currentUserId={currentUserId}
              currency={household.currency}
              onRefresh={refetch}
            />
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        householdId={household.id}
        currentUserId={currentUserId}
        currentUserName={currentMember?.displayName || 'You'}
        onSuccess={refetch}
      />
    </div>
  )
}
