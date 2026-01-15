'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Plus, Pencil, Copy, Check, LogOut, Users, User, Crown, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useHousehold } from '@/hooks/useHousehold'
import { useExpenses } from '@/hooks/useExpenses'
import { AddExpenseModal } from '@/components/AddExpenseModal'
import { EditProfileModal } from '@/components/EditProfileModal'
import { ExpenseList } from '@/components/ExpenseList'
import { SummaryCards } from '@/components/SummaryCards'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLanguage } from '@/components/LanguageProvider'
import { formatAmount } from '@/lib/utils'

export default function AppPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Heart className="w-12 h-12 text-blue-600 fill-blue-600 animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 bg-blue-600/20 rounded-full animate-ping" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!household || !currentUserId) {
    router.push('/onboarding')
    return null
  }

  const currentMember = members.find((m) => m.userId === currentUserId)

  // Sort members: current user first, then by role
  const sortedMembers = [...members].sort((a, b) => {
    if (a.userId === currentUserId) return -1
    if (b.userId === currentUserId) return 1
    if (a.role === 'owner') return -1
    if (b.role === 'owner') return 1
    return 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header - compact on mobile */}
      <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/20">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {household.name}
              </h1>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <LanguageToggle />
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  router.push('/auth/login')
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
                aria-label={t.common.signOut}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5 text-sm">{t.common.signOut}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
          {/* Left sidebar - Summary & Members */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-3 lg:mb-0 lg:sticky lg:top-20 lg:self-start">
            {/* Summary Cards */}
            <SummaryCards
              expenses={expenses}
              members={members}
              currentUserId={currentUserId}
              currency={household.currency}
            />

            {/* Household Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.app.householdMembers}</span>
                </div>
                <button
                  onClick={copyInviteCode}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    codeCopied
                      ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}
                  title={household.inviteCode}
                >
                  {codeCopied ? <Check className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                  <span className="font-mono font-bold tracking-wider">{household.inviteCode}</span>
                </button>
              </div>

              {/* Members list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {sortedMembers.map((member) => {
                  const isCurrentUser = member.userId === currentUserId
                  const isOwner = member.role === 'owner'
                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between px-3 py-2 ${
                        isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isCurrentUser
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                              : 'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}
                        >
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {member.displayName}
                            </span>
                            {isOwner && <Crown className="w-3 h-3 text-amber-500" />}
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatAmount(member.income, household.currency, locale)}
                          </span>
                        </div>
                      </div>
                      {isCurrentUser && (
                        <button
                          onClick={() => setIsEditProfileOpen(true)}
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          aria-label={t.profile.editProfile}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right content - Expenses */}
          <Card className="overflow-hidden mb-16 sm:mb-0">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                <h2 className="font-medium text-sm text-gray-900 dark:text-white">{t.app.expenses}</h2>
              </div>
              {/* Desktop only - mobile uses FAB */}
              <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-1" />
                {t.app.addExpense}
              </Button>
            </div>

            <div className="p-3">
              {expensesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.app.loadingExpenses}</p>
                  </div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">{t.app.noExpenses}</p>
                  <Button onClick={() => setIsAddModalOpen(true)} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    {t.app.addExpense}
                  </Button>
                </div>
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
          </Card>
        </div>
      </main>

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

      {/* Mobile FAB for adding expenses */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95 transition-transform z-20"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label={t.app.addExpense}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
