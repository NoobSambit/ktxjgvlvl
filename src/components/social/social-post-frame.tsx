"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import {
  Album,
  AudioLines,
  MapPinned,
  Music2,
  RefreshCcw,
  Smartphone,
  Trophy,
  UserRound,
  Users
} from "lucide-react"

const missionScopes = [
  {
    label: "Individual",
    detail: "Personal missions track only your own progress. Rewards go to you and your state.",
    icon: UserRound
  },
  {
    label: "State",
    detail: "Everyone from the same state pushes one shared mission. Rewards go to the state board.",
    icon: MapPinned
  },
  {
    label: "India",
    detail: "All contributors across India push one national shared mission together.",
    icon: Users
  }
]

const trackerOptions = [
  {
    label: "Last.fm",
    detail: "Main tracker for live verification.",
    icon: Music2
  },
  {
    label: "stats.fm",
    detail: "Spotify users can connect here.",
    icon: AudioLines
  },
  {
    label: "Musicat",
    detail: "Apple Music users can connect here.",
    icon: Smartphone
  }
]

const mechanics = [
  {
    label: "Track streams",
    detail: "Verified BTS plays move stream-count goals.",
    icon: AudioLines
  },
  {
    label: "Album completions",
    detail: "Assigned albums count after all target tracks are completed.",
    icon: Album
  }
]

const syncModes = [
  {
    label: "Auto sync",
    detail: "The platform can keep importing new verified plays in the background.",
    icon: RefreshCcw
  },
  {
    label: "Manual refresh",
    detail: "Users can refresh manually to update their dashboard and mission progress faster.",
    icon: Trophy
  }
]

const boardList = ["Daily individual", "Weekly individual", "Daily state", "Weekly state"]

const pointRules = [
  {
    highlight: "1 verified BTS stream",
    detail: "= 1 base point"
  },
  {
    highlight: "Same verified stream",
    detail: "scores on 4 live boards"
  },
  {
    highlight: "Mission completions",
    detail: "add bonus points on top"
  },
  {
    highlight: "Personal rewards",
    detail: "you + your state"
  },
  {
    highlight: "State rewards",
    detail: "state board only"
  },
  {
    highlight: "India rewards",
    detail: "qualifying contributors"
  }
]

function BentoBox({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <section className={`flex flex-col rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3.5 md:p-4 shadow-lg backdrop-blur-md ${className}`}>
      <p className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2 md:mb-3">{title}</p>
      <div className="flex-1 flex flex-col min-h-0 justify-center">
        {children}
      </div>
    </section>
  )
}

