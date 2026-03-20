import { unstable_cache } from "next/cache"
import { cacheTags, sharedCacheRevalidateSeconds } from "@/platform/cache/shared"

export type GuideTone = "purple" | "rose" | "saffron" | "teal"

export type CoreGuideId = "mv" | "streaming" | "purchasing" | "charts"
export type PlatformGuideId = "youtube" | "spotify" | "amazon" | "apple"

type BaseGuideSummary = {
  title: string
  navLabel: string
  detail: string
  summary: string
  navSummary: string
  highlights: string[]
  tone: GuideTone
  href: string
}

export type CoreGuideSummary = BaseGuideSummary & {
  category: "core"
  id: CoreGuideId
}

export type PlatformGuideSummary = BaseGuideSummary & {
  category: "platform"
  id: PlatformGuideId
  service: PlatformGuideId
}

export type GuideQuickReadView = CoreGuideSummary | PlatformGuideSummary

export const DEFAULT_CORE_GUIDE_ID: CoreGuideId = "streaming"
export const DEFAULT_PLATFORM_GUIDE_ID: PlatformGuideId = "youtube"

export const CORE_GUIDE_LIBRARY: CoreGuideSummary[] = [
  {
    category: "core",
    id: "mv",
    title: "Music video streaming",
    navLabel: "Music Video Guide",
    detail: "All-platform rules",
    summary:
      "Use this before any MV push. It covers what counts, what kills views, and how first-day YouTube traffic works.",
    navSummary: "Official uploads, manual plays, and first-day MV habits.",
    highlights: [
      "Official uploads only",
      "US plays matter for Billboard",
      "Manual play beats playlist loops"
    ],
    tone: "rose",
    href: "/guide?core=mv#core-guide-library"
  },
  {
    category: "core",
    id: "streaming",
    title: "Streaming",
    navLabel: "Streaming Guide",
    detail: "All-platform rules",
    summary:
      "This is the baseline rulebook for music streaming across platforms before you jump into Apple, Amazon, Spotify, or anything else.",
    navSummary: "Baseline rules before any Spotify, Apple, or Amazon session.",
    highlights: ["Act like a human", "No VPN", "30+ seconds is the baseline"],
    tone: "purple",
    href: "/guide?core=streaming#core-guide-library"
  },
  {
    category: "core",
    id: "purchasing",
    title: "Purchasing",
    navLabel: "Buying Guide",
    detail: "All-platform rules",
    summary:
      "Use this for digital and physical buying rules so purchases count cleanly for charts and certifications.",
    navSummary: "Digital and physical buying rules that still count cleanly.",
    highlights: [
      "1 digital copy per customer",
      "4 physical copies per week",
      "Download digital purchases to a computer"
    ],
    tone: "saffron",
    href: "/guide?core=purchasing#core-guide-library"
  },
  {
    category: "core",
    id: "charts",
    title: "Charts criteria",
    navLabel: "Chart Rules",
    detail: "All-platform rules",
    summary:
      "Use this when people ask what actually moves which chart, what the unit math means, or why different goals matter.",
    navSummary: "What moves Hot 100, Billboard 200, and RIAA goals.",
    highlights: [
      "Hot 100 = streaming-heavy singles",
      "Billboard 200 = sales + TEA + SEA",
      "RIAA uses its own unit rules"
    ],
    tone: "teal",
    href: "/guide?core=charts#core-guide-library"
  }
]

export const PLATFORM_GUIDE_LIBRARY: PlatformGuideSummary[] = [
  {
    category: "platform",
    id: "youtube",
    service: "youtube",
    title: "YouTube MV Streaming",
    navLabel: "YouTube MV Guide",
    detail: "MV streaming, first 24 hours, and clean playback",
    summary:
      "YouTube is still huge for milestones, trending, music-show support, and long-term discovery. The whole trick is simple: stream like a real person, not a loop machine.",
    navSummary: "MV-specific playback rules and first-day habits.",
    highlights: [
      "Full video, 720p+, volume on",
      "Manual search first",
      "Breaks and variety beat burnout"
    ],
    tone: "rose",
    href: "/guide?platform=youtube#platform-guide-library"
  },
  {
    category: "platform",
    id: "spotify",
    service: "spotify",
    title: "Spotify Streaming Guide",
    navLabel: "Spotify Guide",
    detail: "Playlist rules, chart caps, and safe streaming",
    summary:
      "Keep this one simple for regular users: read the rules clearly first, then open the compact walkthrough if you want the phone-style guided version.",
    navSummary: "Playlist spacing, chart caps, and clean session flow.",
    highlights: [
      "Official app or web + real account",
      "3 to 5 fillers between focus plays",
      "20 chart-focused plays per version daily"
    ],
    tone: "teal",
    href: "/guide?platform=spotify#platform-guide-library"
  },
  {
    category: "platform",
    id: "amazon",
    service: "amazon",
    title: "Amazon Music Guide",
    navLabel: "Amazon Music Guide",
    detail: "Streaming, buying, and market availability",
    summary:
      "Keep the page simple for regular users: read the rules in plain language first, then open the smaller modal walkthrough if you want the guided version.",
    navSummary: "Country availability plus separate streaming and buying paths.",
    highlights: [
      "Prime Music + Music Unlimited matter most",
      "Buying path is separate from streaming",
      "Check country availability first"
    ],
    tone: "saffron",
    href: "/guide?platform=amazon#platform-guide-library"
  },
  {
    category: "platform",
    id: "apple",
    service: "apple",
    title: "Apple Music For Android",
    navLabel: "Apple Music Guide",
    detail: "Android install, Apple ID, and subscription flow",
    summary:
      "Keep the main page simple for first-time users: read the steps normally, then open the walkthrough if you want the smaller, phone-style interactive version.",
    navSummary: "Android install, Apple ID setup, and browser billing.",
    highlights: [
      "Android app + web browser",
      "Install in app, pay in browser",
      "Family purchase is iOS-only"
    ],
    tone: "purple",
    href: "/guide?platform=apple#platform-guide-library"
  }
]

const coreGuideById = Object.fromEntries(
  CORE_GUIDE_LIBRARY.map((guide) => [guide.id, guide])
) as Record<CoreGuideId, CoreGuideSummary>

const platformGuideById = Object.fromEntries(
  PLATFORM_GUIDE_LIBRARY.map((guide) => [guide.id, guide])
) as Record<PlatformGuideId, PlatformGuideSummary>

export const GUIDE_QUICK_READ_LIBRARY: GuideQuickReadView[] = [
  coreGuideById.streaming,
  coreGuideById.mv,
  coreGuideById.charts,
  coreGuideById.purchasing,
  platformGuideById.spotify,
  platformGuideById.youtube,
  platformGuideById.amazon,
  platformGuideById.apple
]

const listGuideQuickReadsCached = unstable_cache(async () => GUIDE_QUICK_READ_LIBRARY, ["guides:quick-reads:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.guides]
})

export async function listGuideQuickReads() {
  return listGuideQuickReadsCached()
}

export function resolveCoreGuideId(value: string | null | undefined): CoreGuideId | null {
  switch (value) {
    case "mv":
    case "streaming":
    case "purchasing":
    case "charts":
      return value
    default:
      return null
  }
}

export function resolvePlatformGuideId(value: string | null | undefined): PlatformGuideId | null {
  switch (value) {
    case "youtube":
    case "spotify":
    case "amazon":
    case "apple":
      return value
    default:
      return null
  }
}
