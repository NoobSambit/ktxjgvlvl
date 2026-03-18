"use client"

import { type ReactNode, useState } from "react"
import {
  CheckCircle2,
  Download,
  Globe2,
  Headphones,
  ListMusic,
  MonitorSmartphone,
  PauseCircle,
  PlayCircle,
  Plus,
  Repeat,
  Search,
  ShoppingCart,
  Shuffle,
  SkipForward
} from "lucide-react"
import { GuideModalCtaButton } from "@/components/guides/guide-modal-cta-button"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { GuideWalkthroughModal, type GuideWalkthroughSection } from "@/components/guides/guide-walkthrough-modal"

type MarketGroup = {
  id: string
  label: string
  services: string[]
  note?: string
}

type PlaybookStep = {
  id: string
  title: string
  description: string
  hints: string[]
}

const MARKET_GROUPS: MarketGroup[] = [
  {
    id: "india",
    label: "India",
    services: ["Amazon Prime Music"],
    note: "India is limited to Prime Music in the reference screenshots."
  },
  {
    id: "united-states",
    label: "United States",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store",
      "Music Library Service",
      "AutoRip"
    ]
  },
  {
    id: "canada",
    label: "Canada",
    services: ["Amazon Music Unlimited", "Amazon Prime Music", "Amazon Music (free with ads)"]
  },
  {
    id: "united-kingdom",
    label: "United Kingdom",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store",
      "Music Library Service",
      "AutoRip"
    ]
  },
  {
    id: "france",
    label: "France",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store",
      "Music Library Service",
      "AutoRip"
    ]
  },
  {
    id: "germany-austria",
    label: "Germany and Austria",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store",
      "Music Library Service",
      "AutoRip"
    ]
  },
  {
    id: "italy",
    label: "Italy",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store",
      "Music Library Service",
      "AutoRip"
    ]
  },
  {
    id: "spain",
    label: "Spain",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store",
      "Music Library Service",
      "AutoRip"
    ]
  },
  {
    id: "switzerland",
    label: "Switzerland",
    services: ["Digital Music Store", "Music Library Service", "AutoRip"]
  },
  {
    id: "japan",
    label: "Japan",
    services: [
      "Amazon Music Unlimited",
      "Amazon Prime Music",
      "Amazon Music (free with ads)",
      "Digital Music Store"
    ]
  },
  {
    id: "latam-group",
    label: "Argentina, Bolivia, Chile, Colombia, Costa Rica, Dominican Republic, Ecuador, El Salvador, Guatemala, Honduras, Nicaragua, Panama, Paraguay, Peru, and Uruguay",
    services: ["Amazon Music Unlimited", "Amazon Music (free with ads)"],
    note: "Free with ads is specifically called out for Argentina, Colombia, and Chile."
  },
  {
    id: "europe-unlimited",
    label: "Belgium, Bulgaria, Cyprus, Czech Republic, Estonia, Finland, Greece, Hungary, Iceland, Ireland, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Slovakia, and Sweden",
    services: ["Amazon Music Unlimited"]
  },
  {
    id: "australia",
    label: "Australia",
    services: ["Amazon Music Unlimited", "Amazon Prime Music", "Amazon Music (free with ads)"]
  },
  {
    id: "new-zealand",
    label: "New Zealand",
    services: ["Amazon Music Unlimited"]
  },
  {
    id: "mexico",
    label: "Mexico",
    services: ["Amazon Music Unlimited", "Amazon Prime Music", "Amazon Music (free with ads)"]
  },
  {
    id: "brazil",
    label: "Brazil",
    services: ["Amazon Music Unlimited", "Amazon Prime Music", "Amazon Music (free with ads)"]
  }
]

