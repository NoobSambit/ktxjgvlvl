"use client"

import { type ReactNode, useState } from "react"
import {
  CheckCircle2,
  Disc3,
  Download,
  Heart,
  ListMusic,
  PlayCircle,
  Repeat,
  Search,
  Settings2,
  ShieldAlert,
  Volume2,
  Wifi
} from "lucide-react"
import { GuideModalCtaButton } from "@/components/guides/guide-modal-cta-button"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { GuideWalkthroughModal, type GuideWalkthroughSection } from "@/components/guides/guide-walkthrough-modal"

const SPOTIFY_SECTIONS: GuideWalkthroughSection[] = [
  {
    id: "setup",
    eyebrow: "Start clean",
    title: "Set up Spotify correctly",
    shortTitle: "Setup",
    summary: "Use the official app or web player, log in with a real account, follow BTS, and switch off risky playback defaults before you start.",
    note: "Premium is still the strongest route when possible, but clean streaming on a normal account still matters.",
    steps: [
      {
        id: "spotify-setup-app",
        title: "Use the official app or web player",
        description:
          "Open Spotify on the official app or web player, sign in properly, search BTS manually, and follow the artist page before you begin a session.",
        hints: [
          "Use the official Spotify app or web player only",
          "Search BTS manually instead of jumping straight into a loop",
          "Follow the artist page so releases and playlists stay easy to reach"
        ],
        preview: "app"
      },
      {
        id: "spotify-setup-settings",
        title: "Turn off autoplay-style helpers",
        description:
          "Before you start a focused session, turn off Autoplay, Enhance, shuffle, repeat, or any setting that starts adding tracks for you automatically.",
        hints: [
          "Turn off Autoplay",
          "Turn off Enhance or similar auto-mix settings",
          "Keep shuffle and repeat off for focused streams"
        ],
        preview: "settings"
      }
    ]
  },
  {
    id: "playlist",
    eyebrow: "Playlist rules",
    title: "Build cleaner playlists",
    shortTitle: "Playlist",
    summary: "Focused playlists should breathe like real listening sessions, not look like machine-made loops.",
    note: "The safest playlist rule is simple: every focus play should be separated by real filler tracks.",
    steps: [
      {
        id: "spotify-playlist-build",
        title: "Use 3 to 5 fillers between focus plays",
        description:
          "Build focused playlists with 3 to 5 filler songs between every focus song or version so the pattern does not look repetitive.",
        hints: [
          "Fillers can be BTS songs, solos, remixes, instrumentals, or collaborations",
          "Do not place the same focus song back-to-back",
          "If the playlist looks too short or too repetitive, rebuild it"
        ],
        preview: "playlist"
      },
      {
        id: "spotify-playlist-cycle",
        title: "Rotate albums, queues, and short playlists",
        description:
          "A cleaner first-week rhythm is full album listening, then a short playlist or queue, then back to the album instead of one endless repeat lane.",
        hints: [
          "Album -> short playlist -> album feels more human",
          "30 to 60 minute playlists are easier to supervise",
          "Switch playlists or queues occasionally instead of camping in one"
        ],
        preview: "cycle"
      }
    ]
  },
  {
    id: "charts",
    eyebrow: "Chart logic",
    title: "Understand the chart cap",
    shortTitle: "Charts",
    summary: "Spotify chart rules and total-stream rules are not the same thing, so users need to understand the difference.",
    note: "The 20-play cap is for Spotify chart ranking, not a signal to stop listening entirely if the session still looks natural.",
    steps: [
      {
        id: "spotify-chart-cap",
        title: "Treat 20 plays per version as the chart cap",
        description:
          "For Spotify's own chart window, fan guides usually keep themselves to 20 chart-targeted plays per version before rotating harder into other songs, albums, or versions.",
        hints: [
          "The chart window resets every day",
          "Use the cap to avoid mindless repeats",
          "Do not turn the cap into a robot routine"
        ],
        preview: "cap"
      },
      {
        id: "spotify-chart-versions",
        title: "Use versions smartly",
        description:
          "Different versions can still be useful, and clean streams beyond chart caps still help total streams, royalties, and wider campaign goals when the behavior stays natural.",
        hints: [
          "Original, remix, instrumental, or alternate versions can all be used",
          "Keep fillers between versions too",
          "Do not spam several versions of the same title back-to-back"
        ],
        preview: "versions"
      }
    ]
  },
  {
    id: "behavior",
    eyebrow: "Human behavior",
    title: "Stream like a real listener",
    shortTitle: "Behavior",
    summary: "Spotify should see a human listener: some interaction, some variety, some breaks, and no weird playback habits.",
    note: "If a streaming session looks like a robot wrote it, stop and simplify it.",
    steps: [
      {
        id: "spotify-behavior-interact",
        title: "Interact every so often",
        description:
          "Engage with Spotify during a session: like or unlike, pause, skip, search manually, share a link, or switch playlists every once in a while.",
        hints: [
          "Interact every 1 to 2 hours",
          "Aim for roughly 4 to 5 focus streams per hour instead of nonstop hammering",
          "Manual search and playlist switching help break robotic patterns"
        ],
        preview: "interact"
      },
      {
        id: "spotify-behavior-volume",
        title: "Keep volume on, take breaks, and avoid overload",
        description:
          "Do not leave the volume at zero, take short breaks during long sessions, and do not overload the same IP with too many simultaneous accounts.",
        hints: [
          "Keep some audible volume on the device",
          "Take a short break every 3 to 4 hours",
          "Keep simultaneous Spotify accounts on one IP under six"
        ],
        preview: "volume"
      }
    ]
  },
  {
    id: "avoid",
    eyebrow: "Filtering risks",
    title: "Avoid obvious filter bait",
    shortTitle: "Avoid",
    summary: "Bad playlists and fake-looking playback habits are where a lot of users ruin otherwise valid streams.",
    note: "The safest rule here is harsh but useful: if it looks fake, shortcut-heavy, or cracked, do not use it.",
    steps: [
      {
        id: "spotify-avoid-behavior",
        title: "No looping, no VPN, no modded tricks",
        description:
          "Do not loop the same song, do not run shuffle on a focus playlist, and do not use VPNs, Premium mods, APKs, or incognito-tab workarounds.",
        hints: [
          "No loop playlists",
          "No VPN or cracked Premium mod/APK",
          "No incognito tabs or other fake-session tricks"
        ],
        preview: "avoid"
      },
      {
        id: "spotify-avoid-playlists",
        title: "Audit playlists before pressing play",
        description:
          "Before you start, check that the playlist really has enough fillers and is not repeating the same focus pattern with one filler or no filler at all.",
        hints: [
          "Make sure there are at least 2, ideally 3 to 5, fillers between focus plays",
          "Avoid suspicious playlists copied from random social posts without checking them",
          "If the sequence feels repetitive, rebuild it yourself"
        ],
        preview: "playlist-check"
      }
    ]
  },
  {
    id: "offline",
    eyebrow: "Extra support",
    title: "Use offline mode correctly",
    shortTitle: "Offline",
    summary: "Offline playback can still help, but only if you reconnect later so Spotify can sync those streams back.",
    steps: [
      {
        id: "spotify-offline-sync",
        title: "Download cleanly, then reconnect later",
        description:
          "If you listen offline, use official downloads and reconnect later so Spotify can report the plays back into your account history.",
        hints: [
          "Download from the official app first",
          "Reconnect later so offline plays can sync",
          "Offline is a support lane, not a replacement for normal interactive streaming"
        ],
        preview: "offline"
      }
    ]
  }
]

