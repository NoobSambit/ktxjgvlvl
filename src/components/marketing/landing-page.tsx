import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LandingBenefits } from "@/components/marketing/landing-benefits"
import { LandingFeatureGrid } from "@/components/marketing/landing-feature-grid"
import { LandingHero } from "@/components/marketing/landing-hero"
import { LandingIndiaPower } from "@/components/marketing/landing-india-power"
import type { LandingPageData } from "@/components/marketing/landing-types"

export function LandingPage({ data }: { data: LandingPageData }) {
  return (
    <main className="relative space-y-16 py-8 sm:space-y-20 sm:py-10 md:py-14">
      <LandingHero
        chartSnapshot={data.chartSnapshot}
        dailyActivityMap={data.dailyActivityMap}
        featuredBoard={data.featuredBoard}
        guideQuickReads={data.guideQuickReads}
        isAuthenticated={data.isAuthenticated}
        leadMission={data.leadMission}
        missions={data.missions}
        stateBoard={data.stateBoard}
      />

      <LandingFeatureGrid
        chartSnapshot={data.chartSnapshot}
        featuredGuide={data.votingGuides[0]}
        leadMission={data.leadMission}
        stateBoard={data.stateBoard}
      />

      <LandingIndiaPower weeklyActivityMap={data.weeklyActivityMap} />

      <LandingBenefits events={data.events} guideQuickReads={data.guideQuickReads} missions={data.missions} />

      <section className="px-1 pb-4">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(108,69,192,0.82),rgba(39,22,70,0.94))] px-6 py-12 text-center shadow-[0_40px_100px_-70px_rgba(105,66,194,0.8)] sm:px-8 sm:py-14">
          <div className="absolute -right-14 top-0 h-44 w-44 rounded-full bg-[hsl(25,90%,60%)]/18 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/8 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <h2 className="font-heading text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Join the next India-wide push.
              <span className="block">Stream smarter, together.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Follow live goals, check the charts, and stream alongside fans across the country from one clean home base.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link className="btn-bts bg-white px-7 py-3 text-sm font-semibold text-[hsl(265,40%,18%)] hover:bg-white/92" href={data.isAuthenticated ? "/dashboard" : "/signup"}>
                {data.isAuthenticated ? "Go to Dashboard" : "Create your account"}
              </Link>
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-white/88 hover:text-white" href="/missions">
                See live goals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