const STREAMING_STEPS: PlaybookStep[] = [
  {
    id: "amazon-streaming-playlist",
    title: "Search the song and use Add to Playlist",
    description: "Search the track, open the menu, and use Add to Playlist. The screenshot you shared makes it clear that Add to My Music is not the move here.",
    hints: ["Make playlists before a long session", "Having an Amazon account is necessary", "Use Add to Playlist, not Add to My Music"]
  },
  {
    id: "amazon-streaming-plus",
    title: "Keep the plus sign next to the song",
    description: "The plus sign means the song is not in your library. It can still be inside your playlist, which is the distinction this guide needs users to understand.",
    hints: ["Delete purchases before streaming", "Do not add the song to your library", "Plus means not in library, not missing from playlist"]
  },
  {
    id: "amazon-streaming-behavior",
    title: "Stream naturally and use fillers",
    description: "No looping, no shuffling. Interact with the playlist, skip or pause sometimes, switch playlists, and add 2 or 3 fillers between target songs.",
    hints: ["Avoid bot-like behavior", "Skip, pause, and switch playlists sometimes", "Shazam while streaming if you want more interaction"]
  }
]

const BUYING_STEPS: PlaybookStep[] = [
  {
    id: "amazon-buying-search",
    title: "Sign in and look for the purchase option",
    description: "Buying also needs an Amazon account. Search the song and look specifically for the purchase action instead of only the streaming result.",
    hints: ["Use the correct storefront for your region", "Do not use a VPN", "Buying appears as its own action"]
  },
  {
    id: "amazon-buying-play",
    title: "Purchase the song and play it once",
    description: "After purchase, give the track one clean play. That keeps the buying flow aligned with the notes you shared.",
    hints: ["Confirm the purchase on the correct account", "Play the bought track once after payment", "Make sure the purchase finished before leaving"]
  },
  {
    id: "amazon-buying-download",
    title: "Download it, then delete before streaming",
    description: "Download the purchase, then remove it before you switch into streaming mode so the streaming setup stays clean.",
    hints: ["Download after the purchase succeeds", "Delete the purchase before streaming sessions", "Keep VPNs completely out of this flow"]
  }
]

const AMAZON_SECTIONS: GuideWalkthroughSection[] = [
  {
    id: "availability",
    eyebrow: "Start here",
    title: "Check service availability first",
    shortTitle: "Availability",
    summary: "Amazon Music does not offer the same services in every country, so users should check their market before anything else.",
    steps: [
      {
        id: "amazon-availability-market",
        title: "Check what your country gets",
        description: "Service availability changes by market. India is limited to Prime Music in the reference, while countries like the US and UK carry a larger Amazon Music stack.",
        hints: ["India only shows Prime Music in the reference", "Digital Store is not available everywhere", "The full market list stays in the quick-read guide below"],
        preview: "markets"
      },
      {
        id: "amazon-availability-modes",
        title: "Separate buying from paid streaming",
        description: "Amazon Music and Digital Store are the buying path. Prime Music and Music Unlimited are the paid streaming path with higher weightage.",
        hints: ["Do not mix buying rules with streaming rules", "Use the app or the browser with the same account", "Prime + Unlimited are the stronger streaming surfaces"],
        preview: "modes"
      }
    ]
  },
  {
    id: "streaming",
    eyebrow: "Streaming rules",
    title: "Stream the right way",
    shortTitle: "Streaming",
    summary: "Playlist first, library clean, and human behavior all matter here.",
    steps: [
      {
        id: "amazon-modal-playlist",
        title: STREAMING_STEPS[0].title,
        description: STREAMING_STEPS[0].description,
        hints: STREAMING_STEPS[0].hints,
        preview: "playlist-menu"
      },
      {
        id: "amazon-modal-plus",
        title: STREAMING_STEPS[1].title,
        description: STREAMING_STEPS[1].description,
        hints: STREAMING_STEPS[1].hints,
        preview: "plus-sign"
      },
      {
        id: "amazon-modal-behavior",
        title: STREAMING_STEPS[2].title,
        description: STREAMING_STEPS[2].description,
        hints: STREAMING_STEPS[2].hints,
        preview: "clean-behavior"
      }
    ]
  },
  {
    id: "buying",
    eyebrow: "Buying rules",
    title: "Buy the right way",
    shortTitle: "Buying",
    summary: "Purchase, play once, download, then delete before moving into streaming mode.",
    steps: [
      {
        id: "amazon-modal-buy-search",
        title: BUYING_STEPS[0].title,
        description: BUYING_STEPS[0].description,
        hints: BUYING_STEPS[0].hints,
        preview: "purchase-search"
      },
      {
        id: "amazon-modal-buy-finish",
        title: BUYING_STEPS[1].title,
        description: BUYING_STEPS[1].description,
        hints: BUYING_STEPS[1].hints,
        preview: "purchase-finish"
      },
      {
        id: "amazon-modal-buy-cleanup",
        title: BUYING_STEPS[2].title,
        description: BUYING_STEPS[2].description,
        hints: BUYING_STEPS[2].hints,
        preview: "purchase-finish"
      }
    ]
  }
]