const SPOTIFY_FACTS = [
  {
    label: "Best setup",
    value: "Official app or web + real account"
  },
  {
    label: "Playlist rule",
    value: "3 to 5 fillers between focus plays"
  },
  {
    label: "Chart note",
    value: "20 chart-focused plays per version daily"
  },
  {
    label: "Offline",
    value: "Reconnect later to sync downloads"
  }
]

function getSectionIcon(sectionId: string) {
  switch (sectionId) {
    case "setup":
      return <Settings2 className="h-4 w-4" />
    case "playlist":
      return <ListMusic className="h-4 w-4" />
    case "charts":
      return <Disc3 className="h-4 w-4" />
    case "behavior":
      return <Heart className="h-4 w-4" />
    case "avoid":
      return <ShieldAlert className="h-4 w-4" />
    default:
      return <Download className="h-4 w-4" />
  }
}

function SpotifyWindow({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/15 bg-[rgba(10,16,13,0.94)] shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(28,42,34,0.98),rgba(16,24,20,0.98))] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#1ed760]" />
          <span className="h-3 w-3 rounded-full bg-white/25" />
          <span className="h-3 w-3 rounded-full bg-white/18" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-100/80">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function SpotifyPhone({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[16.8rem] rounded-[1.85rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))] p-2.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]">
      <div className="mx-auto mb-2.5 h-1.5 w-16 rounded-full bg-white/15" />
      <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[rgba(7,12,10,0.95)]">
        {children}
      </div>
    </div>
  )
}

