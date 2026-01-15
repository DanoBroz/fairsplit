'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Modal } from './ui/Modal'
import { Expense, ExpenseType, CATEGORY_KEYS, CategoryKey } from '@/types'
import { updateExpense } from '@/hooks/useExpenses'
import { useLanguage } from './LanguageProvider'

interface EditExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  expense: Expense | null
  onSuccess?: () => void
}

export function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  onSuccess,
}: EditExpenseModalProps) {
  const { t } = useLanguage()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ExpenseType>('household')
  const [category, setCategory] = useState<CategoryKey>(CATEGORY_KEYS[0])
  const [includeInHousehold, setIncludeInHousehold] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when expense changes
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString())
      setDescription(expense.description)
      setType(expense.type)
      setCategory(expense.category as CategoryKey)
      setIncludeInHousehold(expense.includeInHousehold)
      setError(null)
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !expense) return

    setIsSubmitting(true)
    setError(null)

    try {
      await updateExpense(expense.id, {
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        category,
        includeInHousehold: type === 'private' ? includeInHousehold : false,
      })

      onClose()
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.expense.editExpense}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="edit-amount">{t.expense.amount}</Label>
          <Input
            id="edit-amount"
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
          <Label htmlFor="edit-description">{t.expense.description}</Label>
          <Input
            id="edit-description"
            placeholder={t.expense.descriptionPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="edit-category">{t.expense.category}</Label>
          <Select
            id="edit-category"
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

        {type === 'private' && (
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm">{t.expense.includeInHousehold}</span>
            <input
              type="checkbox"
              checked={includeInHousehold}
              onChange={(e) => setIncludeInHousehold(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
              disabled={isSubmitting}
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          <Save className="w-5 h-5 mr-2" />
          {isSubmitting ? t.expense.saving : t.expense.saveChanges}
        </Button>
      </form>
    </Modal>
  )
}
