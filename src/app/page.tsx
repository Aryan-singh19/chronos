'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/stores'
import { SplashScreen } from '@/components/ui/SplashScreen'

export default function RootPage() {
  const router = useRouter()
  const { initialize, isInitialized, settings } = useAppStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isInitialized || !settings) return
    if (settings.onboardingComplete) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [isInitialized, settings, router])

  return <SplashScreen />
}
