'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Locale, Translations } from '@/i18n'
import { en } from '@/i18n/en'
import { cs } from '@/i18n/cs'

const translations: Record<Locale, Translations> = { en, cs }

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('cs')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null
    const initialLocale = stored || 'cs'
    setLocaleState(initialLocale)
    document.documentElement.lang = initialLocale
    setMounted(true)
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const value = {
    locale,
    setLocale,
    t: translations[mounted ? locale : 'cs'],
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
