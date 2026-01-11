'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Modal } from './ui/Modal'
import { Expense, ExpenseType, Person, CATEGORIES } from '@/types'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: Expense) => void
  yourName: string
  partnerName: string
  currencySymbol: string
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onAdd,
  yourName,
  partnerName,
  currencySymbol,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ExpenseType>('household')
  const [paidBy, setPaidBy] = useState<Person>('you')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [includeInHousehold, setIncludeInHousehold] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      description: description.trim(),
      type,
      paidBy,
      includeInHousehold: type === 'private' ? includeInHousehold : false,
      date: new Date().toISOString(),
      category,
    }

    onAdd(expense)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setAmount('')
    setDescription('')
    setType('household')
    setPaidBy('you')
    setCategory(CATEGORIES[0])
    setIncludeInHousehold(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="amount">Amount ({currencySymbol})</Label>
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
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            >
              Household
            </Button>
            <Button
              type="button"
              variant={type === 'private' ? 'primary' : 'outline'}
              onClick={() => setType('private')}
            >
              Private
            </Button>
          </div>
        </div>

        <div>
          <Label>Paid by</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={paidBy === 'you' ? 'primary' : 'outline'}
              onClick={() => setPaidBy('you')}
            >
              {yourName}
            </Button>
            <Button
              type="button"
              variant={paidBy === 'partner' ? 'primary' : 'outline'}
              onClick={() => setPaidBy('partner')}
            >
              {partnerName}
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
            />
          </div>
        )}

        <Button type="submit" className="w-full" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Expense
        </Button>
      </form>
    </Modal>
  )
}
