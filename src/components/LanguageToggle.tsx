'use client'

import { useLanguage } from './LanguageProvider'
import { Button } from './ui/Button'

function CzechFlag() {
  return (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480" aria-hidden="true">
      <path fill="#fff" d="M0 0h640v240H0z" />
      <path fill="#d7141a" d="M0 240h640v240H0z" />
      <path fill="#11457e" d="M0 0l320 240L0 480z" />
    </svg>
  )
}

function EnglishFlag() {
  return (
    <svg className="w-5 h-4 rounded-sm" viewBox="0 0 640 480" aria-hidden="true">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" />
      <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" />
      <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
      <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" />
    </svg>
  )
}

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'cs' : 'en')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="gap-1.5 px-2"
      aria-label={locale === 'en' ? 'Přepnout na češtinu' : 'Switch to English'}
    >
      {locale === 'cs' ? <CzechFlag /> : <EnglishFlag />}
      <span className="text-sm font-medium">{locale.toUpperCase()}</span>
    </Button>
  )
}
