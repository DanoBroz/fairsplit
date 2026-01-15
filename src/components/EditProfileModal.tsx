'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Modal } from './ui/Modal'
import { HouseholdMember } from '@/types'
import { updateMember } from '@/hooks/useHousehold'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  member: HouseholdMember | null
  currency: string
  onSuccess?: () => void
}

export function EditProfileModal({
  isOpen,
  onClose,
  member,
  currency,
  onSuccess,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [income, setIncome] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when member changes
  useEffect(() => {
    if (member) {
      setDisplayName(member.displayName)
      setIncome(member.income.toString())
      setError(null)
    }
  }, [member])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim() || !income || !member) return

    setIsSubmitting(true)
    setError(null)

    try {
      await updateMember(member.id, {
        displayName: displayName.trim(),
        income: parseFloat(income),
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="edit-name">Display Name</Label>
          <Input
            id="edit-name"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is how you appear to other household members
          </p>
        </div>

        <div>
          <Label htmlFor="edit-income">Monthly Income ({currency})</Label>
          <Input
            id="edit-income"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="text-xl font-bold h-12"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Used to calculate fair expense splits
          </p>
        </div>

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
