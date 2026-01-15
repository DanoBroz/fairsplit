import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency: no decimals for CZK, 2 decimals for others
export function formatAmount(amount: number, currency: string, locale: string = 'cs'): string {
  const decimals = currency === 'CZK' ? 0 : 2
  const formatted = amount.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${formatted} ${currency}`
}
