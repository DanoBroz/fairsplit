'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function Home() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user has a household
      const { data: membership } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        router.push('/onboarding')
      } else {
        router.push('/app')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center gap-2">
        <Heart className="w-8 h-8 text-blue-600 fill-blue-600 animate-pulse" />
        <p className="text-xl">{t.common.loading}</p>
      </div>
    </div>
  )
}
