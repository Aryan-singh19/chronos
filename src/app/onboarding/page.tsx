'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { useAppStore } from '@/stores'
import { settingsDB } from '@/lib/db'

const STEPS = [
  {
    icon: Clock,
    title: 'Welcome to Chronos',
    subtitle: 'Map the past. Build the future.',
    description:
      'Chronos is a local-first infinite timeline builder. Visualize research, world-build stories, track projects, or map history — all stored privately on your device.',
    color: '#2563eb',
  },
  {
    icon: Layers,
    title: 'Infinite Canvas',
    subtitle: 'Your timeline, your rules.',
    description:
      'Pan, zoom, and arrange events on a 2D canvas. Create lanes, nest timelines inside nodes, connect events with arrows — with zero limits on depth or complexity.',
    color: '#7c3aed',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    subtitle: 'Smart, local, and free.',
    description:
      'Chronos automatically suggests tags, detects priorities, infers dates from text, and finds related events — all using on-device intelligence. No API key required.',
    color: '#0891b2',
  },
  {
    icon: HardDrive,
    title: 'Your Data, Your Device',
    subtitle: 'Zero-cost. Offline-first.',
    description:
      'Everything lives in your browser\'s local storage. No servers, no subscriptions, no cloud bills. Export to JSON, CSV, PDF, or HTML anytime you want.',
    color: '#059669',
  },
  {
    icon: CheckCircle2,
    title: "You're all set!",
    subtitle: "Let's build your first timeline.",
    description:
      'Give yourself a name to personalize your experience. You can change this anytime in Settings.',
    color: '#2563eb',
    isLast: true,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { settings, updateProfile } = useAppStore()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  const handleNext = async () => {
    if (isLast) {
      if (name.trim()) await updateProfile({ name: name.trim() })
      const current = await settingsDB.get()
      if (current) {
        await settingsDB.save({ ...current, onboardingComplete: true })
      }
      router.replace('/dashboard')
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 12}%`,
              background: 'white',
            }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-white"
              animate={{ width: i === step ? '24px' : '8px', opacity: i <= step ? 1 : 0.3 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{ height: '8px' }}
            />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white"
          >
            {/* Icon */}
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: current.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <Icon size={32} className="text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold mb-1"
            >
              {current.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-blue-200 font-medium mb-4"
            >
              {current.subtitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-white/80 leading-relaxed mb-6"
            >
              {current.description}
            </motion.p>

            {/* Name input on last step */}
            {isLast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <input
                  type="text"
                  placeholder="Enter your name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full bg-white/15 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/60 focus:bg-white/20 transition-all text-base"
                  autoFocus
                />
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors disabled:opacity-0"
                disabled={step === 0}
              >
                <ChevronLeft size={18} />
                Back
              </button>

              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-white text-blue-900 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                {isLast ? 'Get Started' : 'Continue'}
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={() => setStep(STEPS.length - 1)}
            className="w-full text-center text-white/40 hover:text-white/60 text-sm mt-4 transition-colors"
          >
            Skip introduction
          </button>
        )}
      </div>
    </div>
  )
}
