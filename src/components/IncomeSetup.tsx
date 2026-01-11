'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Users } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Select } from './ui/Select'
import { Card } from './ui/Card'
import { Income, CURRENCIES, CurrencyCode } from '@/types'
import { getCurrencySymbol } from '@/lib/useExpenseStore'

interface IncomeSetupProps {
  income: Income
  yourName: string
  partnerName: string
  currency: CurrencyCode
  onSave: (income: Income, yourName: string, partnerName: string, currency: CurrencyCode) => void
}

export function IncomeSetup({ income, yourName, partnerName, currency, onSave }: IncomeSetupProps) {
  const [yourIncome, setYourIncome] = useState(income.you.toString())
  const [partnerIncome, setPartnerIncome] = useState(income.partner.toString())
  const [yourNameInput, setYourNameInput] = useState(yourName)
  const [partnerNameInput, setPartnerNameInput] = useState(partnerName)
  const [currencyInput, setCurrencyInput] = useState<CurrencyCode>(currency)
  const [isEditing, setIsEditing] = useState(income.you === 0 && income.partner === 0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setYourIncome(income.you.toString())
    setPartnerIncome(income.partner.toString())
    setYourNameInput(yourName)
    setPartnerNameInput(partnerName)
    setCurrencyInput(currency)
  }, [income, yourName, partnerName, currency])

  const handleSave = () => {
    onSave(
      {
        you: parseFloat(yourIncome) || 0,
        partner: parseFloat(partnerIncome) || 0,
      },
      yourNameInput || 'You',
      partnerNameInput || 'Partner',
      currencyInput
    )
    setIsEditing(false)
  }

  const currencySymbol = getCurrencySymbol(currencyInput)
  const totalIncome = (parseFloat(yourIncome) || 0) + (parseFloat(partnerIncome) || 0)
  const yourPct = totalIncome > 0 ? ((parseFloat(yourIncome) || 0) / totalIncome) * 100 : 50
  const partnerPct = 100 - yourPct

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold">Setup Income Split</h3>
        </div>
      </Card>
    )
  }

  if (!isEditing && income.you > 0 && income.partner > 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold">Income Split</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>

        <div className="space-y-3">
          <div className="h-3 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-800">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{ width: `${yourPct}%` }}
            />
            <div
              className="bg-purple-500 transition-all duration-500"
              style={{ width: `${partnerPct}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>
                {yourName}: {yourPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>
                {partnerName}: {partnerPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold">Setup Income Split</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Enter your monthly incomes to calculate the fair household expense split.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="yourName">Your Name</Label>
            <Input
              id="yourName"
              placeholder="You"
              value={yourNameInput}
              onChange={(e) => setYourNameInput(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="partnerName">Partner&apos;s Name</Label>
            <Input
              id="partnerName"
              placeholder="Partner"
              value={partnerNameInput}
              onChange={(e) => setPartnerNameInput(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="yourIncome">
              {yourNameInput || 'Your'}&apos;s Income ({currencySymbol})
            </Label>
            <Input
              id="yourIncome"
              type="number"
              placeholder="0"
              value={yourIncome}
              onChange={(e) => setYourIncome(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="partnerIncome">
              {partnerNameInput || 'Partner'}&apos;s Income ({currencySymbol})
            </Label>
            <Input
              id="partnerIncome"
              type="number"
              placeholder="0"
              value={partnerIncome}
              onChange={(e) => setPartnerIncome(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            value={currencyInput}
            onChange={(e) => setCurrencyInput(e.target.value as CurrencyCode)}
          >
            {CURRENCIES.map((cur) => (
              <option key={cur.code} value={cur.code}>
                {cur.symbol} {cur.name} ({cur.code})
              </option>
            ))}
          </Select>
        </div>

        {totalIncome > 0 && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview split:</p>
            <div className="h-2 rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-blue-500 transition-all duration-300"
                style={{ width: `${yourPct}%` }}
              />
              <div
                className="bg-purple-500 transition-all duration-300"
                style={{ width: `${partnerPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span>{yourPct.toFixed(0)}%</span>
              <span>{partnerPct.toFixed(0)}%</span>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Save Income Settings
        </Button>
      </div>
    </Card>
  )
}
