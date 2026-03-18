"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"

export type GuideWalkthroughStep = {
  id: string
  title: string
  description: string
  hints: string[]
  preview: string
}

export type GuideWalkthroughSection = {
  id: string
  eyebrow: string
  title: string
  shortTitle: string
  summary: string
  note?: string
  steps: GuideWalkthroughStep[]
}

type AccentTheme = "apple" | "amazon" | "spotify" | "youtube"

type GuideWalkthroughModalProps = {
  accent: AccentTheme
  guideTitle: string
  open: boolean
  onClose: () => void
  sections: GuideWalkthroughSection[]
  initialStepId?: string | null
  renderPreview: (preview: string) => ReactNode
}

const accentStyles: Record<
  AccentTheme,
  {
    badge: string
    sectionActive: string
    progress: string
    note: string
    primaryButton: string
  }
> = {
  apple: {
    badge: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100",
    sectionActive: "border-fuchsia-300/[0.45] bg-fuchsia-300/15 text-white",
    progress: "from-fuchsia-300 via-pink-300 to-violet-300",
    note: "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-50",
    primaryButton: "bg-white text-[#26124f]"
  },
  amazon: {
    badge: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    sectionActive: "border-amber-300/[0.45] bg-amber-300/15 text-white",
    progress: "from-amber-200 via-orange-300 to-amber-400",
    note: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    primaryButton: "bg-amber-200 text-slate-950"
  },
  spotify: {
    badge: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    sectionActive: "border-emerald-300/[0.45] bg-emerald-300/15 text-white",
    progress: "from-emerald-200 via-emerald-300 to-lime-300",
    note: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
    primaryButton: "bg-emerald-300 text-slate-950"
  },
  youtube: {
    badge: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    sectionActive: "border-rose-300/[0.45] bg-rose-300/15 text-white",
    progress: "from-rose-300 via-red-300 to-orange-300",
    note: "border-rose-300/20 bg-rose-300/10 text-rose-100",
    primaryButton: "bg-rose-300 text-slate-950"
  }
}

export function GuideWalkthroughModal({
  accent,
  guideTitle,
  open,
  onClose,
  sections,
  initialStepId,
  renderPreview
}: GuideWalkthroughModalProps) {
  const styles = accentStyles[accent]
  const contentRef = useRef<HTMLDivElement | null>(null)

  const flattenedSteps = sections.flatMap((section) =>
    section.steps.map((step, stepIndex) => ({
      ...step,
      sectionId: section.id,
      sectionEyebrow: section.eyebrow,
      sectionTitle: section.title,
      sectionShortTitle: section.shortTitle,
      sectionNote: section.note,
      stepIndex,
      stepCount: section.steps.length
    }))
  )

  const firstStepBySection = sections.reduce<Record<string, string>>((accumulator, section) => {
    accumulator[section.id] = section.steps[0]?.id ?? section.id
    return accumulator
  }, {})

  const [currentStepId, setCurrentStepId] = useState(flattenedSteps[0]?.id ?? "")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const hasInitialStep =
      initialStepId != null && sections.some((section) => section.steps.some((step) => step.id === initialStepId))

    setCurrentStepId(hasInitialStep ? initialStepId : sections[0]?.steps[0]?.id ?? "")
  }, [open, initialStepId, sections])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    contentRef.current?.scrollTo({ top: 0, behavior: "auto" })
  }, [currentStepId, open])

  const currentIndex = flattenedSteps.findIndex((step) => step.id === currentStepId)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0
  const currentStep = flattenedSteps[safeIndex]
  const progress = flattenedSteps.length > 0 ? ((safeIndex + 1) / flattenedSteps.length) * 100 : 0

  if (!open || !currentStep || !mounted) {
    return null
  }

  const currentSection = sections.find((section) => section.id === currentStep.sectionId) ?? sections[0]

  const move = (direction: -1 | 1) => {
    const nextIndex = safeIndex + direction

    if (nextIndex < 0 || nextIndex >= flattenedSteps.length) {
      return
    }

    setCurrentStepId(flattenedSteps[nextIndex].id)
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-[rgba(4,4,12,0.82)] backdrop-blur-md"
      >
        <div className="flex h-full items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${guideTitle} interactive walkthrough`}
            className="flex h-[88dvh] w-full max-w-[26rem] flex-col overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,15,44,0.98),rgba(8,8,20,1))] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.95)] sm:h-[min(88dvh,46rem)]"
          >
            <div className="border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${styles.badge}`}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Guided mode
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${styles.badge}`}>
                      <ServiceBrandLogo service={accent} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-semibold text-white">{guideTitle}</h2>
                      <p className="mt-1 text-sm leading-6 text-white/[0.62]">
                        Use the big next button below. You can jump sections from the pills too.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white transition-colors hover:bg-white/[0.1]"
                  aria-label="Close walkthrough"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {sections.map((section) => {
                  const isActive = section.id === currentSection.id

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setCurrentStepId(firstStepBySection[section.id])}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? styles.sectionActive
                          : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                      }`}
                    >
                      {section.shortTitle}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/[0.45]">
                <span>{currentStep.sectionTitle}</span>
                <span>{safeIndex + 1} / {flattenedSteps.length}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  key={currentStep.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.22 }}
                  className={`h-full rounded-full bg-gradient-to-r ${styles.progress}`}
                />
              </div>
            </div>

            <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
                {renderPreview(currentStep.preview)}
              </div>

              <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/[0.45]">{currentStep.sectionEyebrow}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{currentStep.title}</h3>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-sm text-white/70">
                    Step {currentStep.stepIndex + 1} / {currentStep.stepCount}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-white/[0.74]">{currentStep.description}</p>

                <div className="mt-5 space-y-3">
                  {currentStep.hints.map((hint) => (
                    <div key={hint} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/75" />
                      <p className="text-sm leading-6 text-white/[0.8]">{hint}</p>
                    </div>
                  ))}
                </div>

                {currentStep.sectionNote ? (
                  <div className={`mt-5 rounded-[1.2rem] border p-4 text-sm leading-6 ${styles.note}`}>
                    {currentStep.sectionNote}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4 sm:px-5">
              <p className="text-xs leading-5 text-white/[0.55]">
                Keep going with the buttons below. This walkthrough is intentionally compact for phone screens.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={safeIndex === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => (safeIndex === flattenedSteps.length - 1 ? onClose() : move(1))}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${styles.primaryButton}`}
                >
                  {safeIndex === flattenedSteps.length - 1 ? "Finish walkthrough" : "Next step"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
    ,
    document.body
  )
}
