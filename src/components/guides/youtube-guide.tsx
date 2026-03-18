"use client"

import { type ReactNode, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  ListVideo,
  MessageSquareText,
  PlayCircle,
  Search,
  ShieldAlert,
  Smartphone,
  Star,
  Tv,
  UserRound,
  Volume2
} from "lucide-react"
import { GuideModalCtaButton } from "@/components/guides/guide-modal-cta-button"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { GuideWalkthroughModal, type GuideWalkthroughSection } from "@/components/guides/guide-walkthrough-modal"

const YOUTUBE_SECTIONS: GuideWalkthroughSection[] = [
  {
    id: "official",
    eyebrow: "Start here",
    title: "Use official uploads only",
    shortTitle: "Official",
    summary: "Always stream the real BTS upload first so the algorithm and milestones stay pointed at the correct video.",
    note: "Official video priority still matters even when thousands of fan edits, lyrics videos, and reaction clips flood the timeline.",
    steps: [
      {
        id: "youtube-official-channels",
        title: "Use HYBE LABELS or BANGTANTV first",
        description:
          "Open the official upload from HYBE LABELS or BANGTANTV. For older catalog videos, check whether the legacy official upload is still the main version before you press play.",
        hints: [
          "Use the official upload only",
          "Do not start on reaction, lyrics, mirror, or fan-upload videos",
          "Older catalog songs can sometimes live on a legacy official upload"
        ],
        preview: "official"
      },
      {
        id: "youtube-official-search",
        title: "Search it manually with real keywords",
        description:
          "Search the MV manually instead of entering through a spammy loop. Rotating keywords helps discovery and trending signals look more organic.",
        hints: [
          "Use searches like BTS [title], BTS [title] MV, BTS [title] official",
          "Manual clicks are stronger than robot-style repeats",
          "Direct searches help the algorithm understand demand"
        ],
        preview: "search"
      }
    ]
  },
  {
    id: "playback",
    eyebrow: "Playback rules",
    title: "Set up cleaner playback",
    shortTitle: "Playback",
    summary: "The easiest way to avoid low-quality flags is to make your viewing setup look like a real person watching a real video.",
    note: "One device, one browser, one tab is still the safest YouTube habit during a focused session.",
    steps: [
      {
        id: "youtube-playback-quality",
        title: "Watch full length in 720p+ with volume on",
        description:
          "Play the video from start to finish at normal speed, keep the quality at 720p or higher when possible, and keep the volume up instead of muting it.",
        hints: [
          "Do not skip to the end",
          "Keep quality at 720p or higher when your connection allows it",
          "Keep volume above half instead of muting"
        ],
        preview: "quality"
      },
      {
        id: "youtube-playback-screen",
        title: "Stay in a normal viewing mode",
        description:
          "Default, theater, or full screen viewing looks cleaner than strange minimized playback. Avoid splitting the same MV across tabs or devices.",
        hints: [
          "Full screen or theater mode is fine",
          "Do not run the same MV in multiple tabs",
          "Do not stream the same MV on several devices at once"
        ],
        preview: "screen"
      }
    ]
  },
  {
    id: "first24",
    eyebrow: "Critical window",
    title: "Handle the first 24 hours properly",
    shortTitle: "First 24h",
    summary: "The debut window needs the cleanest behavior: manual clicks, no playlist abuse, and constant official-video priority.",
    note: "First-day pushes are about organic-looking views, not brute-force repetitions.",
    steps: [
      {
        id: "youtube-first24-manual",
        title: "Manual streaming beats playlists on day one",
        description:
          "During the first 24 hours, prioritize manual search and manual clicks instead of long playlist loops. If you need structure, use Queue rather than a replay-heavy playlist.",
        hints: [
          "Avoid playlists in the first 24 hours when possible",
          "Queue a few BTS videos instead of building a loop lane",
          "Direct search and direct clicks are the cleanest method"
        ],
        preview: "manual"
      },
      {
        id: "youtube-first24-fillers",
        title: "Use filler videos and cap your focus rate",
        description:
          "After a full watch, move to another BTS MV, Bangtan Bomb, audio, or even an unrelated video before coming back. Keep the focus MV to roughly 4 to 6 clean plays per hour max.",
        hints: [
          "Use 5 to 10 minutes or several filler videos between repeat focus plays",
          "Do not jump right back into the same MV",
          "Take breaks or switch accounts later instead of hammering one loop"
        ],
        preview: "fillers"
      }
    ]
  },
  {
    id: "ongoing",
    eyebrow: "Day 2 onward",
    title: "Switch into sustainable streaming",
    shortTitle: "Ongoing",
    summary: "After the debut rush, the goal is consistency: real sessions, album support, short playlists, and no burnout.",
    note: "Sustainable daily behavior usually beats one huge crash-and-burn session.",
    steps: [
      {
        id: "youtube-ongoing-cycle",
        title: "Rotate albums and short playlists",
        description:
          "A cleaner longer-term routine is full album listening or MV rotation, then a shorter playlist, then back again. This keeps the session varied and easier to maintain.",
        hints: [
          "Album -> short playlist -> album is a strong pattern",
          "Shorter playlists are easier to supervise than one giant playlist",
          "Mix other BTS content so the pattern keeps breathing"
        ],
        preview: "cycle"
      },
      {
        id: "youtube-ongoing-breaks",
        title: "Take breaks and vary your sessions",
        description:
          "Step away for a bit every few hours, switch playlists or videos, and avoid repeating the exact same routine all day.",
        hints: [
          "Take a 5 to 10 minute break every 2 to 3 hours",
          "Use different playlists or queues instead of one static setup",
          "Enjoy the music naturally instead of chasing perfect repetition"
        ],
        preview: "breaks"
      }
    ]
  },
  {
    id: "engagement",
    eyebrow: "Boost cleanly",
    title: "Use engagement the right way",
    shortTitle: "Engage",
    summary: "YouTube engagement still helps discovery and trending, but it needs to look real and readable, not spammy.",
    steps: [
      {
        id: "youtube-engagement-like",
        title: "Like, comment, reply, and share naturally",
        description:
          "After a full watch, like the MV, leave a short normal comment, reply to other users, and share the official link where it makes sense.",
        hints: [
          "Leave meaningful comments instead of spam walls",
          "Avoid emoji-heavy or copy-paste comment flooding",
          "Share the official MV link, not reposted copies"
        ],
        preview: "engage"
      },
      {
        id: "youtube-engagement-premiere",
        title: "Use premieres, embeds, and official sites",
        description:
          "Premieres still matter a lot for early momentum, and embedded official videos can count too if the user intentionally clicks to watch them.",
        hints: [
          "Join the premiere if you can",
          "Official embeds are useful when you click them manually",
          "Keep the official MV as the center of the session"
        ],
        preview: "premiere"
      }
    ]
  },
  {
    id: "avoid",
    eyebrow: "Filter risks",
    title: "Avoid obvious low-quality behavior",
    shortTitle: "Avoid",
    summary: "A lot of YouTube filtering comes from the same few mistakes: muting, looping, tab abuse, fake location tricks, and constant pattern repetition.",
    note: "If the session looks like a bot script, YouTube can slow, freeze, or filter parts of it.",
    steps: [
      {
        id: "youtube-avoid-loop",
        title: "No loops, no refresh spam, no fake-location tricks",
        description:
          "Do not loop the same video, do not sit there refreshing repeatedly, and do not use VPNs or incognito-style tricks to fake freshness.",
        hints: [
          "No looping the same MV",
          "No repeated refresh spam",
          "No VPN or other fake-location methods"
        ],
        preview: "avoid"
      },
      {
        id: "youtube-avoid-competition",
        title: "Do not feed competing videos during the launch window",
        description:
          "During the first 24 to 48 hours, avoid lyric videos, reactions, mirrors, or fan-uploaded copies that can compete with the official recommendation chain.",
        hints: [
          "Avoid reaction and lyric videos in the launch window",
          "Do not upload the MV anywhere yourself",
          "Keep official uploads winning the recommendation race"
        ],
        preview: "compete"
      }
    ]
  }
]

