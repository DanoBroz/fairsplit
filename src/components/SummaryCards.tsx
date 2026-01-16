'use client'

import { Home, User } from 'lucide-react'
import { Card } from './ui/Card'
import { Expense, HouseholdMember } from '@/types'
import { useLanguage } from './LanguageProvider'
import { formatAmount } from '@/lib/utils'

interface SummaryCardsProps {
  expenses: Expense[]
  members: HouseholdMember[]
  currentUserId: string
  currency: string
}

export function SummaryCards({ expenses, members, currentUserId, currency }: SummaryCardsProps) {
  const { t, locale } = useLanguage()

  // Calculate total household expenses (for display)
  const householdExpenses = expenses.filter(
    (e) => e.type === 'household' || e.includeInHousehold
  )
  const totalHousehold = householdExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Calculate shared household pool (expenses split proportionally)
  // Excludes paidByOwnerOnly expenses - those are paid only by the owner
  const sharedHouseholdExpenses = expenses.filter(
    (e) => e.type === 'household' || (e.includeInHousehold && !e.paidByOwnerOnly)
  )
  const totalSharedHousehold = sharedHouseholdExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Calculate total income
  const totalIncome = members.reduce((sum, m) => sum + m.income, 0)

  // If no income set, distribute equally
  const hasIncome = totalIncome > 0

  // Calculate splits for each member
  const memberSplits = members.map((member) => {
    // Calculate proportion based on income
    const proportion = hasIncome ? member.income / totalIncome : 1 / members.length

    // Calculate private expenses (only for that user, not included in household)
    const privateExpenses = expenses.filter(
      (e) => e.paidBy === member.userId && e.type === 'private' && !e.includeInHousehold
    )
    const privateTotal = privateExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Calculate paidByOwnerOnly expenses for this member (in household but only they pay)
    const ownerOnlyExpenses = expenses.filter(
      (e) => e.paidBy === member.userId && e.includeInHousehold && e.paidByOwnerOnly
    )
    const ownerOnlyTotal = ownerOnlyExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Proportional share of shared expenses only (for display)
    const proportionalShare = totalSharedHousehold * proportion

    // Household total = proportional share + their owner-only expenses
    const householdTotal = proportionalShare + ownerOnlyTotal

    // Total they should pay (includes private expenses)
    const total = householdTotal + privateTotal

    return {
      member,
      proportion,
      proportionalShare,
      ownerOnlyTotal,
      privateTotal,
      householdTotal,
      total,
      isCurrentUser: member.userId === currentUserId,
    }
  })

  const hasExpenses = totalHousehold > 0 || memberSplits.some((m) => m.privateTotal > 0)

  if (!hasExpenses) {
    return null
  }

  // Sort so current user is first
  const sortedSplits = [...memberSplits].sort((a, b) => {
    if (a.isCurrentUser) return -1
    if (b.isCurrentUser) return 1
    return 0
  })

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
      {/* Total Household - header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Home className="w-4 h-4 opacity-80" />
          <span className="text-xs font-medium opacity-90">{t.summary.totalHouseholdExpenses}</span>
        </div>
        <p className="text-lg font-bold">
          {formatAmount(totalHousehold, currency, locale)}
        </p>
      </div>

      {/* Individual contributions - always stacked */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sortedSplits.map((split) => (
          <div
            key={split.member.id}
            className={`px-3 py-2.5 ${
              split.isCurrentUser ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left: Avatar + Name + Percentage */}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    split.isCurrentUser
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-purple-500 to-purple-600'
                  }`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {split.member.displayName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        split.isCurrentUser
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}
                    >
                      {(split.proportion * 100).toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t.summary.householdShare}: {formatAmount(split.proportionalShare, currency, locale)}
                  </span>
                </div>
              </div>

              {/* Right: Total amount */}
              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
                  {t.summary.totalToPay}
                </span>
                <span
                  className={`text-base font-bold ${
                    split.isCurrentUser
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {formatAmount(
                    split.isCurrentUser ? split.total : split.householdTotal,
                    currency,
                    locale
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
