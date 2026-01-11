'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Modal } from './ui/Modal'
import { ExpenseType, CATEGORIES } from '@/types'
import { addExpense } from '@/hooks/useExpenses'

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
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ExpenseType>('household')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [includeInHousehold, setIncludeInHousehold] = useState(false)
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
        date: new Date().toISOString(),
        category,
      })

      resetForm()
      onClose()
      onSuccess?.() // Trigger refetch
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setType('household')
    setCategory(CATEGORIES[0])
    setIncludeInHousehold(false)
    setError(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="amount">Amount</Label>
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
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
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

        <div>
          <Label>Paid by</Label>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span className="text-sm">{currentUserName}</span>
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
          <Plus className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </Button>
      </form>
    </Modal>
  )
}
