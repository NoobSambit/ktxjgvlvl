"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Compass, Layers3, PanelTopOpen, Sparkles, type LucideIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { AmazonMusicGuide } from "@/components/guides/amazon-music-guide"
import { AppleMusicAndroidGuide } from "@/components/guides/apple-music-android-guide"
import { CoreGuideLibrary } from "@/components/guides/core-guide-library"
import { SpotifyGuide } from "@/components/guides/spotify-guide"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { YouTubeGuide } from "@/components/guides/youtube-guide"
import { cn } from "@/lib/utils"
import {
  DEFAULT_CORE_GUIDE_ID,
  DEFAULT_PLATFORM_GUIDE_ID,
  PLATFORM_GUIDE_LIBRARY,
  resolveCoreGuideId,
  resolvePlatformGuideId,
  type PlatformGuideId
} from "@/modules/guides/service"

type GuideSectionId = "guide-overview" | "core-guide-library" | "platform-guide-library"

const GUIDE_SECTIONS: Array<{
  id: GuideSectionId
  label: string
  description: string
  icon: LucideIcon
}> = [
  {
    id: "guide-overview",
    label: "Overview",
    description: "See how the guide hub is structured.",
    icon: Compass
  },
  {
    id: "core-guide-library",
    label: "Core Rules",
    description: "Read the all-platform rules first.",
    icon: Layers3
  },
  {
    id: "platform-guide-library",
    label: "Platform Guides",
    description: "Jump into YouTube, Spotify, Apple, or Amazon.",
    icon: PanelTopOpen
  }
]

