'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Modal } from './ui/Modal'
import { Expense, ExpenseType, CATEGORIES } from '@/types'
import { updateExpense } from '@/hooks/useExpenses'

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
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ExpenseType>('household')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [includeInHousehold, setIncludeInHousehold] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when expense changes
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString())
      setDescription(expense.description)
      setType(expense.type)
      setCategory(expense.category)
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Expense">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="edit-amount">Amount</Label>
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
          <Label htmlFor="edit-description">Description</Label>
          <Input
            id="edit-description"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="edit-category">Category</Label>
          <Select
            id="edit-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isSubmitting}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'household' ? 'primary' : 'outline'}
              onClick={() => setType('household')}
              disabled={isSubmitting}
            >
              Household
            </Button>
            <Button
              type="button"
              variant={type === 'private' ? 'primary' : 'outline'}
              onClick={() => setType('private')}
              disabled={isSubmitting}
            >
              Private
            </Button>
          </div>
        </div>

        {type === 'private' && (
          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm">Include in household expenses?</span>
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
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Modal>
  )
}