function SpotifyPreview({ kind }: { kind: string }) {
  switch (kind) {
    case "app":
      return (
        <SpotifyWindow title="Spotify Home">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[1.2rem] bg-white px-3 py-2 text-slate-900">
              <Search className="h-4 w-4 text-slate-500" />
              <span className="text-sm">Search BTS</span>
            </div>
            <div className="rounded-[1.25rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1ed760] text-sm font-bold text-slate-950">
                  BTS
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">BTS</p>
                  <p className="text-xs text-white/65">Follow the artist page first</p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">Follow</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/75">Official app or web</span>
              <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/75">Premium helps</span>
            </div>
          </div>
        </SpotifyWindow>
      )
    case "settings":
      return (
        <SpotifyPhone>
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/80">Playback settings</p>
          </div>
          <div className="space-y-3 p-4">
            {[
              ["Autoplay", "Off"],
              ["Enhance", "Off"],
              ["Shuffle", "Off"],
              ["Repeat", "Off"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-sm font-medium text-white">{label}</p>
                <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold text-emerald-100">{value}</span>
              </div>
            ))}
          </div>
        </SpotifyPhone>
      )
    case "playlist":
      return (
        <SpotifyWindow title="Focused Playlist">
          <div className="space-y-3">
            {[
              ["Focus song", "Target"],
              ["Filler 1", "Spacing"],
              ["Filler 2", "Spacing"],
              ["Filler 3", "Spacing"],
              ["Focus version", "Target"]
            ].map(([label, tag], index) => (
              <div
                key={`${label}-${index}`}
                className={`flex items-center justify-between rounded-[1.15rem] border px-4 py-3 ${
                  tag === "Target" ? "border-emerald-300/20 bg-emerald-300/10" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <p className="text-sm font-medium text-white">{label}</p>
                <span className="text-xs uppercase tracking-[0.2em] text-white/55">{tag}</span>
              </div>
            ))}
          </div>
        </SpotifyWindow>
      )
    case "cycle":
      return (
        <SpotifyWindow title="Session Flow">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Full album", "Play top to bottom"],
              ["Short playlist", "Rotate 30 to 60 mins"],
              ["Switch again", "Queue or return to album"]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Repeat className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Rotate</p>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
        </SpotifyWindow>
      )
    case "cap":
      return (
        <SpotifyWindow title="Chart Window">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Original version", "Alternate version"].map((label) => (
              <div key={label} className="rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-emerald-100">20</p>
                <p className="mt-2 text-sm text-white/65">Chart-focused plays inside the daily window</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
            Reset: chart-focused cap refreshes every day.
          </div>
        </SpotifyWindow>
      )
    case "versions":
      return (
        <SpotifyWindow title="Version Mix">
          <div className="space-y-3">
            {[
              "Original version",
              "Remix / alternate version",
              "Instrumental / other clean variant"
            ].map((label) => (
              <div key={label} className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex items-center gap-3">
                  <Disc3 className="h-4 w-4 text-emerald-200" />
                  <p className="text-sm font-medium text-white">{label}</p>
                </div>
              </div>
            ))}
            <div className="rounded-[1.15rem] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
              All clean streams still help totals when the session stays natural.
            </div>
          </div>
        </SpotifyWindow>
      )
    case "interact":
      return (
        <SpotifyPhone>
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/80">Stay human</p>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            {[
              { label: "Like", icon: <Heart className="h-4 w-4" /> },
              { label: "Pause", icon: <PlayCircle className="h-4 w-4" /> },
              { label: "Switch", icon: <ListMusic className="h-4 w-4" /> },
              { label: "Search", icon: <Search className="h-4 w-4" /> }
            ].map((item) => (
              <div key={item.label} className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4 text-center text-white">
                <div className="flex justify-center text-emerald-200">{item.icon}</div>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </SpotifyPhone>
      )
    case "volume":
      return (
        <SpotifyWindow title="Volume + Breaks">
          <div className="space-y-4">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-emerald-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">Keep some audible volume</p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-300 to-lime-300" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">Take breaks</p>
                <p className="mt-2 text-sm leading-6 text-white/65">Step away for a few minutes every few hours.</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-semibold text-white">Account load</p>
                <p className="mt-2 text-sm leading-6 text-white/65">Keep simultaneous accounts on one IP under six.</p>
              </div>
            </div>
          </div>
        </SpotifyWindow>
      )
    case "avoid":
      return (
        <SpotifyWindow title="Avoid Filters">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "No looping",
              "No VPN",
              "No modded APK",
              "No incognito tricks"
            ].map((label) => (
              <div key={label} className="rounded-[1.15rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-medium text-rose-50">
                {label}
              </div>
            ))}
          </div>
        </SpotifyWindow>
      )
    case "playlist-check":
      return (
        <SpotifyWindow title="Checklist">
          <div className="space-y-3">
            {[
              "Enough fillers between focus plays",
              "No obvious back-to-back loop pattern",
              "No suspicious social-media playlist without checking"
            ].map((label) => (
              <div key={label} className="flex items-start gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                <p className="text-sm leading-6 text-white/75">{label}</p>
              </div>
            ))}
          </div>
        </SpotifyWindow>
      )
    case "offline":
      return (
        <SpotifyPhone>
          <div className="bg-[linear-gradient(180deg,rgba(29,215,96,0.22),rgba(8,14,11,0.98))] p-4">
            <div className="mb-5 flex items-center justify-between text-emerald-100">
              <span className="text-xs uppercase tracking-[0.28em]">Offline support</span>
              <Download className="h-4 w-4" />
            </div>
            <div className="space-y-3 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-emerald-200" />
                <p className="text-sm font-semibold text-white">Download in the official app</p>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-emerald-200" />
                <p className="text-sm leading-6 text-white/75">Reconnect later so offline plays can sync back in.</p>
              </div>
            </div>
          </div>
        </SpotifyPhone>
      )
    default:
      return null
  }
}

export function SpotifyGuide() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [initialStepId, setInitialStepId] = useState<string | null>(null)

  const openWalkthrough = (sectionId?: string) => {
    setInitialStepId(sectionId ? SPOTIFY_SECTIONS.find((section) => section.id === sectionId)?.steps[0]?.id ?? null : null)
    setWalkthroughOpen(true)
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,49,33,0.98),rgba(5,12,9,1))] shadow-[0_35px_120px_-45px_rgba(0,0,0,0.95)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(30,215,96,0.32),transparent_65%)]" />
          <div className="absolute right-[-6rem] top-20 h-80 w-80 rounded-full bg-emerald-400/12 blur-3xl" />
          <div className="absolute left-[-7rem] bottom-[-4rem] h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
        </div>

        <div className="relative space-y-8 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                <ServiceBrandLogo service="spotify" className="h-4 w-4" />
                Spotify guide
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-emerald-200/80">Quick read + guided mode</p>
                <h1 className="font-heading text-4xl font-semibold uppercase leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                  Spotify
                  <span className="block text-transparent [text-shadow:_0_8px_24px_rgba(30,215,96,0.24)] [-webkit-text-stroke:1px_rgba(214,255,229,0.72)]">
                    Streaming Guide
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/[0.74] sm:text-base">
                  Keep this one simple for regular users: read the rules clearly first, then open the compact walkthrough
                  if you want the phone-style guided version.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <GuideModalCtaButton
                  accent="spotify"
                  label="Open interactive walkthrough"
                  onClick={() => openWalkthrough()}
                  icon={<ServiceBrandLogo service="spotify" className="h-4 w-4" />}
                />
                <div className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                  Readable list first. Guided mode lives in a compact modal.
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SPOTIFY_FACTS.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.45]">{fact.label}</p>
                  <p className="mt-3 text-sm font-medium leading-6 text-white">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            {SPOTIFY_SECTIONS.map((section) => (
              <article
                key={section.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.05)] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)]"
              >
                <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-300 text-slate-950">
                      {getSectionIcon(section.id)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/[0.45]">{section.eyebrow}</p>
                      <h2 className="mt-2 font-heading text-2xl font-semibold text-white sm:text-3xl">{section.title}</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/[0.72]">{section.summary}</p>
                    </div>
                  </div>
                  <GuideModalCtaButton
                    accent="spotify"
                    label="Walk me through it"
                    onClick={() => openWalkthrough(section.id)}
                    compact
                    icon={<ServiceBrandLogo service="spotify" className="h-3.5 w-3.5" />}
                  />
                </div>

                <div className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-2">
                  {section.steps.map((step, index) => (
                    <div key={step.id} className="rounded-[1.4rem] border border-white/10 bg-[#0f1913]/85 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300 text-sm font-semibold text-slate-950">
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
                    <div className="rounded-[1.2rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50">
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
        accent="spotify"
        guideTitle="Spotify Streaming Guide"
        open={walkthroughOpen}
        onClose={() => setWalkthroughOpen(false)}
        sections={SPOTIFY_SECTIONS}
        initialStepId={initialStepId}
        renderPreview={(preview) => <SpotifyPreview kind={preview} />}
      />
    </>
  )
}
