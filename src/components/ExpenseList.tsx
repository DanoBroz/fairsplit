'use client'

import { useState, TouchEvent } from 'react'
import { Filter, Home, User, Users, Trash2, Calendar, Pencil } from 'lucide-react'
import { Expense, HouseholdMember, CategoryKey } from '@/types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { format } from 'date-fns'
import { cs, enUS } from 'date-fns/locale'
import { deleteExpense, updateExpense } from '@/hooks/useExpenses'
import { EditExpenseModal } from './EditExpenseModal'
import { useLanguage } from './LanguageProvider'
import { Translations } from '@/i18n'

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
  onToggleHousehold: (include: boolean) => void
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
  onToggleHousehold,
  t,
  locale,
}: SwipeableCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })

  const buttonCount = (canEdit ? 1 : 0) + (canDelete ? 1 : 0)
  const actionsWidth = buttonCount * 72
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
      // When open, allow dragging right to close (positive offset reduces the negative position)
      visualOffset = Math.min(0, Math.max(-actionsWidth, -actionsWidth + dragOffset))
    } else {
      // When closed, allow dragging left to open (negative offset)
      visualOffset = Math.max(-actionsWidth, Math.min(0, dragOffset))
    }
  }

  // Get translated category name
  const categoryKey = expense.category as CategoryKey
  const translatedCategory = t.categories[categoryKey] || expense.category

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action buttons - positioned on the right */}
      {buttonCount > 0 && (
        <div
          className="absolute inset-y-0 right-0 flex sm:hidden"
          style={{ width: actionsWidth + 16 }}
        >
          {canEdit && (
            <button
              onClick={() => {
                onEdit()
                closeActions()
              }}
              className="flex-1 flex items-center justify-center bg-blue-500 active:bg-blue-600 text-white pl-4"
              aria-label={t.expense.editExpense}
            >
              <Pencil className="w-5 h-5" />
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
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Main card - slides to reveal actions */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${visualOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-base sm:text-lg">{expense.description}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    isHousehold
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {isHousehold ? t.expense.household : t.expense.private}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{getMemberName(expense.paidBy)}{isYours && ` (${t.common.you})`}</span>
                </span>
                <span className="truncate">{translatedCategory}</span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  {format(new Date(expense.date), 'PPP', { locale: dateLocale })}
                </span>
              </div>

              {expense.type === 'private' && isYours && (
                <div className="mt-2">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={expense.includeInHousehold}
                      onChange={(e) => onToggleHousehold(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span>{t.expense.includeInHousehold}</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <div className="text-left sm:text-right">
                <p className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                  {currency} {expense.amount.toLocaleString()}
                </p>
              </div>

              {/* Desktop action buttons - hidden on mobile (use swipe instead) */}
              <div className="hidden sm:flex items-center gap-1">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onEdit}
                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[40px] min-h-[40px]"
                    aria-label={t.expense.editExpense}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[40px] min-h-[40px]"
                    aria-label={t.expense.failedToDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function ExpenseList({ expenses, members, currentUserId, currency, onRefresh }: ExpenseListProps) {
  const { t, locale } = useLanguage()
  const [filter, setFilter] = useState<FilterType>('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.userId === userId)
    return member?.displayName || t.common.unknown
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
        return t.expense.filterHousehold
      case 'yours':
        return t.expense.filterYourPrivate
      default:
        return t.expense.filterAll
    }
  }

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

  const handleToggleHousehold = async (id: string, include: boolean) => {
    try {
      await updateExpense(id, { includeInHousehold: include })
      onRefresh?.()
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
                  {t.expense.allExpenses}
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  onClick={() => {
                    setFilter('household')
                    setShowFilterMenu(false)
                  }}
                >
                  <Home className="w-4 h-4" />
                  {t.expense.householdOnly}
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 rounded-b-lg"
                  onClick={() => {
                    setFilter('yours')
                    setShowFilterMenu(false)
                  }}
                >
                  <User className="w-4 h-4" />
                  {t.expense.yourPrivate}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile swipe hint */}
        <p className="text-xs text-gray-400 sm:hidden">{t.expense.swipeHint}</p>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>{t.expense.noMatch}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const isYours = expense.paidBy === currentUserId
            const isHousehold = expense.type === 'household' || expense.includeInHousehold
            const canEdit = isYours // Only owner can edit
            const canDelete = isYours || isHousehold // Owner or any household member for household expenses

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
                onToggleHousehold={(include) => handleToggleHousehold(expense.id, include)}
                t={t}
                locale={locale}
              />
            )
          })}
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
