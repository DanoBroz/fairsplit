'use client'

import { Home, User } from 'lucide-react'
import { Card } from './ui/Card'
import { Expense, HouseholdMember } from '@/types'
import { useLanguage } from './LanguageProvider'

interface SummaryCardsProps {
  expenses: Expense[]
  members: HouseholdMember[]
  currentUserId: string
  currency: string
}

export function SummaryCards({ expenses, members, currentUserId, currency }: SummaryCardsProps) {
  const { t } = useLanguage()

  // Calculate total household expenses
  const householdExpenses = expenses.filter(
    (e) => e.type === 'household' || e.includeInHousehold
  )
  const totalHousehold = householdExpenses.reduce((sum, e) => sum + e.amount, 0)

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

    // Calculate household share
    const householdShare = totalHousehold * proportion

    // Total they should pay
    const total = householdShare + privateTotal

    return {
      member,
      proportion,
      privateTotal,
      householdShare,
      total,
      isCurrentUser: member.userId === currentUserId,
    }
  })

  const hasExpenses = totalHousehold > 0 || memberSplits.some((m) => m.privateTotal > 0)

  if (!hasExpenses) {
    return null
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Total Household */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Home className="w-5 h-5" />
          <span className="font-medium">{t.summary.totalHouseholdExpenses}</span>
        </div>
        <p className="text-4xl font-bold">
          {currency} {totalHousehold.toLocaleString()}
        </p>
      </Card>

      {/* Individual contributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memberSplits.map((split, index) => (
          <Card key={split.member.id} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-blue-500' : 'bg-purple-500'
                }`}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">
                {split.member.displayName}
                {split.isCurrentUser && ` (${t.common.you})`}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t.summary.householdShare} ({(split.proportion * 100).toFixed(0)}%)
                </p>
                <p className="font-bold text-lg">
                  {currency} {split.householdShare.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.summary.privateExpenses}</p>
                <p className="font-semibold">
                  {currency} {split.privateTotal.toLocaleString()}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {t.summary.totalToPay}
                </p>
                <p className="font-bold text-xl">
                  {currency} {split.total.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
