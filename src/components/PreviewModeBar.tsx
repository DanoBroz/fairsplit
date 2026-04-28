'use client'

import { useState } from 'react'
import { Save, X, FlaskConical, AlertTriangle } from 'lucide-react'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { usePreviewMode } from './PreviewModeProvider'
import { useLanguage } from './LanguageProvider'

export function PreviewModeBar() {
  const {
    isActive,
    pendingChangeCount,
    simulatedIncomeCount,
    isSaving,
    saveError,
    save,
    discard,
  } = usePreviewMode()
  const { t } = useLanguage()
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  if (!isActive) return null

  const totalActivity = pendingChangeCount + simulatedIncomeCount

  const onDiscardClick = () => {
    if (totalActivity === 0) {
      discard()
      return
    }
    setConfirmDiscardOpen(true)
  }

  const onConfirmDiscard = () => {
    setConfirmDiscardOpen(false)
    discard()
  }

  return (
    <>
      <div
        className="fixed bottom-0 inset-x-0 z-40 border-t-2 border-amber-300 dark:border-amber-700 bg-amber-50/95 dark:bg-amber-950/80 backdrop-blur-md shadow-2xl shadow-amber-500/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <FlaskConical className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 truncate">
                {t.preview.label}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300/80 truncate">
                {pendingChangeCount === 0 && simulatedIncomeCount === 0
                  ? t.preview.noChangesYet
                  : [
                      pendingChangeCount > 0
                        ? t.preview.pendingCount.replace('{n}', String(pendingChangeCount))
                        : null,
                      simulatedIncomeCount > 0
                        ? t.preview.simulatedCount.replace('{n}', String(simulatedIncomeCount))
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
              </div>
              {saveError && (
                <div className="text-xs text-red-700 dark:text-red-400 truncate">{saveError}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscardClick}
              disabled={isSaving}
              className="border-amber-300 dark:border-amber-700"
            >
              <X className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">{t.preview.discard}</span>
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={isSaving || pendingChangeCount === 0}
            >
              <Save className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">
                {isSaving ? t.preview.saving : t.preview.save}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        title={t.preview.discardConfirmTitle}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t.preview.discardConfirmMessage}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDiscardOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="secondary" onClick={onConfirmDiscard}>
              {t.preview.discard}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