const YOUTUBE_FACTS = [
  {
    label: "Main rule",
    value: "Stream like a real human"
  },
  {
    label: "Playback",
    value: "Full video, 720p+, volume on"
  },
  {
    label: "Day one",
    value: "Manual search first, queue over playlists"
  },
  {
    label: "Sustain",
    value: "Breaks and variety beat burnout"
  }
]

function getSectionIcon(sectionId: string) {
  switch (sectionId) {
    case "official":
      return <Star className="h-4 w-4" />
    case "playback":
      return <Tv className="h-4 w-4" />
    case "first24":
      return <Clock3 className="h-4 w-4" />
    case "ongoing":
      return <ListVideo className="h-4 w-4" />
    case "engagement":
      return <MessageSquareText className="h-4 w-4" />
    default:
      return <ShieldAlert className="h-4 w-4" />
  }
}

function YouTubeWindow({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/15 bg-[rgba(18,10,12,0.95)] shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(55,15,21,0.98),rgba(21,10,13,0.98))] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff3131]" />
          <span className="h-3 w-3 rounded-full bg-white/25" />
          <span className="h-3 w-3 rounded-full bg-white/18" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-100/80">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function YouTubePhone({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[16.8rem] rounded-[1.85rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-2.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]">
      <div className="mx-auto mb-2.5 h-1.5 w-16 rounded-full bg-white/15" />
      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[rgba(13,8,10,0.96)]">
        {children}
      </div>
    </div>
  )
}