function ItemList({ items, layout = "vertical", className = "" }: { items: any[], layout?: "vertical" | "horizontal" | "grid-2" | "grid-3", className?: string }) {
  const gridClass = {
    "vertical": "grid grid-cols-1 gap-2.5",
    "horizontal": "flex flex-row overflow-x-auto gap-2.5",
    "grid-2": "grid grid-cols-1 xl:grid-cols-2 gap-2.5",
    "grid-3": "grid grid-cols-1 md:grid-cols-3 gap-2.5"
  }[layout]
  
  return (
    <div className={`${gridClass} ${className}`}>
      {items.map(item => {
        const Icon = item.icon
        return (
          <div key={item.label} className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 md:p-3 transition-colors hover:bg-white/[0.06] hover:border-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] border border-white/10 bg-white/[0.04] text-white/80 group-hover:text-white group-hover:bg-white/[0.1] transition-colors">
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] md:text-[15px] font-bold text-white/95 group-hover:text-white transition-colors">{item.label}</p>
              <p className="mt-0.5 text-[13px] md:text-[13.5px] leading-snug text-white/65">{item.detail}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SocialPostFrame() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#05050a] text-white shadow-[0_45px_120px_-55px_rgba(0,0,0,0.95)] min-[900px]:aspect-[16/9] min-[900px]:h-[calc(100vh-2.5rem)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(168,85,247,0.18),transparent_26%),radial-gradient(circle_at_88%_14%,rgba(249,115,22,0.16),transparent_22%),radial-gradient(circle_at_76%_86%,rgba(16,185,129,0.12),transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_82%,rgba(255,255,255,0.03))]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative flex h-full flex-col p-4 sm:p-5 lg:p-6 z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/12 bg-white/[0.05]">
              <Image
                src="/bts-india-logo.svg"
                alt="India For BTS logo"
                fill
                className="object-cover"
                sizes="48px"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-[1.1rem] font-semibold tracking-tight text-white">
                India For BTS
              </p>
              <p className="truncate text-sm text-white/60">@indiaforbts · Feature 01</p>
            </div>
          </div>

          <div className="rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
            Mission System
          </div>
        </div>

        <div className="mt-3 md:mt-4 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-3 xl:gap-4 min-h-0 overflow-hidden">
          {/* Left Column */}
          <section className="flex flex-col gap-3 xl:gap-3.5 min-h-0">
            <div className="mb-0">
              <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                Verified streams only
              </div>

              <h1 className="mt-2.5 max-w-[12ch] font-heading text-[2.2rem] font-bold leading-[0.9] tracking-tight text-white sm:text-[3rem] xl:text-[3.6rem]">
                How missions,
                <span className="block bg-gradient-to-r from-orange-400 via-[hsl(320,65%,74%)] to-[hsl(25,95%,62%)] bg-clip-text text-transparent pb-1">
                  sync, and points work
                </span>
              </h1>

              <p className="mt-2.5 text-[14px] xl:text-[15px] leading-relaxed text-white/70 max-w-[44ch]">
                Connect a tracker, set your state, stream BTS normally, and sync. Once a BTS play is verified,
                that <span className="font-semibold text-orange-400">same play</span> updates missions and
                all <span className="font-semibold text-emerald-400">4 live boards</span> automatically.
              </p>
            </div>

            <BentoBox title="At a glance" className="py-2.5">
              <div className="flex justify-evenly items-center bg-white/[0.02] rounded-xl border border-white/5 py-2.5 xl:py-3.5">
                <div className="text-center px-3 md:px-4">
                  <p className="text-3xl xl:text-4xl font-extrabold text-white leading-none">3</p>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mt-1 md:mt-1.5">trackers</p>
                </div>
                <div className="w-[1px] h-10 xl:h-12 bg-white/10" />
                <div className="text-center px-3 md:px-4">
                  <p className="text-3xl xl:text-4xl font-extrabold text-white leading-none">3</p>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mt-1 md:mt-1.5">scopes</p>
                </div>
                <div className="w-[1px] h-10 xl:h-12 bg-white/10" />
                <div className="text-center px-3 md:px-4">
                  <p className="text-3xl xl:text-4xl font-extrabold text-white leading-none">4</p>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-white/50 mt-1 md:mt-1.5">boards</p>
                </div>
              </div>
            </BentoBox>

            <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
              <BentoBox title="Tracker Options" className="h-full">
                <ItemList items={trackerOptions} layout="vertical" className="h-full" />
              </BentoBox>
              <BentoBox title="Sync Modes" className="h-full">
                <ItemList items={syncModes} layout="vertical" className="h-full" />
              </BentoBox>
            </div>
          </section>

          {/* Right Column */}
          <section className="flex flex-col gap-3 xl:gap-3.5 min-h-0">
            <BentoBox title="Mission Scopes" className="shrink-0">
              <ItemList items={missionScopes} layout="grid-3" />
            </BentoBox>

            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-3 flex-1 min-h-0">
              <div className="flex flex-col gap-3 min-h-0">
                <BentoBox title="Mechanics" className="shrink-0">
                  <ItemList items={mechanics} layout="vertical" />
                </BentoBox>

                <BentoBox title="Board Coverage" className="flex-1">
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    {boardList.map((item) => (
                      <div key={item} className="flex items-center justify-center text-center rounded-lg border border-white/5 bg-white/[0.03] px-2 py-2 md:py-2.5 text-[13px] font-semibold text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white">
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3 md:py-3.5 mt-auto">
                    <p className="text-[14px] font-bold text-white/90 mb-1.5 flex items-center gap-2">Reward routing</p>
                    <p className="text-[13px] md:text-[13.5px] leading-snug text-white/65">
                      <span className="font-semibold text-[hsl(25,95%,62%)]">Personal</span> rewards go to you and your state.
                      <span className="mx-1.5 text-white/20">•</span>
                      <span className="font-semibold text-[hsl(160,66%,56%)]">State</span> rewards go to the state board only.
                      <span className="mx-1.5 text-white/20">•</span>
                      <span className="font-semibold text-[hsl(320,65%,74%)]">India</span> rewards go only to contributors who qualified before completion.
                    </p>
                  </div>
                </BentoBox>
              </div>

              <BentoBox title="Point Rules" className="flex-1">
                <div className="grid gap-2 flex-1 items-center">
                  {pointRules.map((item, index) => (
                    <div
                      key={item.highlight}
                      className="group flex flex-col justify-center rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-baseline gap-0.5 md:gap-1.5">
                        <span className={`text-[14px] font-bold ${index < 3 ? "text-[hsl(25,95%,62%)]" : "text-[hsl(160,66%,56%)]"}`}>
                          {item.highlight}
                        </span>
                        <span className="text-[13px] md:text-[13.5px] text-white/70 group-hover:text-white/90 transition-colors"> {item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoBox>
            </div>
          </section>
        </div>
      </div>
    </motion.article>
  )
}
