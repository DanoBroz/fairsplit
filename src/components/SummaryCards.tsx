'use client'

import { Home, User } from 'lucide-react'
import { Card } from './ui/Card'

interface SummaryCardsProps {
  yourName: string
  partnerName: string
  totalHousehold: number
  yourPrivateTotal: number
  partnerPrivateTotal: number
  yourHouseholdShare: number
  partnerHouseholdShare: number
  yourProportion: number
  partnerProportion: number
  currencySymbol: string
}

export function SummaryCards({
  yourName,
  partnerName,
  totalHousehold,
  yourPrivateTotal,
  partnerPrivateTotal,
  yourHouseholdShare,
  partnerHouseholdShare,
  yourProportion,
  partnerProportion,
  currencySymbol,
}: SummaryCardsProps) {
  // Show summary even with no income set
  const hasExpenses = totalHousehold > 0 || yourPrivateTotal > 0 || partnerPrivateTotal > 0

  if (!hasExpenses) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Total Household */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Home className="w-5 h-5" />
          <span className="font-medium">Total Household Expenses</span>
        </div>
        <p className="text-4xl font-bold">
          {currencySymbol}
          {totalHousehold.toFixed(2)}
        </p>
      </Card>

      {/* Individual contributions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm">{yourName}</span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your share ({(yourProportion * 100).toFixed(0)}%)
              </p>
              <p className="font-bold text-lg">
                {currencySymbol}
                {yourHouseholdShare.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your private expenses</p>
              <p className="font-semibold">
                {currencySymbol}
                {yourPrivateTotal.toFixed(2)}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total you pay</p>
              <p className="font-bold text-xl">
                {currencySymbol}
                {(yourHouseholdShare + yourPrivateTotal).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm">{partnerName}</span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Their share ({(partnerProportion * 100).toFixed(0)}%)
              </p>
              <p className="font-bold text-lg">
                {currencySymbol}
                {partnerHouseholdShare.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Their private expenses</p>
              <p className="font-semibold">
                {currencySymbol}
                {partnerPrivateTotal.toFixed(2)}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total they pay</p>
              <p className="font-bold text-xl">
                {currencySymbol}
                {(partnerHouseholdShare + partnerPrivateTotal).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