function YouTubePreview({ kind }: { kind: string }) {
  switch (kind) {
    case "official":
      return (
        <YouTubeWindow title="Official Channels">
          <div className="space-y-3">
            {[
              ["HYBE LABELS", "Main MV upload lane"],
              ["BANGTANTV", "Official BTS channel"],
              ["Legacy official upload", "Only for older catalog when needed"]
            ].map(([title, copy], index) => (
              <div
                key={title}
                className={`rounded-[1.15rem] border px-4 py-3 ${
                  index === 0 ? "border-rose-300/20 bg-rose-300/10" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    case "search":
      return (
        <YouTubeWindow title="Manual Search">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[1.2rem] bg-white px-3 py-2 text-slate-900">
              <Search className="h-4 w-4 text-slate-500" />
              <span className="text-sm">BTS ARIRANG official MV</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["BTS [title]", "BTS [title] official", "BTS [title] MV", "BTS [title] HYBE LABELS"].map((term) => (
                <div key={term} className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                  {term}
                </div>
              ))}
            </div>
          </div>
        </YouTubeWindow>
      )
    case "quality":
      return (
        <YouTubePhone>
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-100/80">Playback quality</p>
          </div>
          <div className="space-y-3 p-4">
            {[
              ["Quality", "720p+"],
              ["Speed", "1x"],
              ["Volume", "50%+"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-sm font-medium text-white">{label}</p>
                <span className="rounded-full bg-rose-300/15 px-3 py-1 text-xs font-semibold text-rose-100">{value}</span>
              </div>
            ))}
          </div>
        </YouTubePhone>
      )
    case "screen":
      return (
        <YouTubeWindow title="Viewing Mode">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Default", "Safe"],
              ["Theater", "Safe"],
              ["Full screen", "Safe"]
            ].map(([title, tag]) => (
              <div key={title} className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4 text-center">
                <Tv className="mx-auto h-5 w-5 text-rose-200" />
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">{tag}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-[1.15rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-50">
            Avoid multiple tabs, duplicate browsers, or several devices on the same MV at once.
          </div>
        </YouTubeWindow>
      )
    case "manual":
      return (
        <YouTubeWindow title="First 24h Method">
          <div className="space-y-3">
            {[
              "Search manually",
              "Open official upload",
              "Watch fully",
              "Use Queue if needed"
            ].map((label) => (
              <div key={label} className="flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <PlayCircle className="h-4 w-4 shrink-0 text-rose-200" />
                <p className="text-sm text-white/78">{label}</p>
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    case "fillers":
      return (
        <YouTubeWindow title="Break the Pattern">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Focus MV", "4 to 6x / hour max"],
              ["Bangtan Bomb", "Filler"],
              ["Another BTS MV", "Filler"],
              ["Audio / other video", "Filler"]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    case "cycle":
      return (
        <YouTubeWindow title="Sustainable Cycle">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Full album", "No skips"],
              ["Short playlist", "30 to 60 mins"],
              ["Rotate back", "Keep the session fresh"]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4">
                <ListVideo className="h-4 w-4 text-rose-200" />
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    case "breaks":
      return (
        <YouTubeWindow title="Take Breaks">
          <div className="space-y-3">
            {[
              "5 to 10 minute break every 2 to 3 hours",
              "Use different playlists or queues",
              "Do not copy the exact same pattern all day"
            ].map((label) => (
              <div key={label} className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/78">
                {label}
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    case "engage":
      return (
        <YouTubePhone>
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-100/80">Engage naturally</p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {[
              { label: "Like", icon: <Heart className="h-4 w-4" /> },
              { label: "Comment", icon: <MessageSquareText className="h-4 w-4" /> },
              { label: "Reply", icon: <UserRound className="h-4 w-4" /> },
              { label: "Share", icon: <ArrowRight className="h-4 w-4" /> }
            ].map((item) => (
              <div key={item.label} className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4 text-center text-white">
                <div className="flex justify-center text-rose-200">{item.icon}</div>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </YouTubePhone>
      )
    case "premiere":
      return (
        <YouTubeWindow title="Premiere + Embeds">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.15rem] border border-rose-300/20 bg-rose-300/10 p-4">
              <p className="text-sm font-semibold text-white">Premiere jump-in</p>
              <p className="mt-2 text-sm leading-6 text-white/70">Show up early and use every real account you prepared.</p>
            </div>
            <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">Official embeds</p>
              <p className="mt-2 text-sm leading-6 text-white/70">Embeds can help when you manually click to watch.</p>
            </div>
          </div>
        </YouTubeWindow>
      )
    case "avoid":
      return (
        <YouTubeWindow title="Avoid Filters">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "No loop",
              "No refresh spam",
              "No VPN",
              "No bot-like repetition"
            ].map((label) => (
              <div key={label} className="rounded-[1.15rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-medium text-rose-50">
                {label}
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    case "compete":
      return (
        <YouTubeWindow title="Protect the Official MV">
          <div className="space-y-3">
            {[
              "Avoid reaction videos in the launch window",
              "Avoid lyric videos and mirrors early",
              "Do not reupload the MV anywhere"
            ].map((label) => (
              <div key={label} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
                <p className="text-sm leading-6 text-white/75">{label}</p>
              </div>
            ))}
          </div>
        </YouTubeWindow>
      )
    default:
      return null
  }
}

export function YouTubeGuide() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [initialStepId, setInitialStepId] = useState<string | null>(null)

  const openWalkthrough = (sectionId?: string) => {
    setInitialStepId(sectionId ? YOUTUBE_SECTIONS.find((section) => section.id === sectionId)?.steps[0]?.id ?? null : null)
    setWalkthroughOpen(true)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(52,13,19,0.98),rgba(8,8,10,1))] shadow-[0_35px_120px_-45px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,71,87,0.34),transparent_65%)]" />
          <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-rose-500/12 blur-3xl" />
          <div className="absolute left-[-7rem] bottom-[-4rem] h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-100">
                <ServiceBrandLogo service="youtube" className="h-4 w-4" />
                YouTube guide
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-rose-200/80">Quick read + guided mode</p>
                <h1 className="font-heading text-4xl font-semibold uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  YouTube
                  <span className="block text-transparent [text-shadow:_0_8px_24px_rgba(255,71,87,0.28)] [-webkit-text-stroke:1px_rgba(255,226,230,0.74)]">
                    MV Streaming
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/[0.74] sm:text-base">
                  YouTube is still huge for milestones, trending, music-show support, and long-term discovery. The whole
                  trick is simple: stream like a real person, not a loop machine.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <GuideModalCtaButton
                  accent="youtube"
                  label="Open interactive walkthrough"
                  onClick={() => openWalkthrough()}
                  icon={<ServiceBrandLogo service="youtube" className="h-4 w-4" />}
                />
                <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                  Readable list first. Guided mode lives in a compact modal.
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {YOUTUBE_FACTS.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.45]">{fact.label}</p>
                  <p className="mt-3 text-sm font-medium leading-6 text-white">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.6rem] border border-rose-300/20 bg-rose-300/10 p-5">
              <div className="flex items-center gap-3 text-rose-100">
                <ServiceBrandLogo service="youtube" className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Still important</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Milestones, trending, and music shows</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.78]">
                Even with the January 2026 Billboard change, YouTube still matters heavily for visibility and campaign momentum.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center gap-3 text-white/80">
                <Volume2 className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Playback</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Full watch, volume on, 720p+</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.72]">
                Skip the low-quality habits that get views slowed or filtered.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center gap-3 text-white/80">
                <Smartphone className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Clean setup</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">One device + one browser/tab</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.72]">
                Multiple tabs or duplicate playback is one of the easiest ways to make the session look fake.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            {YOUTUBE_SECTIONS.map((section) => (
              <article
                key={section.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.05)] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-300 text-slate-950">
                      {getSectionIcon(section.id)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">{section.eyebrow}</p>
                      <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">{section.title}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/[0.72]">{section.summary}</p>
                    </div>
                  </div>
                  <GuideModalCtaButton
                    accent="youtube"
                    label="Walk me through it"
                    onClick={() => openWalkthrough(section.id)}
                    compact
                    icon={<ServiceBrandLogo service="youtube" className="h-3.5 w-3.5" />}
                  />
                </div>

                <div className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-2">
                  {section.steps.map((step, index) => (
                    <div key={step.id} className="rounded-[1.4rem] border border-white/10 bg-[#180d10]/88 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-300 text-sm font-semibold text-slate-950">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-white/[0.72]">{step.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {step.hints.map((hint) => (
                          <span key={hint} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/75">
                            {hint}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {section.note ? (
                  <div className="border-t border-white/10 px-5 py-4 sm:px-6">
                    <div className="rounded-[1.2rem] border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-6 text-rose-50">
                      {section.note}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        </div>
      </div>

      <GuideWalkthroughModal
        accent="youtube"
        guideTitle="YouTube MV Streaming Guide"
        open={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
        sections={YOUTUBE_SECTIONS}
        initialStepId={initialStepId}
        renderPreview={(preview) => <YouTubePreview kind={preview} />}
      />
    </>
  )
}