export function GuideHub() {
  const searchParams = useSearchParams()
  const coreGuideParam = searchParams?.get("core") ?? null
  const platformGuideParam = searchParams?.get("platform") ?? null
  const requestedCoreGuideId = resolveCoreGuideId(coreGuideParam)
  const activeCoreGuideId = requestedCoreGuideId ?? DEFAULT_CORE_GUIDE_ID
  const requestedPlatformGuideId = resolvePlatformGuideId(platformGuideParam)
  const [activeGuide, setActiveGuide] = useState<PlatformGuideId>(
    () => requestedPlatformGuideId ?? DEFAULT_PLATFORM_GUIDE_ID
  )
  const [activeSection, setActiveSection] = useState<GuideSectionId>(
    () =>
      requestedPlatformGuideId
        ? "platform-guide-library"
        : requestedCoreGuideId
          ? "core-guide-library"
          : "guide-overview"
  )
  const activeGuideRef = useRef<HTMLDivElement | null>(null)
  const activePlatformMeta =
    PLATFORM_GUIDE_LIBRARY.find((guide) => guide.id === activeGuide) ?? PLATFORM_GUIDE_LIBRARY[0]

  useEffect(() => {
    const requestedGuide = resolvePlatformGuideId(platformGuideParam)

    if (requestedGuide) {
      setActiveGuide(requestedGuide)
      setActiveSection("platform-guide-library")
      return
    }

    if (resolveCoreGuideId(coreGuideParam)) {
      setActiveSection("core-guide-library")
    }
  }, [coreGuideParam, platformGuideParam])

  useEffect(() => {
    const sections = GUIDE_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (section): section is HTMLElement => Boolean(section)
    )

    if (sections.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id as GuideSectionId)
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: "-120px 0px -45% 0px"
      }
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: GuideSectionId) => {
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const scrollToGuide = () => {
    window.requestAnimationFrame(() => {
      activeGuideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <div className="space-y-6">
      <section
        id="guide-overview"
        className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-5 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.95)] sm:p-6"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">
              <Sparkles className="h-3.5 w-3.5" />
              Guide hub
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-heading text-3xl font-semibold text-white sm:text-4xl lg:text-[2.9rem]">
                Start with the core rules, then jump straight into the platform walkthrough you need.
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-white/[0.72] sm:text-base">
                This page has two layers: the all-platform streaming basics first, then dedicated guides for YouTube, Spotify, Apple Music, and Amazon Music.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToSection("core-guide-library")}
                className="inline-flex items-center justify-center rounded-[1.1rem] bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                Start with core rules
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("platform-guide-library")}
                className="inline-flex items-center justify-center rounded-[1.1rem] border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
              >
                Jump to platform guides
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[1.45rem] border border-white/10 bg-black/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.5]">How to use this page</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-[1rem] bg-white/[0.05] px-4 py-3">
                  <p className="text-sm font-semibold text-white">1. Read the core rules first</p>
                  <p className="mt-1 text-sm leading-6 text-white/[0.68]">They cover the habits that apply across every service.</p>
                </div>
                <div className="rounded-[1rem] bg-white/[0.05] px-4 py-3">
                  <p className="text-sm font-semibold text-white">2. Open the platform guide you actually use</p>
                  <p className="mt-1 text-sm leading-6 text-white/[0.68]">Each walkthrough focuses on setup and clean behavior for that service.</p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.45rem] border border-white/10 bg-white/[0.05] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.5]">Dedicated platform library</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {PLATFORM_GUIDE_LIBRARY.map((guide) => (
                  <button
                    key={guide.id}
                    type="button"
                    onClick={() => {
                      setActiveGuide(guide.id)
                      scrollToSection("platform-guide-library")
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white/[0.8] transition hover:border-white/20 hover:bg-white/[0.1]"
                  >
                    <ServiceBrandLogo service={guide.service} className="h-3.5 w-3.5" />
                    {guide.navLabel}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/[0.68]">
                The current quick jump is set to <span className="font-semibold text-white">{activePlatformMeta.title}</span>.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-30 space-y-3 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,15,0.92),rgba(10,10,15,0.78))] p-3 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:top-24 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/[0.45]">Guide navigation</p>
            <p className="mt-1 text-sm text-white/[0.7]">
              Active section: <span className="font-semibold text-white">{GUIDE_SECTIONS.find((section) => section.id === activeSection)?.label}</span>
            </p>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/[0.65] sm:inline-flex">
            4 core guides + 4 platform walkthroughs
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {GUIDE_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "rounded-[1.2rem] border px-3 py-3 text-left transition-all duration-200",
                  isActive
                    ? "border-white/20 bg-white/[0.12] text-white shadow-[0_16px_40px_-30px_rgba(255,255,255,0.8)]"
                    : "border-white/10 bg-white/[0.04] text-white/[0.75] hover:border-white/20 hover:bg-white/[0.08]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-2xl", isActive ? "bg-white text-slate-950" : "bg-white/[0.08] text-white")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-5">{section.label}</p>
                    <p className="hidden text-xs leading-5 text-white/[0.52] lg:block">{section.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/[0.45]">Mobile platform bar</p>
            <p className="text-xs text-white/[0.55] sm:hidden">Swipe to jump faster</p>
            <p className="hidden text-xs text-white/[0.55] sm:block">Dedicated guides live below the core rules</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {PLATFORM_GUIDE_LIBRARY.map((guide) => {
              const isActive = guide.id === activeGuide

              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => {
                    setActiveGuide(guide.id)
                    scrollToSection("platform-guide-library")
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-white/20 bg-white text-slate-950"
                      : "border-white/10 bg-white/[0.05] text-white/[0.78] hover:border-white/20 hover:bg-white/[0.08]"
                  )}
                >
                  <ServiceBrandLogo service={guide.service} className="h-3.5 w-3.5" />
                  {guide.title}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <CoreGuideLibrary initialGuideId={activeCoreGuideId} />

      <section
        id="platform-guide-library"
        className="scroll-mt-28 rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 backdrop-blur-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">Platform walkthroughs</p>
            <h1 className="font-heading text-3xl font-semibold text-white sm:text-4xl">Service-Specific Guides</h1>
            <p className="max-w-2xl text-sm leading-6 text-white/[0.65]">
              After the core rules above, use these when you need setup help for a specific platform.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PLATFORM_GUIDE_LIBRARY.map((guide) => {
              const isActive = guide.id === activeGuide

              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => {
                    setActiveGuide(guide.id)
                    setActiveSection("platform-guide-library")
                    scrollToGuide()
                  }}
                  className={`relative overflow-hidden rounded-[1.4rem] border px-4 py-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-white/20 bg-white/[0.1] shadow-[0_20px_50px_-35px_rgba(255,255,255,0.8)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? "bg-white text-slate-950" : "bg-white/[0.08] text-white"}`}>
                      <ServiceBrandLogo service={guide.service} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{guide.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/[0.45]">{guide.detail}</p>
                    </div>
                  </div>
                  {isActive ? <motion.div layoutId="guide-hub-active" className="absolute inset-x-4 bottom-2 h-1 rounded-full bg-gradient-to-r from-white via-white/80 to-white/40" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div ref={activeGuideRef}>
        {activeGuide === "youtube" ? (
          <YouTubeGuide />
        ) : activeGuide === "spotify" ? (
          <SpotifyGuide />
        ) : activeGuide === "amazon" ? (
          <AmazonMusicGuide />
        ) : (
          <AppleMusicAndroidGuide />
        )}
      </div>
    </div>
  )
}
