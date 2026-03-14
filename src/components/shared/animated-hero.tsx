"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function AnimatedHeroActions() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-5"
    >
      <div className="flex flex-wrap gap-3">
        <Link 
          href="/dashboard" 
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(265,70%,65%)] to-[hsl(265,70%,55%)] px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5"
        >
          Open my dashboard
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link 
          href="/missions" 
          className="inline-flex h-11 items-center justify-center rounded-xl bg-transparent border-2 border-[hsl(265,70%,65%)]/30 px-6 text-sm font-semibold text-[hsl(265,70%,65%)] hover:bg-[hsl(265,70%,65%)]/10 transition-colors"
        >
          See today&apos;s missions
        </Link>
      </div>
      <p className="text-sm text-[hsl(265,15%,65%)] max-w-lg">
        Track your listening, join team pushes, check chart snapshots, and keep up with BTS updates — all in one place.
      </p>
    </motion.div>
  )
}
