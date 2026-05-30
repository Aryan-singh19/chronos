import { useCallback, useRef } from 'react'

export function useConfetti() {
  const firedRef = useRef(new Set<string>())

  const fire = useCallback(async (milestoneKey: string) => {
    if (firedRef.current.has(milestoneKey)) return
    firedRef.current.add(milestoneKey)

    try {
      const confetti = (await import('canvas-confetti')).default
      const count = 150
      const defaults = { origin: { y: 0.7 }, zIndex: 9999 }

      function shoot(particleRatio: number, opts: object) {
        confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
      }

      shoot(0.25, { spread: 26, startVelocity: 55, colors: ['#2563eb', '#60a5fa', '#ffffff'] })
      shoot(0.2, { spread: 60, colors: ['#2563eb', '#1d4ed8', '#93c5fd'] })
      shoot(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#ffffff', '#bfdbfe'] })
      shoot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      shoot(0.1, { spread: 120, startVelocity: 45, colors: ['#2563eb', '#ffffff'] })
    } catch (e) {
      // confetti not available
    }
  }, [])

  return { fire }
}

export const MILESTONE_KEYS = {
  FIRST_NODE: 'first_node',
  FIRST_EXPORT: 'first_export',
  FIRST_PROJECT: 'first_project',
  FIRST_TIMELINE: 'first_timeline',
  TEN_NODES: 'ten_nodes',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const
