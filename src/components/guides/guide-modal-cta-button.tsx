"use client"

import { type ReactNode } from "react"
import { ArrowRight, Sparkles } from "lucide-react"

type GuideCtaAccent = "core" | "apple" | "amazon" | "spotify" | "youtube"

const accentStyles: Record<
  GuideCtaAccent,
  {
    gradient: string
    glow: string
    badge: string
    text: string
  }
> = {
  core: {
    gradient: "from-fuchsia-300 via-pink-200 to-violet-200",
    glow: "shadow-[0_18px_45px_-24px_rgba(255,130,234,0.85)]",
    badge: "bg-slate-950/16 text-slate-950",
    text: "text-slate-950"
  },
  apple: {
    gradient: "from-fuchsia-300 via-pink-200 to-violet-200",
    glow: "shadow-[0_18px_45px_-24px_rgba(255,130,234,0.85)]",
    badge: "bg-slate-950/16 text-slate-950",
    text: "text-slate-950"
  },
  amazon: {
    gradient: "from-amber-200 via-orange-200 to-yellow-100",
    glow: "shadow-[0_18px_45px_-24px_rgba(255,194,71,0.82)]",
    badge: "bg-slate-950/14 text-slate-950",
    text: "text-slate-950"
  },
  spotify: {
    gradient: "from-emerald-300 via-lime-200 to-emerald-100",
    glow: "shadow-[0_18px_45px_-24px_rgba(30,215,96,0.8)]",
    badge: "bg-slate-950/14 text-slate-950",
    text: "text-slate-950"
  },
  youtube: {
    gradient: "from-rose-300 via-orange-200 to-amber-100",
    glow: "shadow-[0_18px_45px_-24px_rgba(255,114,129,0.86)]",
    badge: "bg-slate-950/14 text-slate-950",
    text: "text-slate-950"
  }
}

export function GuideModalCtaButton({
  accent,
  label,
  onClick,
  compact = false,
  icon,
  className = ""
}: {
  accent: GuideCtaAccent
  label: string
  onClick: () => void
  compact?: boolean
  icon?: ReactNode
  className?: string
}) {
  const styles = accentStyles[accent]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex overflow-hidden rounded-full border border-white/15 ${styles.glow} ${className}`}
    >
      <span className={`absolute inset-0 bg-gradient-to-r ${styles.gradient}`} />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_40%)]" />
      <span className="absolute inset-y-0 -left-12 w-16 -skew-x-12 bg-white/30 blur-xl transition-transform duration-700 group-hover:translate-x-[22rem]" />
      <span
        className={`relative inline-flex items-center gap-2 ${compact ? "px-4 py-2.5 text-sm" : "px-5 py-3 text-sm"} font-semibold ${styles.text}`}
      >
        <span className={`flex ${compact ? "h-6 w-6" : "h-7 w-7"} items-center justify-center rounded-full ${styles.badge}`}>
          {icon ?? <Sparkles className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
        </span>
        <span>{label}</span>
        <ArrowRight className={compact ? "h-4 w-4" : "h-4 w-4"} />
      </span>
    </button>
  )
}
