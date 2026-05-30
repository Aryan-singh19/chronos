import { useEffect, useRef } from 'react'
import { useTimelineStore, useAppStore } from '@/stores'
import toast from 'react-hot-toast'

export function useAutoSave() {
  const { isDirty, activeTimelineId, timelines, updateTimeline } = useTimelineStore()
  const { settings } = useAppStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const interval = (settings?.profile.autoSaveInterval ?? 30) * 1000

  useEffect(() => {
    if (!isDirty || !activeTimelineId) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      if (!activeTimelineId || !timelines[activeTimelineId]) return
      await updateTimeline(activeTimelineId, {})
      // Silent save — no toast unless error
    }, interval)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, activeTimelineId, interval, updateTimeline, timelines])
}
