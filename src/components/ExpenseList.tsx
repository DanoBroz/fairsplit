'use client'

import { useState } from 'react'
import { Filter, Home, User, Users, Trash2, Calendar } from 'lucide-react'
import { Expense, HouseholdMember } from '@/types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { format } from 'date-fns'
import { deleteExpense, updateExpense } from '@/hooks/useExpenses'

type FilterType = 'all' | 'household' | 'yours'

interface ExpenseListProps {
  expenses: Expense[]
  members: HouseholdMember[]
  currentUserId: string
  currency: string
}

export function ExpenseList({ expenses, members, currentUserId, currency }: ExpenseListProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.userId === userId)
    return member?.displayName || 'Unknown'
  }

  const filteredExpenses = expenses.filter((expense) => {
    switch (filter) {
      case 'household':
        return expense.type === 'household' || expense.includeInHousehold
      case 'yours':
        return (
          expense.paidBy === currentUserId &&
          expense.type === 'private' &&
          !expense.includeInHousehold
        )
      default:
        return true
    }
  })

  const getFilterLabel = () => {
    switch (filter) {
      case 'household':
        return 'Household'
      case 'yours':
        return 'Your Private'
      default:
        return 'All'
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
    } catch (err) {
      console.error('Failed to delete expense:', err)
    }
  }

  const handleToggleHousehold = async (id: string, include: boolean) => {
    try {
      await updateExpense(id, { includeInHousehold: include })
    } catch (err) {
      console.error('Failed to update expense:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {getFilterLabel()}
          </Button>

          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 rounded-t-lg"
                  onClick={() => {
                    setFilter('all')
                    setShowFilterMenu(false)
                  }}
                >
                  <Users className="w-4 h-4" />
                  All Expenses
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    setFilter('household')
                    setShowFilterMenu(false)
                  }}
                >
                  <Home className="w-4 h-4" />
                  Household Only
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 rounded-b-lg"
                  onClick={() => {
                    setFilter('yours')
                    setShowFilterMenu(false)
                  }}
                >
                  <User className="w-4 h-4" />
                  Your Private
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No expenses match this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const isYours = expense.paidBy === currentUserId
            return (
              <Card key={expense.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{expense.description}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          expense.type === 'household' || expense.includeInHousehold
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {expense.type === 'household' || expense.includeInHousehold
                          ? 'Household'
                          : 'Private'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getMemberName(expense.paidBy)}
                        {isYours && ' (You)'}
                      </span>
                      <span>{expense.category}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {expense.type === 'private' && isYours && (
                      <div className="mt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={expense.includeInHousehold}
                            onChange={(e) => handleToggleHousehold(expense.id, e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          Include in household expenses
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {currency} {expense.amount.toLocaleString()}
                      </p>
                    </div>
                    {isYours && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
