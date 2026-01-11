'use client'

import { useState } from 'react'
import { Heart, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useExpenseStore, getCurrencySymbol } from '@/lib/useExpenseStore'
import { IncomeSetup } from '@/components/IncomeSetup'
import { SummaryCards } from '@/components/SummaryCards'
import { ExpenseList } from '@/components/ExpenseList'
import { AddExpenseModal } from '@/components/AddExpenseModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const store = useExpenseStore()

  const handleSaveIncome = (
    income: { you: number; partner: number },
    yourName: string,
    partnerName: string,
    currency: 'CZK' | 'EUR' | 'USD' | 'GBP' | 'PLN'
  ) => {
    store.setIncome(income)
    store.setNames(yourName, partnerName)
    store.setCurrency(currency)
  }

  const handleToggleHousehold = (id: string, include: boolean) => {
    store.updateExpense(id, { includeInHousehold: include })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <div className="flex items-center justify-center gap-2">
            <Heart className="w-6 h-6 text-blue-600 fill-blue-600" />
            <h1 className="text-xl font-bold">FairSplit</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
        {/* Income Setup */}
        <IncomeSetup
          income={store.income}
          yourName={store.yourName}
          partnerName={store.partnerName}
          currency={store.currency}
          onSave={handleSaveIncome}
        />

        {/* Summary Cards */}
        <SummaryCards
          yourName={store.yourName}
          partnerName={store.partnerName}
          totalHousehold={store.totalHousehold}
          yourPrivateTotal={store.yourPrivateTotal}
          partnerPrivateTotal={store.partnerPrivateTotal}
          yourHouseholdShare={store.yourHouseholdShare}
          partnerHouseholdShare={store.partnerHouseholdShare}
          yourProportion={store.yourProportion}
          partnerProportion={store.partnerProportion}
          currencySymbol={getCurrencySymbol(store.currency)}
        />

        {/* Expense List */}
        <ExpenseList
          expenses={store.expenses}
          yourName={store.yourName}
          partnerName={store.partnerName}
          currencySymbol={getCurrencySymbol(store.currency)}
          onDelete={store.removeExpense}
          onToggleHousehold={handleToggleHousehold}
        />
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={store.addExpense}
        yourName={store.yourName}
        partnerName={store.partnerName}
        currencySymbol={getCurrencySymbol(store.currency)}
      />
    </div>
  )
}
