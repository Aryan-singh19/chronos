'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Layers,
  Sparkles,
  HardDrive,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Download,
  Users,
} from 'lucide-react'
import { useAppStore } from '@/stores'
import { settingsDB } from '@/lib/db'

const STEPS = [
  {
    icon: Clock,
    title: 'Welcome to Chronos',
    subtitle: 'Plan clearly from the very first session.',
    description:
      'Chronos helps you map launches, research, and long-running work on a timeline that stays flexible as ideas evolve.',
    highlights: ['Build timelines visually', 'Keep your work private in this browser', 'Revisit progress without losing context'],
    color: '#2563eb',
  },
  {
    icon: Layers,
    title: 'A canvas that stays flexible',
    subtitle: 'Zoom out for strategy, zoom in for detail.',
    description:
      'Pan freely, arrange events on a 2D canvas, and create structure with lanes, nested timelines, and linked milestones.',
    highlights: ['Double-click to add an event', 'Shift-drag to lasso select', 'Use the inspector to refine details'],
    color: '#7c3aed',
  },
  {
    icon: Sparkles,
    title: 'Helpful intelligence, right where you work',
    subtitle: 'Capture ideas first, polish them second.',
    description:
      'Chronos can suggest tags, infer useful details, and help connect related work so your timeline becomes easier to scan over time.',
    highlights: ['Suggested tags for faster organization', 'Smarter event cleanup in the inspector', 'Better visibility across related work'],
    color: '#0891b2',
  },
  {
    icon: HardDrive,
    title: 'You stay in control',
    subtitle: 'Work offline and export when you need to.',
    description:
      'Your workspace stays available locally, and you can export timelines to share or archive them whenever it helps.',
    highlights: ['Works well offline', 'Export to JSON, CSV, PDF, or HTML', 'No complicated setup before you can start'],
    color: '#059669',
  },
  {
    icon: CheckCircle2,
    title: "You're ready to begin",
    subtitle: 'Let’s personalize the workspace.',
    description:
      'Choose the name you want Chronos to use in the workspace. You can update it later in Settings anytime.',
    highlights: ['Personalized workspace greeting', 'Recent activity tied to your profile', 'A cleaner start to your first project'],
    color: '#2563eb',
    isLast: true,
  },
] as const

const QUICK_VALUES = [
  { icon: ShieldCheck, label: 'Private by default' },
  { icon: Download, label: 'Export anytime' },
  { icon: Users, label: 'Ready for shared planning' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { settings, updateProfile } = useAppStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100
  const resolvedName = name.trim() || settings?.profile.name || 'Chronos User'

  const nextLabel = useMemo(() => {
    if (!isLast) return 'Continue'
    return name.trim() ? `Start as ${name.trim()}` : 'Start with default profile'
  }, [isLast, name])

  const handleNext = async () => {
    if (isSaving) return

    if (isLast) {
      setIsSaving(true)
      if (name.trim()) await updateProfile({ name: name.trim() })
      const currentSettings = await settingsDB.get()
      if (currentSettings) {
        await settingsDB.save({ ...currentSettings, onboardingComplete: true })
      }
      router.replace('/dashboard')
      return
    }

    setStep((currentStep) => currentStep + 1)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-950 to-cyan-950 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${220 + index * 70}px`,
              height: `${220 + index * 70}px`,
              left: `${8 + index * 14}%`,
              top: `${4 + index * 10}%`,
              background: 'white',
            }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.04, 0.08, 0.04] }}
            transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/6 p-8 text-white backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
              <Sparkles size={13} />
              Getting started
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight">
              Make the first Chronos session feel calm, clear, and productive.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
              This short walkthrough shows how Chronos works, what stays in your control, and how to
              start building your first timeline without guesswork.
            </p>

            <div className="mt-8 grid gap-3">
              {QUICK_VALUES.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/80"
                >
                  <item.icon size={16} className="text-cyan-300" />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/45 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Step {step + 1} of {STEPS.length}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{current.title}</p>
                </div>
                <div className="text-right text-sm text-white/60">
                  <p>{Math.round(progress)}% complete</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="mb-6 flex justify-center gap-2">
              {STEPS.map((_, index) => (
                <motion.div
                  key={index}
                  className="rounded-full bg-white"
                  animate={{ width: index === step ? '28px' : '8px', opacity: index <= step ? 1 : 0.28 }}
                  transition={{ type: 'spring', damping: 20 }}
                  style={{ height: '8px' }}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -36 }}
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                className="rounded-[32px] border border-white/16 bg-white/10 p-8 text-white backdrop-blur-xl"
              >
                <motion.div
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: current.color }}
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 240 }}
                >
                  <Icon size={30} className="text-white" />
                </motion.div>

                <p className="text-sm font-medium text-blue-200">{current.subtitle}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">{current.title}</h2>
                <p className="mt-4 text-base leading-7 text-white/78">{current.description}</p>

                <div className="mt-6 grid gap-3">
                  {current.highlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm text-white/78"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {isLast && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6"
                  >
                    <label className="mb-2 block text-sm font-medium text-white/78">Display name</label>
                    <input
                      type="text"
                      placeholder="How should Chronos greet you?"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && void handleNext()}
                      className="w-full rounded-2xl border border-white/25 bg-white/14 px-4 py-3 text-white outline-none transition-all placeholder:text-white/38 focus:border-white/60 focus:bg-white/18"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-white/55">
                      Preview: the workspace will welcome <span className="font-semibold text-white/80">{resolvedName}</span>.
                    </p>
                  </motion.div>
                )}

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
                    className="flex items-center gap-1.5 text-white/55 transition-colors hover:text-white disabled:opacity-0"
                    disabled={step === 0}
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>

                  <motion.button
                    onClick={() => void handleNext()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition-colors hover:bg-blue-50 disabled:opacity-70"
                  >
                    {isSaving ? 'Setting up…' : nextLabel}
                    {!isSaving && <ChevronRight size={18} />}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {!isLast && (
              <button
                onClick={() => setStep(STEPS.length - 1)}
                className="mt-4 w-full text-center text-sm text-white/42 transition-colors hover:text-white/65"
              >
                Skip to profile setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
