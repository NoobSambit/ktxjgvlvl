import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, Sparkles } from "lucide-react"
import { DashboardPanel, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { PageHero } from "@/components/shared/page-hero"

type ComingSoonPageProps = {
  eyebrow: string
  title: string
  description: string
  sectionLabel: string
  sectionTitle: string
  sectionDescription: string
  icon: LucideIcon
  bullets: string[]
}

export function ComingSoonPage({
  eyebrow,
  title,
  description,
  sectionLabel,
  sectionTitle,
  sectionDescription,
  icon: Icon,
  bullets
}: ComingSoonPageProps) {
  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHero eyebrow={eyebrow} title={title} description={description} />

      <DashboardPanel className="overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,63,215,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,153,87,0.12),transparent_28%)]" />

        <div className="relative grid gap-4 p-4 sm:gap-6 sm:p-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] xl:gap-8 xl:p-8">
          <div className="space-y-4 sm:space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <DashboardPill icon={Sparkles} tone="purple">
                Coming soon
              </DashboardPill>
              <DashboardPill icon={Icon} tone="neutral">
                {sectionLabel}
              </DashboardPill>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <h2 className="max-w-[16ch] font-heading text-[1.8rem] font-semibold leading-[1] tracking-[-0.04em] text-white sm:text-[2.8rem]">
                {sectionTitle}
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-white/66 sm:text-base sm:leading-7">
                {sectionDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {bullets.map((bullet) => (
                <div
                  className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/74 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  key={bullet}
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-full items-center">
            <div className="w-full rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:rounded-[1.5rem] sm:p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/12 bg-white/[0.06] text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-5 font-heading text-2xl font-semibold tracking-tight text-white">
                This section is being rebuilt properly
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/62">
                No filler cards, no fake lists, and no placeholder records. This page will go live when the real
                content and flows are ready.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/74">
                <ArrowUpRight className="h-4 w-4" />
                Real content only
              </div>
            </div>
          </div>
        </div>
      </DashboardPanel>
    </div>
  )
}
