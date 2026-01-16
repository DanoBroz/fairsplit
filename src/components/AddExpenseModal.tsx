'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Modal } from './ui/Modal'
import { ExpenseType, CATEGORY_KEYS, CategoryKey } from '@/types'
import { addExpense } from '@/hooks/useExpenses'
import { useLanguage } from './LanguageProvider'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  householdId: string
  currentUserId: string
  currentUserName: string
  onSuccess?: () => void
}

export function AddExpenseModal({
  isOpen,
  onClose,
  householdId,
  currentUserId,
  currentUserName,
  onSuccess,
}: AddExpenseModalProps) {
  const { t } = useLanguage()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ExpenseType>('household')
  const [category, setCategory] = useState<CategoryKey>(CATEGORY_KEYS[0])
  const [includeInHousehold, setIncludeInHousehold] = useState(false)
  const [paidByOwnerOnly, setPaidByOwnerOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    setIsSubmitting(true)
    setError(null)

    try {
      await addExpense({
        householdId,
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        paidBy: currentUserId,
        includeInHousehold: type === 'private' ? includeInHousehold : false,
        paidByOwnerOnly: type === 'private' && includeInHousehold ? paidByOwnerOnly : false,
        date: new Date().toISOString(),
        category,
      })

      resetForm()
      onClose()
      onSuccess?.() // Trigger refetch
    } catch (err: unknown) {
      // Handle Supabase PostgrestError and standard errors
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err)
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setType('household')
    setCategory(CATEGORY_KEYS[0])
    setIncludeInHousehold(false)
    setPaidByOwnerOnly(false)
    setError(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.expense.addExpense}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="amount">{t.expense.amount}</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-bold h-14"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="description">{t.expense.description}</Label>
          <Input
            id="description"
            placeholder={t.expense.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="category">{t.expense.category}</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
            disabled={isSubmitting}
          >
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {t.categories[key]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>{t.expense.type}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'household' ? 'primary' : 'outline'}
              onClick={() => setType('household')}
              disabled={isSubmitting}
            >
              {t.expense.household}
            </Button>
            <Button
              type="button"
              variant={type === 'private' ? 'primary' : 'outline'}
              onClick={() => setType('private')}
              disabled={isSubmitting}
            >
              {t.expense.private}
            </Button>
          </div>
        </div>

        <div>
          <Label>{t.expense.paidBy}</Label>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm">{currentUserName}</span>
          </div>
        </div>

        {type === 'private' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-sm">{t.expense.includeInHousehold}</span>
              <input
                type="checkbox"
                checked={includeInHousehold}
                onChange={(e) => {
                  setIncludeInHousehold(e.target.checked)
                  if (!e.target.checked) setPaidByOwnerOnly(false)
                }}
                className="w-5 h-5 rounded border-gray-300"
                disabled={isSubmitting}
              />
            </div>
            {includeInHousehold && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg ml-4">
                <div>
                  <span className="text-sm">{t.expense.paidByOwnerOnly}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.expense.paidByOwnerOnlyHint}</p>
                </div>
                <input
                  type="checkbox"
                  checked={paidByOwnerOnly}
                  onChange={(e) => setPaidByOwnerOnly(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          <Plus className="w-5 h-5 mr-2" />
          {isSubmitting ? t.expense.adding : t.expense.addExpense}
        </Button>
      </form>
    </Modal>
  )
}
