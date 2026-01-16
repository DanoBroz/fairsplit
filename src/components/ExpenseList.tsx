'use client'

import { useState, TouchEvent, useMemo } from 'react'
import {
  Filter,
  Home,
  User,
  Users,
  Trash2,
  Pencil,
  ShoppingCart,
  Zap,
  Car,
  Film,
  UtensilsCrossed,
  Heart,
  Sparkles,
  Shirt,
  CreditCard,
  Gift,
  MoreHorizontal,
} from 'lucide-react'
import { Expense, HouseholdMember, CategoryKey } from '@/types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { cs, enUS } from 'date-fns/locale'
import { deleteExpense } from '@/hooks/useExpenses'
import { EditExpenseModal } from './EditExpenseModal'
import { useLanguage } from './LanguageProvider'
import { Translations } from '@/i18n'
import { formatAmount } from '@/lib/utils'

// Category icon mapping
const categoryIcons: Record<string, typeof Home> = {
  groceries: ShoppingCart,
  utilities: Zap,
  rentMortgage: Home,
  transportation: Car,
  entertainment: Film,
  diningOut: UtensilsCrossed,
  healthcare: Heart,
  personalCare: Sparkles,
  clothing: Shirt,
  subscriptions: CreditCard,
  gifts: Gift,
  other: MoreHorizontal,
}

type FilterType = 'all' | 'household' | 'yours'

interface ExpenseListProps {
  expenses: Expense[]
  members: HouseholdMember[]
  currentUserId: string
  currency: string
  onRefresh?: () => void
}

interface SwipeableCardProps {
  expense: Expense
  isYours: boolean
  isHousehold: boolean
  canEdit: boolean
  canDelete: boolean
  currency: string
  getMemberName: (userId: string) => string
  onEdit: () => void
  onDelete: () => void
  t: Translations
  locale: string
}

