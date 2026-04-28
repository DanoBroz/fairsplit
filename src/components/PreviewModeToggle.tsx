'use client'

import { FlaskConical } from 'lucide-react'
import { Button } from './ui/Button'
import { usePreviewMode } from './PreviewModeProvider'
import { useLanguage } from './LanguageProvider'

export function PreviewModeToggle() {
  const { isActive, enter } = usePreviewMode()
  const { t } = useLanguage()

  if (isActive) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60"
        aria-live="polite"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.preview.label}</span>
      </span>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={enter}
      className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 p-2"
      aria-label={t.preview.enter}
      title={t.preview.enter}
    >
      <FlaskConical className="w-4 h-4" />
      <span className="hidden md:inline ml-1.5 text-sm">{t.preview.enter}</span>
    </Button>
  )
}
