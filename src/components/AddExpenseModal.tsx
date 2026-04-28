'use client'

import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Modal } from './ui/Modal'
import { ExpenseType, CATEGORY_KEYS, CategoryKey } from '@/types'
import { useLanguage } from './LanguageProvider'
import { usePreviewMode } from './PreviewModeProvider'

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
  const { addExpense } = usePreviewMode()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ExpenseType>('household')
  const [category, setCategory] = useState<CategoryKey>(CATEGORY_KEYS[0])
  const [includeInHousehold, setIncludeInHousehold] = useState(false)
  const [paidByOwnerOnly, setPaidByOwnerOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitAsTemporaryRef = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return

    setIsSubmitting(true)
    setError(null)

    const isTemporary = submitAsTemporaryRef.current
    submitAsTemporaryRef.current = false

    try {
      await addExpense({
        householdId,
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        paidBy: currentUserId,
        includeInHousehold: type === 'private' ? includeInHousehold : false,
        paidByOwnerOnly: type === 'private' && includeInHousehold ? paidByOwnerOnly : false,
        isTemporary,
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

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            onMouseDown={() => { submitAsTemporaryRef.current = true }}
            onTouchStart={() => { submitAsTemporaryRef.current = true }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') submitAsTemporaryRef.current = true
            }}
            className="gap-2 px-3 py-3 text-sm whitespace-nowrap border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/40"
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>{t.expense.addTemporary}</span>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2 px-3 py-3 text-sm whitespace-nowrap">
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>{isSubmitting ? t.expense.adding : t.expense.addExpense}</span>
          </Button>
        </div>
      </form>
    </Modal>
  )
}
