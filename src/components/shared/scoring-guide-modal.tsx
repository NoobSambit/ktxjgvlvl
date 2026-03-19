"use client"

import { Layers3, Sparkles, Trophy, Users, X, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { DashboardPill } from "@/components/dashboard/dashboard-shell"
import { cn } from "@/lib/utils"

type ScoringGuideModalProps = {
  streamPointValue: number
  buttonLabel?: string
  buttonClassName?: string
}

function ScoringRuleCard({
  icon: Icon,
  title,
  body
}: {
  icon: typeof Layers3
  title: string
  body: string
}) {
  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-white/10 bg-white/[0.05] text-white/78">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/62">{body}</p>
    </div>
  )
}

export function ScoringGuideModal({
  streamPointValue,
  buttonLabel = "Scoring guide",
  buttonClassName
}: ScoringGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pointCopy = `+${streamPointValue} ${streamPointValue === 1 ? "point" : "points"}`

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/82 transition hover:bg-white/[0.1] hover:text-white",
          buttonClassName
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Sparkles className="h-4 w-4" />
        {buttonLabel}
      </button>

      {mounted && isOpen
        ? createPortal(
            <div className="fixed inset-0 z-[96] bg-[rgba(4,4,12,0.82)] backdrop-blur-md">
              <div className="flex h-full items-end justify-center p-3 sm:items-center sm:p-6">
                <div
                  aria-label="Scoring guide"
                  aria-modal="true"
                  className="flex h-[88dvh] w-full max-w-[64rem] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,14,31,0.98),rgba(8,8,18,1))] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.96)]"
                  role="dialog"
                >
                  <div className="border-b border-white/10 px-4 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <DashboardPill icon={Sparkles} tone="purple">
                            Scoring guide
                          </DashboardPill>
                          <DashboardPill icon={Layers3} tone="neutral">
                            Current live rules
                          </DashboardPill>
                        </div>
                        <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-white">
                          How points are added
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                          This is the simple version of the live scoring system. It explains what every verified stream
                          adds, when mission bonuses arrive, and why a daily total can be higher than a weekly total.
                        </p>
                      </div>

                      <button
                        aria-label="Close scoring guide"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
                        onClick={() => setIsOpen(false)}
                        type="button"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    <div className="grid gap-3 lg:grid-cols-2">
                      <ScoringRuleCard
                        body={`Every verified BTS-family stream gives ${pointCopy}. The same counted stream is added to daily individual, weekly individual, daily state, and weekly state.`}
                        icon={Layers3}
                        title="1. Streams count first"
                      />
                      <ScoringRuleCard
                        body="Mission rewards are extra. They only arrive when the mission is completed, and they only go to that mission's own daily or weekly window."
                        icon={Zap}
                        title="2. Mission rewards are separate"
                      />
                      <ScoringRuleCard
                        body="Personal missions add the bonus to you and your state. State missions add the bonus to the state board only. India missions reward contributors who joined before the India goal finished."
                        icon={Users}
                        title="3. Who gets each bonus"
                      />
                      <ScoringRuleCard
                        body="A daily score can be higher than a weekly score if you finished a daily mission today but have not finished a weekly mission yet. Weekly does not inherit daily mission rewards."
                        icon={Trophy}
                        title="4. Why totals can look different"
                      />
                    </div>

                    <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">
                        Reset windows
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/66">
                        Daily boards and daily missions reset at 12:00 AM IST. Weekly boards and weekly missions reset
                        every Monday at 12:00 AM IST.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
