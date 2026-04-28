import { Expense, HouseholdMember } from '@/types'

export interface MemberSplit {
  member: HouseholdMember
  proportion: number
  proportionalShare: number
  ownerOnlyTotal: number
  privateTotal: number
  householdTotal: number
  total: number
}

export function calculateMemberSplits(
  expenses: Expense[],
  members: HouseholdMember[]
): MemberSplit[] {
  const sharedHouseholdExpenses = expenses.filter(
    (e) => e.type === 'household' || (e.includeInHousehold && !e.paidByOwnerOnly)
  )
  const totalSharedHousehold = sharedHouseholdExpenses.reduce((sum, e) => sum + e.amount, 0)

  const totalIncome = members.reduce((sum, m) => sum + m.income, 0)
  const hasIncome = totalIncome > 0

  return members.map((member) => {
    const proportion = hasIncome ? member.income / totalIncome : 1 / members.length

    const privateTotal = expenses
      .filter((e) => e.paidBy === member.userId && e.type === 'private' && !e.includeInHousehold)
      .reduce((sum, e) => sum + e.amount, 0)

    const ownerOnlyTotal = expenses
      .filter((e) => e.paidBy === member.userId && e.includeInHousehold && e.paidByOwnerOnly)
      .reduce((sum, e) => sum + e.amount, 0)

    const proportionalShare = totalSharedHousehold * proportion
    const householdTotal = proportionalShare + ownerOnlyTotal
    const total = householdTotal + privateTotal

    return {
      member,
      proportion,
      proportionalShare,
      ownerOnlyTotal,
      privateTotal,
      householdTotal,
      total,
    }
  })
}
