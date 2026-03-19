"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, Globe2, PlayCircle, ShoppingBag, Sparkles, Tv, X } from "lucide-react"
import { GuideModalCtaButton } from "@/components/guides/guide-modal-cta-button"
import {
  CORE_GUIDE_LIBRARY,
  DEFAULT_CORE_GUIDE_ID,
  type CoreGuideId
} from "@/modules/guides/service"

type CoreGuide = {
  id: CoreGuideId
  eyebrow: string
  title: string
  summary: string
  icon: ReactNode
  highlights: string[]
  sections: Array<{
    title: string
    points: string[]
  }>
  detailSections: Array<{
    id: string
    title: string
    intro: string
    points: string[]
    note?: string
  }>
}

const coreGuideMetaById = Object.fromEntries(
  CORE_GUIDE_LIBRARY.map((guide) => [guide.id, guide])
) as Record<CoreGuideId, (typeof CORE_GUIDE_LIBRARY)[number]>

const CORE_GUIDES: CoreGuide[] = [
  {
    ...coreGuideMetaById.mv,
    eyebrow: coreGuideMetaById.mv.detail,
    icon: <Tv className="h-4 w-4" />,
    sections: [
      {
        title: "Why it matters",
        points: [
          "Music video streaming helps charting, visibility, and overall demand signals.",
          "Billboard only counts officially licensed videos and only counts US-based plays for its charts."
        ]
      },
      {
        title: "Quick rules",
        points: [
          "On Facebook, use official BTS, BIGHIT MUSIC, or HYBE pages.",
          "On YouTube, use the official HYBE LABELS upload when available.",
          "Manually search, click, and watch the full video, then move to something else.",
          "For older MVs, the 1theK upload can sometimes be the bigger official version."
        ]
      },
      {
        title: "Avoid this",
        points: [
          "Do not use VPNs.",
          "Do not loop the same MV or rely on playlists, especially in the first 24 hours.",
          "Premium users should still keep it to one device and one browser at a time."
        ]
      },
      {
        title: "First 24 hours",
        points: [
          "YouTube focuses on organic human views for 24-hour records.",
          "Direct links, search, embeds, and normal YouTube discovery paths can count.",
          "Autoplay embeds and repeat-heavy playlist behavior are bad bets."
        ]
      }
    ],
    detailSections: [
      {
        id: "mv-why",
        title: "Why MV streaming matters",
        intro: "Music video work is not just for vanity metrics. It feeds discovery, visibility, and chart support when it is done correctly.",
        points: [
          "MV activity helps charting, broadens exposure, and gives the industry a clearer read on real listener demand.",
          "Billboard only cares about officially licensed music video plays, so random uploads do not help.",
          "For Billboard specifically, only US-based plays count toward the chart side of MV streaming."
        ]
      },
      {
        id: "mv-billboard",
        title: "What Billboard actually counts",
        intro: "Billboard tracks licensed video streams, but the platform and upload source still matter.",
        points: [
          "Billboard counts officially licensed video plays from places like YouTube, Facebook, Apple, Spotify, Tidal, and Vevo.",
          "On Facebook, stick to official BTS, BIGHIT MUSIC, or HYBE pages.",
          "On YouTube, use the official HYBE LABELS upload when available.",
          "For older pre-FIRE era MVs, the 1theK upload can still be the higher-view version."
        ]
      },
      {
        id: "mv-first-day",
        title: "How first 24-hour YouTube traffic works",
        intro: "The first-day record logic is stricter because YouTube is screening for organic human views, not repetitive traffic tricks.",
        points: [
          "Organic sources include direct links, search, embeds, homepage discovery, watch-next, and Trending.",
          "Embedded videos can count if the viewer manually chooses to watch them.",
          "Autoplay embeds do not count because the user did not intentionally click.",
          "Paid advertising views do not count toward 24-hour record debuts.",
          "Playlist traffic is weak for first-day pushes because playlist repeats do not create new-count behavior the way manual plays do."
        ],
        note: "Best first-day habit: manually search, click the official upload, watch it fully, then move to another video."
      },
      {
        id: "mv-youtube",
        title: "How to stream MVs cleanly",
        intro: "The safest MV rule is simple: act like a real viewer, not a robot routine.",
        points: [
          "Log into your YouTube account before you start. Premium helps, but normal accounts still matter.",
          "Manually search for the MV instead of living inside a playlist, especially in the first 24 hours.",
          "Watch the full video and do not instantly replay it.",
          "When the video ends, watch a different video before coming back."
        ],
        note: "YouTube can slow, freeze, or discard suspicious playback counts while it verifies quality. That is normal."
      },
      {
        id: "mv-quality",
        title: "Low-quality playback warnings",
        intro: "Bad setup can make your views look low quality even if your intent is fine.",
        points: [
          "Do not open the same MV across multiple tabs or windows.",
          "Do not run the same MV across multiple devices at the same time.",
          "Expect YouTube to review suspicious traffic instead of counting everything instantly.",
          "If counts freeze for a while, that does not automatically mean views are gone forever."
        ]
      },
      {
        id: "mv-avoid",
        title: "What to avoid",
        intro: "Most bad MV habits come from trying to force volume instead of looking human.",
        points: [
          "Do not use VPNs.",
          "Do not loop the same MV endlessly.",
          "Do not use playlists as your main first-day method.",
          "If you are premium, keep it to one device and one browser at a time."
        ]
      }
    ]
  },
  {
    ...coreGuideMetaById.streaming,
    eyebrow: coreGuideMetaById.streaming.detail,
    icon: <PlayCircle className="h-4 w-4" />,
    sections: [
      {
        title: "Why it matters",
        points: [
          "Streaming is one of the main ways the industry measures demand and daily popularity.",
          "Streaming drives a major share of modern music revenue, so it is not optional if chart impact matters."
        ]
      },
      {
        title: "Core rules",
        points: [
          "Use official artist pages or title-song playlists.",
          "Interact sometimes: like, skip, or switch playlists instead of acting robotic.",
          "Do not loop songs or playlists and do not use VPNs."
        ]
      },
      {
        title: "Unit math",
        points: [
          "For Billboard albums, 1,250 premium streams or 3,750 free-tier streams equal one album unit.",
          "For RIAA album units, 1,500 on-demand streams equal one album unit.",
          "In general, keep plays above 30 seconds unless a platform says otherwise."
        ]
      },
      {
        title: "Platform reminders",
        points: [
          "Amazon Music and Apple Music treat purchased tracks as purchases, not streams, so clean up your library first.",
          "Spotify counts streams over 30 seconds and updates offline plays once you reconnect.",
          "Stationhead only helps linked premium Apple Music or Spotify accounts.",
          "YouTube Music can fold downloaded plays back in when you reconnect online."
        ]
      }
    ],
    detailSections: [
      {
        id: "stream-why",
        title: "Why streaming matters",
        intro: "Streaming is one of the clearest signals labels, charts, and the broader industry watch every day.",
        points: [
          "Streaming works as a demand signal, an exposure tool, and a charting engine at the same time.",
          "It is such a large part of modern music revenue that fanbases take clean streaming seriously.",
          "If you want clean chart impact, streaming has to look like normal listener behavior."
        ]
      },
      {
        id: "stream-rules",
        title: "Human behavior rules",
        intro: "This is the non-negotiable baseline before platform-specific rules even start.",
        points: [
          "Log into one streaming account and search the artist page or a title-song-focused playlist.",
          "Play or shuffle normally, but do not loop songs or playlists.",
          "Interact sometimes by liking a song, skipping, or changing the playlist.",
          "If you build your own playlist, separate repeat songs with 3 to 4 other tracks.",
          "Do not use VPNs."
        ]
      },
      {
        id: "stream-what-counts",
        title: "What usually counts as a stream",
        intro: "A lot of users still assume every quick click matters the same, but it does not.",
        points: [
          "A common baseline is keeping a play above 30 seconds unless the service says otherwise.",
          "Official artist pages, official releases, and clean playlist behavior are safer than random uploads or spammy repeats.",
          "Downloaded or offline plays can still be reported later on some platforms once you reconnect.",
          "Purchases and streams are not the same action, so bought tracks can create different behavior than clean streaming."
        ]
      },
      {
        id: "stream-units",
        title: "How streams turn into units",
        intro: "The unit math explains why premium streams matter more than free-tier streams for some chart goals.",
        points: [
          "For RIAA, 150 streams equal one track sale and 1,500 streams equal one album unit.",
          "For Billboard album math, 1,250 premium streams equal one album unit.",
          "For Billboard free-tier math, 3,750 ad-supported streams equal one album unit.",
          "As a general rule, stay above 30 seconds unless the platform gives a more specific threshold."
        ]
      },
      {
        id: "stream-platforms-1",
        title: "Platform notes: Amazon to Qobuz",
        intro: "Not every platform behaves the same, so the service-specific differences matter.",
        points: [
          "Amazon Music counts a stream after 30 seconds, but Amazon Digital Music Store purchases count as purchases, not streams.",
          "Apple Music also counts after 30 seconds, and iTunes purchases should be removed from the library before streaming.",
          "Audiomack and Qobuz US streams are included in Billboard tracking.",
          "Deezer became a Luminate data partner, but the exact Billboard effect is still less transparent than Spotify or Apple."
        ]
      },
      {
        id: "stream-platforms-2",
        title: "Platform notes: SoundCloud, Spotify, and Stationhead",
        intro: "These are some of the most common fan-use platforms, and each one behaves a bit differently.",
        points: [
          "SoundCloud only counts the on-demand side, and offline or anonymous behavior can post with delays.",
          "Spotify counts streams after 30 seconds, syncs offline plays when you reconnect, and only its first 10 plays per user per day affect Spotify Charts.",
          "Stationhead only works for totals when listeners link premium Apple Music or Spotify accounts; each listener creates a stream.",
          "Stationhead listeners can join from iOS, Android, or web, but going live as a host is still treated as iOS-first."
        ],
        note: "Stationhead broadcasting is still iOS-first; Android and web are listener-friendly but not full host mode."
      },
      {
        id: "stream-platforms-3",
        title: "Platform notes: YouTube Music and grouped versions",
        intro: "YouTube Music can behave differently from a normal audio-only service.",
        points: [
          "YouTube Music Insights can combine official versions of a song rather than splitting every upload apart.",
          "That can include official music videos, lyric videos, and user-made videos using the official song.",
          "Downloaded YouTube Music plays can be recorded and folded in after the user comes back online.",
          "For deeper MV-specific behavior, use the dedicated music video streaming rules."
        ]
      },
      {
        id: "stream-premium",
        title: "Premium matters",
        intro: "Premium streams weigh more heavily than free-tier streams for Billboard album math.",
        points: [
          "Premium streams are weighted more heavily than free or ad-supported streams for Billboard albums.",
          "Most major platforms offer trials or lower-cost plans that can make premium streaming easier to maintain.",
          "That does not mean free users are useless. It means premium users give stronger unit conversion.",
          "The practical takeaway is simple: if you can stream on premium cleanly, your plays usually carry more chart weight."
        ]
      }
    ]
  },
  {
    ...coreGuideMetaById.purchasing,
    eyebrow: coreGuideMetaById.purchasing.detail,
    icon: <ShoppingBag className="h-4 w-4" />,
    sections: [
      {
        title: "Why it matters",
        points: [
          "Purchasing is one of the strongest ways to support Billboard charting and RIAA certification.",
          "Digital and physical purchases follow different counting limits, so the rules need to stay separate."
        ]
      },
      {
        title: "Digital purchases",
        points: [
          "Stick to one copy per customer.",
          "For albums, buy tracks separately instead of using Complete My Album.",
          "Download digital purchases to a computer and do not gift tracks or albums.",
          "Use stable stores like Amazon Music, iTunes, or Qobuz for the safest path."
        ]
      },
      {
        title: "Physical purchases",
        points: [
          "Stay at four copies per customer per week if you want them to count cleanly.",
          "Pre-orders and bundles usually count when the item ships, not when you place the order.",
          "If buying from Amazon, make sure it says Sold & Shipped by Amazon."
        ]
      },
      {
        title: "Store notes",
        points: [
          "Weverse Shop USA counts for Billboard; Weverse Shop Global does not.",
          "Target, Walmart, Barnes & Noble, and other approved retailers are common physical options.",
          "Common digital store options include Amazon Music, iTunes, and Qobuz."
        ]
      }
    ],
    detailSections: [
      {
        id: "buy-why",
        title: "Why purchasing matters",
        intro: "Buying is one of the fastest and most efficient support methods for charts and certifications.",
        points: [
          "Purchasing helps Billboard and RIAA more directly than passive free streaming.",
          "Digital and physical rules stay separate because their caps and edge cases are different."
        ]
      },
      {
        id: "buy-digital-basics",
        title: "Digital purchase basics",
        intro: "These are the main digital rules users should follow for cleaner chart support.",
        points: [
          "Keep digital purchases at one copy per customer if you want them to count cleanly.",
          "For albums, buy tracks separately instead of using Complete My Album.",
          "Download digital purchases to a computer.",
          "Do not gift tracks or albums if the goal is Billboard chart support."
        ]
      },
      {
        id: "buy-where",
        title: "Where to buy and what to trust",
        intro: "Store choice changes whether a purchase is useful for the chart goal.",
        points: [
          "For digital, the guide points people to Amazon Music, iTunes, and Qobuz.",
          "For physical, it points to Weverse Shop USA, Amazon, Target, Walmart, and approved offline retailers.",
          "Weverse Shop USA is treated differently from Weverse Shop Global for Billboard purposes.",
          "Amazon is only the safe route when the listing clearly says Sold & Shipped by Amazon."
        ]
      },
      {
        id: "buy-digital-edge",
        title: "Digital edge cases",
        intro: "This is where a lot of short fandom graphics usually skip the important nuance.",
        points: [
          "The one-copy digital limit is treated very seriously, but the exact reset behavior is still not perfectly confirmed.",
          "Artist web store digital downloads are not a safe Hot 100 path according to the cited reporting.",
          "Stationhead buying-party options exist, but the safest recommendation is still Amazon Music, iTunes, or Qobuz."
        ],
        note: "Gifted iTunes purchases do not count for Billboard."
      },
      {
        id: "buy-physical-basics",
        title: "Physical purchase basics",
        intro: "Physical sales still matter, but the counting rules are stricter than many users assume.",
        points: [
          "Stay at four copies per customer per week if you want them to count cleanly.",
          "Pre-orders count when the item ships, not when you place the order.",
          "Weverse Shop USA counts for Billboard, while Weverse Shop Global does not.",
          "Physical plus digital bundles are still treated as physical purchases."
        ]
      },
      {
        id: "buy-physical-limits",
        title: "How physical limits are enforced",
        intro: "The enforcement rules are stricter than the quick summary most people repeat.",
        points: [
          "If one customer buys 5 to 9 copies, only 4 are counted as sales.",
          "If one customer buys 10 or more copies, the purchases are treated as bulk and none count.",
          "Per-customer checks can use matching email, IP, shipping address, and billing address."
        ]
      },
      {
        id: "buy-bundles",
        title: "Bundles, fan packs, and Amazon warnings",
        intro: "This is the part users usually miss when they only read short fandom graphics.",
        points: [
          "Physical plus digital bundles count as physical purchases when they ship.",
          "Billboard-approved fan packs count as physical purchases, but the merch-plus-album structure has strict rules.",
          "If buying from Amazon, the listing should say Sold & Shipped by Amazon because third-party sellers are not the safe route.",
          "If a retailer ships too early outside the reporting window, the sale can miss the intended Billboard week."
        ]
      }
    ]
  },
  {
    ...coreGuideMetaById.charts,
    eyebrow: coreGuideMetaById.charts.detail,
    icon: <BarChart3 className="h-4 w-4" />,
    sections: [
      {
        title: "Billboard basics",
        points: [
          "Hot 100 is the big singles chart and is led mostly by streaming, then radio, then digital sales.",
          "Billboard 200 is the main album chart and combines pure sales, track-equivalent albums, and stream-equivalent albums.",
          "Top Album Sales is pure sales only, while Top Streaming Albums is SEA only.",
          "Luminate is the data source behind the Billboard chart calculations."
        ]
      },
      {
        title: "Unit math",
        points: [
          "TEA means ten digital track downloads equal one album unit.",
          "SEA means 1,250 premium or 3,750 ad-supported streams equal one album unit.",
          "RIAA uses 1 album sale, 10 track downloads, or 1,500 on-demand streams as one album unit."
        ]
      },
      {
        title: "Global and Korea charts",
        points: [
          "Billboard Global 200 and Global Excl. US use worldwide streams plus download sales.",
          "Billboard South Korea Songs focuses on streams and downloads inside South Korea.",
          "Circle Chart’s Global K-pop Chart uses partners such as Apple Music, Spotify, TikTok, and YouTube."
        ]
      },
      {
        title: "RIAA tiers",
        points: [
          "Gold starts at 500,000 units.",
          "Platinum starts at 1,000,000 units and keeps climbing in million-unit steps.",
          "Only US sales and streams count for RIAA awards."
        ]
      }
    ],
    detailSections: [
      {
        id: "charts-billboard",
        title: "Billboard overview",
        intro: "The starting point is understanding what Billboard is and what data source powers it.",
        points: [
          "Billboard is the chart brand, and Luminate is the data source behind the chart calculations.",
          "Most of the Billboard charts here use a Friday-to-Thursday tracking week.",
          "The reporting cadence matters because users often confuse chart update day with tracking-close day.",
          "When people ask why a late purchase or stream did not show up, the tracking window is usually the first thing to check."
        ]
      },
      {
        id: "charts-hot100-200",
        title: "Hot 100 and Billboard 200",
        intro: "These are the two charts people talk about the most, but they do not behave the same way.",
        points: [
          "Hot 100 focuses on singles and is led mostly by streaming, then radio airplay, then digital sales.",
          "Digital download singles from artist web stores do not count for the Hot 100.",
          "Billboard 200 focuses on albums and combines pure sales, TEA, and SEA.",
          "TEA means 10 track downloads equal one album unit.",
          "SEA means 1,250 premium streams or 3,750 ad-supported streams equal one album unit."
        ]
      },
      {
        id: "charts-components",
        title: "Component charts and global charts",
        intro: "These are the supporting charts fanbases often use for goals beyond the main headlines.",
        points: [
          "Top Album Sales is pure traditional sales only.",
          "Top Streaming Albums is SEA only.",
          "Global 200 uses worldwide streams and downloads, while Global Excl. US removes the US from that mix.",
          "If the same song appears on multiple albums, SEA is generally assigned to the better-selling album that week."
        ]
      },
      {
        id: "charts-korea",
        title: "South Korea Songs and Circle Chart",
        intro: "These chart systems matter too when users are tracking Korea-facing goals.",
        points: [
          "Billboard South Korea Songs uses streams and downloads within South Korea.",
          "Circle Chart, formerly Gaon, is produced by the Korea Music Content Association.",
          "Circle’s Global K-pop Chart uses partners such as Apple Music, Spotify, TikTok, and YouTube.",
          "Circle’s Global K-pop Chart has 200 positions.",
          "Circle runs daily, weekly, monthly, half-year, and yearly views."
        ]
      },
      {
        id: "charts-riaa",
        title: "RIAA awards and unit rules",
        intro: "RIAA rules explain why buying and streaming strategies are often built around US-only activity.",
        points: [
          "RIAA Gold starts at 500,000 units, Platinum at 1,000,000, and Diamond at 10,000,000.",
          "RIAA counts 1 physical or digital album sale as one unit.",
          "RIAA counts 10 permanent track downloads as one unit.",
          "RIAA counts 1,500 on-demand audio or video streams as one unit."
        ],
        note: "Only US sales and streams qualify for RIAA awards."
      }
    ]
  }
]

