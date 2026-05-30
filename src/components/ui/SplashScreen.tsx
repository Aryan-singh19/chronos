'use client'

import { motion } from 'framer-motion'

export function SplashScreen() {
  return (
    <div className="splash-screen">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo */}
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2.5" />
              <line x1="24" y1="8" x2="24" y2="24" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="24" y1="24" x2="34" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="24" r="3" fill="white" />
              {/* Tick marks */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
                <line
                  key={i}
                  x1={24 + 17 * Math.sin((deg * Math.PI) / 180)}
                  y1={24 - 17 * Math.cos((deg * Math.PI) / 180)}
                  x2={24 + 19.5 * Math.sin((deg * Math.PI) / 180)}
                  y2={24 - 19.5 * Math.cos((deg * Math.PI) / 180)}
                  stroke="white"
                  strokeWidth={i % 3 === 0 ? 2 : 1}
                  strokeOpacity={i % 3 === 0 ? 1 : 0.5}
                />
              ))}
            </svg>
          </motion.div>

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-white/30"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        </div>

        {/* App name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">Chronos</h1>
          <p className="text-white/60 text-sm mt-1">Map the past. Build the future.</p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-1.5 mt-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-white/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