function SwipeableCard({
  expense,
  isYours,
  isHousehold,
  canEdit,
  canDelete,
  currency,
  getMemberName,
  onEdit,
  onDelete,
  t,
  locale,
}: SwipeableCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })

  const buttonCount = (canEdit ? 1 : 0) + (canDelete ? 1 : 0)
  const actionsWidth = buttonCount * 60
  const dateLocale = locale === 'cs' ? cs : enUS

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    setIsDragging(false)
    setDragOffset(0)
  }

  const handleTouchMove = (e: TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStart.x
    const deltaY = Math.abs(e.touches[0].clientY - touchStart.y)

    // Ignore if scrolling vertically
    if (deltaY > Math.abs(deltaX) && !isDragging) return

    setIsDragging(true)
    setDragOffset(deltaX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) {
      // It was a tap, not a swipe - close if open
      if (isOpen) {
        setIsOpen(false)
      }
      return
    }

    setIsDragging(false)

    if (isOpen) {
      // If open, swipe right (positive) to close, or stay open
      if (dragOffset > 50) {
        setIsOpen(false)
      }
    } else {
      // If closed, swipe left (negative) to open
      if (dragOffset < -50) {
        setIsOpen(true)
      }
    }
    setDragOffset(0)
  }

  const closeActions = () => {
    setIsOpen(false)
    setDragOffset(0)
  }

  // Calculate the visual offset
  let visualOffset = isOpen ? -actionsWidth : 0
  if (isDragging) {
    if (isOpen) {
      visualOffset = Math.min(0, Math.max(-actionsWidth, -actionsWidth + dragOffset))
    } else {
      visualOffset = Math.max(-actionsWidth, Math.min(0, dragOffset))
    }
  }

  // Get translated category name and icon
  const categoryKey = expense.category as CategoryKey
  const translatedCategory = t.categories[categoryKey] || expense.category
  const CategoryIcon = categoryIcons[expense.category] || MoreHorizontal

  return (
    <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800">
      {/* Action buttons - positioned on the right */}
      {buttonCount > 0 && (
        <div
          className="absolute inset-y-0 right-0 flex sm:hidden"
          style={{ width: actionsWidth }}
        >
          {canEdit && (
            <button
              onClick={() => {
                onEdit()
                closeActions()
              }}
              className="flex-1 flex items-center justify-center bg-blue-500 active:bg-blue-600 text-white"
              aria-label={t.expense.editExpense}
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                onDelete()
                closeActions()
              }}
              className="flex-1 flex items-center justify-center bg-red-500 active:bg-red-600 text-white"
              aria-label={t.expense.failedToDelete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main card - slides to reveal actions */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white dark:bg-gray-800"
        style={{
          transform: `translateX(${visualOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Category icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isHousehold
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-gray-100 dark:bg-gray-700/50'
          }`}>
            <CategoryIcon className={`w-5 h-5 ${
              isHousehold
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate leading-tight">
              {expense.description}
            </h3>

            {/* Metadata - simplified */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {getMemberName(expense.paidBy)}{isYours ? ` (${t.common.you})` : ''} · {translatedCategory}
            </p>
          </div>

          {/* Amount and badges */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1.5">
              {/* Badge for paidByOwnerOnly - shows when expense is in household but only owner pays */}
              {expense.includeInHousehold && expense.paidByOwnerOnly && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <User className="w-2.5 h-2.5" />
                </span>
              )}
              <p className={`text-sm font-semibold tabular-nums ${
                isHousehold ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              }`}>
                {formatAmount(expense.amount, currency, locale)}
              </p>
            </div>

            {/* Desktop action buttons */}
            <div className="hidden sm:flex items-center gap-0.5 mt-0.5">
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  aria-label={t.expense.editExpense}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label={t.expense.failedToDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper to format date header
function formatDateHeader(dateStr: string, locale: string): string {
  const date = parseISO(dateStr)
  const dateLocale = locale === 'cs' ? cs : enUS

  if (isToday(date)) {
    return locale === 'cs' ? 'Dnes' : 'Today'
  }
  if (isYesterday(date)) {
    return locale === 'cs' ? 'Včera' : 'Yesterday'
  }
  return format(date, 'd. MMMM yyyy', { locale: dateLocale })
}

// Group expenses by date
function groupExpensesByDate(expenses: Expense[]): Map<string, Expense[]> {
  const groups = new Map<string, Expense[]>()

  // Sort expenses by date (newest first)
  const sorted = [...expenses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  for (const expense of sorted) {
    const dateKey = expense.date.split('T')[0] // Get just the date part
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(expense)
  }

  return groups
}

type SumType = 'all' | 'household' | 'private'

export function ExpenseList({ expenses, members, currentUserId, currency, onRefresh }: ExpenseListProps) {
  const { t, locale } = useLanguage()
  const [filter, setFilter] = useState<FilterType>('all')
  const [sumType, setSumType] = useState<SumType>('all')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.userId === userId)
    return member?.displayName || t.common.unknown
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
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
  }, [expenses, filter, currentUserId])

  // Group filtered expenses by date
  const groupedExpenses = useMemo(() =>
    groupExpensesByDate(filteredExpenses),
    [filteredExpenses]
  )

  // Calculate sums for all, household, and private expenses
  const sums = useMemo(() => {
    const allTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
    const householdTotal = expenses
      .filter(e => e.type === 'household' || e.includeInHousehold)
      .reduce((sum, e) => sum + e.amount, 0)
    const privateTotal = expenses
      .filter(e => e.paidBy === currentUserId && e.type === 'private' && !e.includeInHousehold)
      .reduce((sum, e) => sum + e.amount, 0)
    return { all: allTotal, household: householdTotal, private: privateTotal }
  }, [expenses, currentUserId])

  // Cycle through sum types
  const cycleSumType = () => {
    setSumType(current => {
      if (current === 'all') return 'household'
      if (current === 'household') return 'private'
      return 'all'
    })
  }

  // Get label for current sum type
  const sumLabel = sumType === 'all'
    ? t.expense.filterAll
    : sumType === 'household'
      ? t.expense.household
      : t.expense.private

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      onRefresh?.()
    } catch (err: unknown) {
      console.error('Failed to delete expense:', err)
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert(`${t.expense.failedToDelete}: ${message}`)
    }
  }


  return (
    <div className="space-y-2">
      {/* Filter tabs - larger touch targets on mobile */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex-1 sm:flex-initial">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 active:bg-white/50 dark:active:bg-gray-700/50'
            }`}
          >
            <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span>{t.expense.filterAll}</span>
          </button>
          <button
            onClick={() => setFilter('household')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'household'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 active:bg-white/50 dark:active:bg-gray-700/50'
            }`}
          >
            <Home className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{t.expense.filterHousehold}</span>
            <span className="sm:hidden">{t.expense.household}</span>
          </button>
          <button
            onClick={() => setFilter('yours')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === 'yours'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 active:bg-white/50 dark:active:bg-gray-700/50'
            }`}
          >
            <User className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{t.expense.filterYourPrivate}</span>
            <span className="sm:hidden">{t.expense.private}</span>
          </button>
        </div>

        {/* Total sum - desktop only */}
        {expenses.length > 0 && (
          <button
            onClick={cycleSumType}
            className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 px-2 py-1 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {sumType === 'household' ? (
                <Home className="w-3.5 h-3.5 text-blue-500" />
              ) : sumType === 'private' ? (
                <User className="w-3.5 h-3.5 text-purple-500" />
              ) : (
                <Users className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className={`text-sm font-semibold tabular-nums ${
                sumType === 'household'
                  ? 'text-blue-600 dark:text-blue-400'
                  : sumType === 'private'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-900 dark:text-white'
              }`}>
                {formatAmount(sums[sumType], currency, locale)}
              </span>
            </div>
            {/* Dots indicator */}
            <div className="flex items-center gap-1">
              <div className={`w-1 h-1 rounded-full ${sumType === 'all' ? 'bg-gray-600 dark:bg-gray-300' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <div className={`w-1 h-1 rounded-full ${sumType === 'household' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <div className={`w-1 h-1 rounded-full ${sumType === 'private' ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            </div>
          </button>
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-6 text-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.expense.noMatch}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(groupedExpenses.entries()).map(([dateKey, dateExpenses], groupIndex) => (
            <div key={dateKey}>
              {/* Date header - simple */}
              <div className="flex items-center gap-2 px-1 mb-1.5">
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {formatDateHeader(dateKey, locale)}
                </span>
              </div>

              {/* Expenses for this date */}
              <div className="space-y-1.5">
                {dateExpenses.map((expense) => {
                  const isYours = expense.paidBy === currentUserId
                  const isHousehold = expense.type === 'household' || expense.includeInHousehold
                  const canEdit = isYours
                  const canDelete = isYours || isHousehold

                  return (
                    <SwipeableCard
                      key={expense.id}
                      expense={expense}
                      isYours={isYours}
                      isHousehold={isHousehold}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      currency={currency}
                      getMemberName={getMemberName}
                      onEdit={() => setEditingExpense(expense)}
                      onDelete={() => handleDelete(expense.id)}
                      t={t}
                      locale={locale}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <EditExpenseModal
        isOpen={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        onSuccess={onRefresh}
      />
    </div>
  )
}
