'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Plus, Pencil, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHousehold } from '@/hooks/useHousehold'
import { useExpenses } from '@/hooks/useExpenses'
import { AddExpenseModal } from '@/components/AddExpenseModal'
import { EditProfileModal } from '@/components/EditProfileModal'
import { ExpenseList } from '@/components/ExpenseList'
import { SummaryCards } from '@/components/SummaryCards'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLanguage } from '@/components/LanguageProvider'

export default function AppPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { household, members, currentUserId, loading: householdLoading, refetch: refetchHousehold } = useHousehold()
  const { expenses, loading: expensesLoading, refetch } = useExpenses(household?.id || null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const copyInviteCode = async () => {
    if (!household?.inviteCode) return
    try {
      await navigator.clipboard.writeText(household.inviteCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (householdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-600 fill-blue-600 animate-pulse" />
          <p className="text-xl">{t.common.loading}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
              <h1 className="text-3xl font-bold">{household.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/auth/login')
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {t.common.signOut}
              </button>
            </div>
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
        <div className="rounded-lg p-6 shadow-sm mb-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4">{t.app.householdMembers}</h2>
          <div className="space-y-3">
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded bg-gray-100 dark:bg-gray-700"
                >
                  <div>
                    <p className="font-medium">
                      {member.displayName}
                      {isCurrentUser && ` (${t.common.you})`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.roles[member.role as keyof typeof t.roles]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">
                      {household.currency} {member.income.toLocaleString()}
                    </p>
                    {isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        aria-label={t.profile.editProfile}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 rounded bg-indigo-50 dark:bg-indigo-900/20">
            <p className="text-sm font-medium mb-2">{t.app.inviteCodeLabel}</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-mono font-bold tracking-wider">
                {household.inviteCode}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyInviteCode}
                className={`transition-colors ${codeCopied ? 'text-green-600' : 'text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}
                aria-label={t.app.copyCode}
              >
                {codeCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">{t.app.codeCopied}</span>
                  </>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {t.app.shareCodeHint}
            </p>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="rounded-lg p-6 shadow-sm bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t.app.expenses}</h2>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t.app.addExpense}
            </Button>
          </div>

          {expensesLoading ? (
            <p className="text-gray-600 dark:text-gray-400">{t.app.loadingExpenses}</p>
          ) : expenses.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              {t.app.noExpenses}
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
        currentUserName={currentMember?.displayName || t.common.you}
        onSuccess={refetch}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        member={currentMember || null}
        currency={household.currency}
        onSuccess={refetchHousehold}
      />
    </div>
  )
}
