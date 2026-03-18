"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { AmazonMusicGuide } from "@/components/guides/amazon-music-guide"
import { AppleMusicAndroidGuide } from "@/components/guides/apple-music-android-guide"
import { CoreGuideLibrary } from "@/components/guides/core-guide-library"
import { SpotifyGuide } from "@/components/guides/spotify-guide"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { YouTubeGuide } from "@/components/guides/youtube-guide"

const GUIDE_OPTIONS = [
  {
    id: "youtube",
    title: "YouTube",
    detail: "MV streaming, first 24 hours, and clean playback",
    icon: <ServiceBrandLogo service="youtube" className="h-4 w-4" />
  },
  {
    id: "spotify",
    title: "Spotify",
    detail: "Playlist rules, chart caps, and safe streaming",
    icon: <ServiceBrandLogo service="spotify" className="h-4 w-4" />
  },
  {
    id: "amazon",
    title: "Amazon Music",
    detail: "Streaming, buying, and market availability",
    icon: <ServiceBrandLogo service="amazon" className="h-4 w-4" />
  },
  {
    id: "apple",
    title: "Apple Music",
    detail: "Android install, Apple ID, and subscription flow",
    icon: <ServiceBrandLogo service="apple" className="h-4 w-4" />
  }
] as const

type GuideOptionId = (typeof GUIDE_OPTIONS)[number]["id"]

export function GuideHub() {
  const [activeGuide, setActiveGuide] = useState<GuideOptionId>("youtube")
  const activeGuideRef = useRef<HTMLDivElement | null>(null)

  const scrollToGuide = () => {
    window.requestAnimationFrame(() => {
      activeGuideRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <div className="space-y-6">
      <CoreGuideLibrary />

      <section className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">Platform walkthroughs</p>
            <h1 className="font-heading text-3xl font-semibold text-white sm:text-4xl">Service-Specific Guides</h1>
            <p className="max-w-2xl text-sm leading-6 text-white/[0.65]">
              After the core rules above, use these when you need setup help for a specific platform.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {GUIDE_OPTIONS.map((guide) => {
              const isActive = guide.id === activeGuide

              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => {
                    setActiveGuide(guide.id)
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
                      {guide.icon}
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