function CoreGuideDetailModal({
  guide,
  open,
  onClose
}: {
  guide: CoreGuide
  open: boolean
  onClose: () => void
}) {
  const [activeSectionId, setActiveSectionId] = useState(guide.detailSections[0]?.id ?? "")
  const [mounted, setMounted] = useState(false)
  const [mobileTopicsOpen, setMobileTopicsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    setActiveSectionId(guide.detailSections[0]?.id ?? "")
    setMobileTopicsOpen(false)
  }, [guide, open])

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
  }, [activeSectionId, open])

  if (!open || !mounted) {
    return null
  }

  const activeSection =
    guide.detailSections.find((section) => section.id === activeSectionId) ?? guide.detailSections[0]
  const activeIndex = guide.detailSections.findIndex((section) => section.id === activeSection.id)
  const progress = guide.detailSections.length > 0 ? ((activeIndex + 1) / guide.detailSections.length) * 100 : 0

  const move = (direction: -1 | 1) => {
    const nextIndex = activeIndex + direction

    if (nextIndex < 0 || nextIndex >= guide.detailSections.length) {
      return
    }

    setActiveSectionId(guide.detailSections[nextIndex].id)
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] bg-[rgba(4,4,12,0.84)] backdrop-blur-md"
      >
        <div className="flex h-full items-end justify-center p-2 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${guide.title} full breakdown`}
            className="flex h-[90dvh] w-full min-w-0 max-w-[26rem] flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(21,15,44,0.99),rgba(8,8,20,1))] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.95)] sm:h-[92dvh] sm:max-w-3xl sm:rounded-[2rem] lg:max-w-6xl"
          >
            <div className="border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">
                    <Sparkles className="h-3.5 w-3.5" />
                    Full breakdown
                  </div>
                  <h3 className="mt-3 font-heading text-2xl font-semibold text-white sm:text-3xl">{guide.title}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/[0.68]">{guide.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white transition-colors hover:bg-white/[0.1]"
                  aria-label="Close detailed guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {guide.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/[0.78]">
                    {highlight}
                  </span>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-white/[0.45]">
                  <span>Detail progress</span>
                  <span>
                    {activeIndex + 1} / {guide.detailSections.length}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    key={activeSection.id}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.22 }}
                    className="h-full rounded-full bg-gradient-to-r from-white via-white/80 to-white/45"
                  />
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[18rem_minmax(0,1fr)]">
              <div className="hidden border-b border-white/10 p-4 lg:block lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.45]">Topics</p>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                  {guide.detailSections.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSectionId(section.id)}
                      className={`min-w-fit rounded-[1.2rem] border px-3 py-3 text-left transition-colors sm:px-4 ${
                        section.id === activeSection.id
                          ? "border-white/20 bg-white/[0.1] text-white"
                          : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-white/[0.45]">Topic {index + 1}</p>
                      <p className="mt-2 text-sm font-semibold">{section.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-col overflow-hidden">
                <div ref={contentRef} className="min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                  <div className="mb-4 lg:hidden">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/[0.45]">Current topic</p>
                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{activeSection.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMobileTopicsOpen((current) => !current)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/[0.08]"
                        >
                          {mobileTopicsOpen ? "Hide topics" : "Jump to topic"}
                          <ChevronDown className={`h-4 w-4 transition-transform ${mobileTopicsOpen ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {mobileTopicsOpen ? (
                      <div className="mt-3 grid gap-2">
                        {guide.detailSections.map((section, index) => (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => {
                              setActiveSectionId(section.id)
                              setMobileTopicsOpen(false)
                            }}
                            className={`rounded-[1.15rem] border px-4 py-3 text-left transition-colors ${
                              section.id === activeSection.id
                                ? "border-white/20 bg-white/[0.1] text-white"
                                : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                            }`}
                          >
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/[0.45]">Topic {index + 1}</p>
                            <p className="mt-1 text-sm font-semibold">{section.title}</p>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 sm:rounded-[1.75rem] sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.45]">
                          {guide.eyebrow}
                        </p>
                        <h4 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">
                          {activeSection.title}
                        </h4>
                      </div>
                      <div className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-sm text-white/70">
                        Topic {activeIndex + 1} / {guide.detailSections.length}
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-white/[0.76]">{activeSection.intro}</p>

                    <div className="mt-5 space-y-3">
                      {activeSection.points.map((point) => (
                        <div key={point} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3">
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/70" />
                          <p className="text-sm leading-6 text-white/[0.82]">{point}</p>
                        </div>
                      ))}
                    </div>

                    {activeSection.note ? (
                      <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/[0.08] p-4 text-sm leading-6 text-white/[0.8]">
                        {activeSection.note}
                      </div>
                    ) : null}

                  </div>
                </div>

                <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                  <div className="flex justify-end">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => move(-1)}
                        disabled={activeIndex === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => (activeIndex === guide.detailSections.length - 1 ? onClose() : move(1))}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
                      >
                        {activeIndex === guide.detailSections.length - 1 ? "Done" : "Next topic"}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
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

export function CoreGuideLibrary({
  initialGuideId = DEFAULT_CORE_GUIDE_ID
}: {
  initialGuideId?: CoreGuideId
}) {
  const [activeGuideId, setActiveGuideId] = useState<CoreGuide["id"]>(initialGuideId)
  const [detailOpen, setDetailOpen] = useState(false)
  const detailPanelRef = useRef<HTMLDivElement | null>(null)
  const activeGuide = CORE_GUIDES.find((guide) => guide.id === activeGuideId) ?? CORE_GUIDES[0]

  useEffect(() => {
    setActiveGuideId(initialGuideId)
  }, [initialGuideId])

  const scrollToActiveGuide = () => {
    window.requestAnimationFrame(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <section id="core-guide-library" className="scroll-mt-28 space-y-5">
      <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              <Globe2 className="h-3.5 w-3.5" />
              Start here
            </div>
            <h2 className="font-heading text-3xl font-semibold text-white sm:text-4xl">Core Streaming Rules</h2>
            <p className="max-w-3xl text-sm leading-6 text-white/[0.68]">
              These are the all-platform rules. Read these first, then drop into Apple Music or Amazon Music if you need a service-specific walkthrough.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/[0.72]">
            Built for IndiaForBTS users with quick reads first and deeper walkthroughs on demand.
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {CORE_GUIDES.map((guide) => {
          const isActive = guide.id === activeGuide.id

          return (
            <button
              key={guide.id}
              type="button"
              onClick={() => {
                setActiveGuideId(guide.id)
                scrollToActiveGuide()
              }}
              className={`rounded-[1.55rem] border p-4 text-left transition-all duration-300 ${
                isActive
                  ? "border-white/20 bg-white/[0.1] shadow-[0_20px_55px_-35px_rgba(255,255,255,0.85)]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? "bg-white text-slate-950" : "bg-white/[0.08] text-white"}`}>
                  {guide.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.45]">{guide.eyebrow}</p>
                  <p className="mt-1 text-base font-semibold text-white">{guide.title}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/[0.68]">{guide.summary}</p>
            </button>
          )
        })}
      </div>

      <div
        ref={detailPanelRef}
        className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]"
      >
        <div className="border-b border-white/10 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">
                Quick read
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">{activeGuide.eyebrow}</p>
              <h3 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">{activeGuide.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/[0.72]">{activeGuide.summary}</p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {activeGuide.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/[0.78]">
                    {highlight}
                  </span>
                ))}
              </div>
              <GuideModalCtaButton accent="core" label="Open detailed guide" onClick={() => setDetailOpen(true)} compact />
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-2">
          {activeGuide.sections.map((section) => (
            <article key={section.title} className="rounded-[1.55rem] border border-white/10 bg-[#120d39]/45 p-4">
              <h4 className="text-lg font-semibold text-white">{section.title}</h4>
              <div className="mt-4 space-y-3">
                {section.points.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-[1.15rem] bg-white/[0.04] px-4 py-3">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/70" />
                    <p className="text-sm leading-6 text-white/[0.8]">{point}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <CoreGuideDetailModal guide={activeGuide} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </section>
  )
}