const AMAZON_FACTS = [
  {
    label: "Higher weightage",
    value: "Prime Music + Music Unlimited"
  },
  {
    label: "Buying path",
    value: "Amazon Music + Digital Store"
  },
  {
    label: "Works on",
    value: "Apple, Android, desktop, browser"
  }
]

function AmazonWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#131110] shadow-[0_30px_80px_-35px_rgba(0,0,0,0.92)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(90deg,rgba(255,179,71,0.28),rgba(255,138,0,0.08))] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-white/25" />
          <span className="h-3 w-3 rounded-full bg-white/15" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function AmazonPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[17rem] rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] p-2.5 shadow-[0_35px_80px_-35px_rgba(0,0,0,0.95)]">
      <div className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#121010]">{children}</div>
    </div>
  )
}

function AmazonPreview({ kind }: { kind: string }) {
  switch (kind) {
    case "markets":
      return (
        <AmazonWindow title="Availability snapshot">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "India", services: "Prime Music" },
              { label: "United States", services: "Unlimited, Prime, Free, Digital Store" },
              { label: "United Kingdom", services: "Unlimited, Prime, Free, Digital Store" },
              { label: "Europe group", services: "Unlimited only in several markets" }
            ].map((market) => (
              <div key={market.label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">{market.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/[0.68]">{market.services}</p>
              </div>
            ))}
          </div>
        </AmazonWindow>
      )
    case "modes":
      return (
        <AmazonWindow title="Mode split">
          <div className="space-y-3">
            <div className="rounded-[1.3rem] border border-amber-300/20 bg-amber-300/10 p-4">
              <div className="flex items-center gap-3 text-amber-100">
                <ShoppingCart className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Buying</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">Amazon Music + Digital Store</p>
            </div>
            <div className="rounded-[1.3rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="flex items-center gap-3 text-emerald-100">
                <Headphones className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Paid streaming</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">Prime Music + Music Unlimited</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-white/75">
                <MonitorSmartphone className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Surfaces</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">App + web browser</p>
            </div>
          </div>
        </AmazonWindow>
      )
    case "playlist-menu":
      return (
        <AmazonPhoneFrame>
          <div className="space-y-5 bg-[#151212] p-4 text-white">
            <div className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3">
              <Search className="h-5 w-5 text-white/[0.55]" />
              <span className="text-lg text-white/90">Vibe by jimin</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Top result</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[linear-gradient(135deg,#2d251f,#0f0f0f)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-medium">VIBE (feat. Jimin of BTS)</p>
                  <p className="truncate text-sm text-white/[0.55]">Song · TAEYANG feat. Jimin</p>
                </div>
                <Plus className="h-8 w-8 text-white/75" />
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[#273046] p-5 text-left text-white shadow-[0_25px_50px_-30px_rgba(0,0,0,0.9)]">
              <p className="text-lg font-medium">VIBE (feat. Jimin of BTS)</p>
              <div className="mt-5 space-y-4 text-base">
                <p>Play Similar Music</p>
                <p>Add to Play Queue</p>
                <p>Play Next</p>
                <p className="text-white/[0.4]">Add to My Music</p>
                <p className="font-semibold text-amber-300">Add to Playlist</p>
              </div>
            </div>
          </div>
        </AmazonPhoneFrame>
      )
    case "plus-sign":
      return (
        <AmazonPhoneFrame>
          <div className="space-y-6 bg-[#151212] p-4 text-white">
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-slate-900">
              <Search className="h-5 w-5 text-slate-500" />
              <span className="text-lg">Vibe by jimin</span>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Top result</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[linear-gradient(135deg,#2d251f,#0f0f0f)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-medium">VIBE (feat. Jimin of BTS)</p>
                  <p className="truncate text-sm text-white/[0.55]">Song · TAEYANG feat. Jimin</p>
                </div>
                <div className="flex items-center gap-3">
                  <Plus className="h-8 w-8 text-white" />
                  <span className="rounded-full border border-amber-300/[0.35] bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                    Not in library
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-[1.3rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-100">
              Plus sign visible = the song is not in your library. It can still be inside your playlist.
            </div>
          </div>
        </AmazonPhoneFrame>
      )
    case "clean-behavior":
      return (
        <AmazonWindow title="Stream clean">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-red-300/15 bg-red-300/10 p-4">
                <div className="flex items-center gap-2 text-red-100">
                  <Repeat className="h-4 w-4" />
                  <span className="text-sm font-semibold">No loop</span>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-red-300/15 bg-red-300/10 p-4">
                <div className="flex items-center gap-2 text-red-100">
                  <Shuffle className="h-4 w-4" />
                  <span className="text-sm font-semibold">No shuffle</span>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-emerald-300/15 bg-emerald-300/10 p-4">
                <div className="flex items-center gap-2 text-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">Use fillers</span>
                </div>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="space-y-3">
                {["Target track", "Filler 01", "Filler 02", "Target track", "Switch playlist"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-white/80">
                    <span>{item}</span>
                    {item === "Switch playlist" ? <SkipForward className="h-4 w-4 text-amber-200" /> : <PauseCircle className="h-4 w-4 text-white/40" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AmazonWindow>
      )
    case "purchase-search":
      return (
        <AmazonWindow title="Purchase result">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-slate-900">
              <Search className="h-5 w-5 text-slate-500" />
              <span className="text-sm">Search the track to buy</span>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[linear-gradient(135deg,#3c2d19,#141312)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xl font-medium text-white">VIBE (feat. Jimin of BTS)</p>
                  <p className="text-sm text-white/[0.55]">Digital purchase result</p>
                </div>
                <div className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900">Buy MP3</div>
              </div>
            </div>
          </div>
        </AmazonWindow>
      )
    default:
      return (
        <AmazonWindow title="Post-purchase flow">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-emerald-200">
                <PlayCircle className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">After buying</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Play once</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.65]">Give the bought track one clean play before moving on.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3 text-amber-200">
                <Download className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Then</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Download and delete</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.65]">Download the purchase, then delete it before streaming sessions.</p>
            </div>
          </div>
        </AmazonWindow>
      )
  }
}

function PlaybookCard({
  title,
  summary,
  steps,
  onOpen
}: {
  title: string
  summary: string
  steps: PlaybookStep[]
  onOpen: () => void
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.05)] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">Quick read</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/[0.72]">{summary}</p>
        </div>
        <GuideModalCtaButton
          accent="amazon"
          label="Open walkthrough"
          onClick={onOpen}
          compact
          icon={<ServiceBrandLogo service="amazon" className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.id} className="rounded-[1.4rem] border border-white/10 bg-[#151212] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-sm font-semibold text-slate-950">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/[0.7]">{step.description}</p>
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
    </article>
  )
}

export function AmazonMusicGuide() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [initialStepId, setInitialStepId] = useState<string | null>(null)

  const openWalkthrough = (sectionId?: string) => {
    setInitialStepId(sectionId ? AMAZON_SECTIONS.find((section) => section.id === sectionId)?.steps[0]?.id ?? null : null)
    setWalkthroughOpen(true)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(26,21,19,0.98),rgba(8,8,8,1))] shadow-[0_35px_120px_-45px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,184,77,0.26),transparent_65%)]" />
          <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute left-[-8rem] bottom-[-3rem] h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
                <ServiceBrandLogo service="amazon" className="h-4 w-4" />
                Amazon Music guide
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-200/80">Quick read + guided mode</p>
                <h1 className="font-heading text-4xl font-semibold uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  Amazon
                  <span className="block text-transparent [text-shadow:_0_8px_24px_rgba(255,184,77,0.22)] [-webkit-text-stroke:1px_rgba(255,224,178,0.72)]">
                    Music Guide
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/[0.72] sm:text-base">
                  Keep the page simple for regular users: read the rules in plain language first, then open the smaller
                  modal walkthrough if you want the guided version.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <GuideModalCtaButton
                  accent="amazon"
                  label="Open interactive walkthrough"
                  onClick={() => openWalkthrough()}
                  icon={<ServiceBrandLogo service="amazon" className="h-4 w-4" />}
                />
                <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                  Readable list first. Guided mode lives in a compact modal.
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {AMAZON_FACTS.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.45]">{fact.label}</p>
                  <p className="mt-3 text-sm font-medium leading-6 text-white">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>

          <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.05)] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-200 text-slate-950">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">Quick read</p>
                    <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">Country availability</h2>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/[0.72]">
                  Amazon services change by market. This is the full readable list based on the screenshots you shared, so users can scan it without opening the walkthrough.
                </p>
              </div>
              <GuideModalCtaButton
                accent="amazon"
                label="Walk me through availability"
                onClick={() => openWalkthrough("availability")}
                compact
                icon={<ServiceBrandLogo service="amazon" className="h-3.5 w-3.5" />}
              />
            </div>

            <div className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-2">
              {MARKET_GROUPS.map((market) => (
                <div key={market.id} className="rounded-[1.4rem] border border-white/10 bg-[#151212] p-4">
                  <p className="text-lg font-semibold text-white">{market.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {market.services.map((service) => (
                      <span
                        key={service}
                        className={`rounded-full px-3 py-1 text-xs ${
                          service.includes("Unlimited")
                            ? "bg-emerald-300/15 text-emerald-100"
                            : service.includes("Digital")
                              ? "bg-amber-300/15 text-amber-100"
                              : "bg-white/[0.08] text-white/75"
                        }`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                  {market.note ? (
                    <p className="mt-3 text-sm leading-6 text-white/[0.65]">{market.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[1.6rem] border border-amber-300/20 bg-amber-300/10 p-5">
              <div className="flex items-center gap-3 text-amber-100">
                <ShoppingCart className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Buying</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Amazon Music + Digital Store</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.78]">Use this route for purchases, then play once, download, and delete before streaming.</p>
            </div>
            <div className="rounded-[1.6rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <div className="flex items-center gap-3 text-emerald-100">
                <Headphones className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Paid streaming</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Prime Music + Music Unlimited</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.8]">These are the paid streaming surfaces called out as the higher-weightage route.</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="flex items-center gap-3 text-white/80">
                <MonitorSmartphone className="h-5 w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Device access</p>
              </div>
              <p className="mt-4 text-lg font-semibold text-white">Apple, Android, desktop, browser</p>
              <p className="mt-2 text-sm leading-6 text-white/[0.72]">App or browser both work, as long as the account flow stays clean.</p>
            </div>
          </section>

          <PlaybookCard
            title="Streaming playbook"
            summary="These are the simple rules users should follow when they are streaming on Amazon Music."
            steps={STREAMING_STEPS}
            onOpen={() => openWalkthrough("streaming")}
          />

          <PlaybookCard
            title="Buying playbook"
            summary="These are the simple rules users should follow when they are purchasing tracks on Amazon."
            steps={BUYING_STEPS}
            onOpen={() => openWalkthrough("buying")}
          />
        </div>
      </div>

      <GuideWalkthroughModal
        accent="amazon"
        guideTitle="Amazon Music"
        open={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
        sections={AMAZON_SECTIONS}
        initialStepId={initialStepId}
        renderPreview={(preview) => <AmazonPreview kind={preview} />}
      />
    </>
  )
}
