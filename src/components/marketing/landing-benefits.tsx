import Link from "next/link"
import { ArrowRight, BookOpenCheck, Map, ShieldCheck, Trophy } from "lucide-react"
import type { EventView } from "@/modules/events/service"
import type { GuideQuickReadView } from "@/modules/guides/service"
import type { MissionCard } from "@/modules/missions/types"

type LandingBenefitsProps = {
  missions: MissionCard[]
  guideQuickReads: GuideQuickReadView[]
  events: EventView[]
}

const benefitCards = [
  {
    title: "Clear progress tracking",
    description: "Connect your listening tracker and see your progress update in a way that feels simple and reliable.",
    icon: ShieldCheck
  },
  {
    title: "Fresh goals every day",
    description: "Daily and weekly goals keep the platform focused, so fans always know what the current push is.",
    icon: Trophy
  },
  {
    title: "State rankings that feel alive",
    description: "See which states are leading and how the momentum is shifting across India in real time.",
    icon: Map
  },
  {
    title: "Helpful guides built in",
    description: "New fans can get up to speed fast with clear streaming and voting guides in one place.",
    icon: BookOpenCheck
  }
] as const

export function LandingBenefits({ missions, guideQuickReads, events }: LandingBenefitsProps) {
  const primaryGuide = guideQuickReads[0]
  const nextEvent = events[0]

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(320,72%,76%)]">Why Stream with Us?</p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built to make supporting BTS feel easier.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-white/68">
          IndiaForBTS helps you focus on what matters: what to stream, where the push is strongest, and how your effort
          fits into the bigger picture.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {benefitCards.map((benefit) => (
          <div key={benefit.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.06]">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6">
                <benefit.icon className="h-5 w-5 text-[hsl(265,80%,78%)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(98,59,152,0.18),rgba(10,10,16,0.88))] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-white/45">In the app right now</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/52">Live goals</p>
              <p className="mt-2 text-3xl font-semibold text-white">{missions.length}</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/52">Quick guides</p>
              <p className="mt-2 text-3xl font-semibold text-white">{guideQuickReads.length}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-bts-primary" href="/guide">
              View guides
            </Link>
            <Link className="btn-bts-secondary border-white/20 text-white hover:bg-white/8 hover:text-white" href="/leaderboards">
              See rankings
            </Link>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-white/45">Coming up</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{nextEvent?.title ?? "Community events incoming"}</h3>
          <p className="mt-3 text-sm leading-6 text-white/62">
            {nextEvent?.note ?? primaryGuide?.summary ?? "Check upcoming events, guides, and community activity whenever you want to join the next push."}
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/58">
            <p>{nextEvent?.location ?? "Online + local community spaces"}</p>
            <p>{primaryGuide?.title ?? "Guide library available now"}</p>
          </div>
          <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(25,90%,60%)] hover:text-[hsl(25,90%,66%)]" href="/events">
            View upcoming events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
