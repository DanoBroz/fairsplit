'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useLanguage } from './LanguageProvider'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useLanguage()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />
    }
    return resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
  }

  const getLabel = () => {
    if (theme === 'system') return t.theme.system
    return theme === 'dark' ? t.theme.dark : t.theme.light
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="gap-2"
      aria-label={`${t.theme.currentTheme}: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline text-sm">{getLabel()}</span>
    </Button>
  )
}
