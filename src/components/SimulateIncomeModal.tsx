'use client'

import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Modal } from './ui/Modal'
import type { HouseholdMember } from '@/types'
import { usePreviewMode } from './PreviewModeProvider'
import { useLanguage } from './LanguageProvider'

interface SimulateIncomeModalProps {
  isOpen: boolean
  onClose: () => void
  member: HouseholdMember | null
  currency: string
}

export function SimulateIncomeModal({ isOpen, onClose, member, currency }: SimulateIncomeModalProps) {
  const { t } = useLanguage()

  if (!member) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.preview.simulateIncomeTitle}>
      <SimulateIncomeForm key={member.id} member={member} currency={currency} onClose={onClose} />
    </Modal>
  )
}

function SimulateIncomeForm({
  member,
  currency,
  onClose,
}: {
  member: HouseholdMember
  currency: string
  onClose: () => void
}) {
  const { t } = useLanguage()
  const { simulateMemberIncome } = usePreviewMode()
  const [income, setIncome] = useState(member.income.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!income) return
    const parsed = parseFloat(income)
    if (Number.isNaN(parsed) || parsed < 0) return
    simulateMemberIncome(member.id, parsed)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {t.preview.simulateIncomeHint.replace('{name}', member.displayName)}
        </p>
      </div>

      <div>
        <Label htmlFor="simulate-income">
          {t.profile.monthlyIncome} ({currency})
        </Label>
        <Input
          id="simulate-income"
          type="number"
          step="1"
          min="0"
          placeholder="0"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="text-xl font-bold h-12"
          required
          autoFocus
        />
      </div>

      <Button type="submit" className="w-full" size="lg">
        {t.preview.applySimulation}
      </Button>
    </form>
  )
}
