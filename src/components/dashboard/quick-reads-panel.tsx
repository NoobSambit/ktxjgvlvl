import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  PlayCircle,
  ShoppingBag,
  Tv
} from "lucide-react"
import { ServiceBrandLogo } from "@/components/guides/service-brand-logo"
import { DashboardPanel, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { cn } from "@/lib/utils"
import {
  type GuideQuickReadView,
  type GuideTone,
} from "@/modules/guides/service"

const toneClasses: Record<GuideTone, string> = {
  purple:
    "border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 text-[hsl(277,100%,90%)] hover:bg-[hsl(265,70%,65%)]/16",
  rose:
    "border-[hsl(320,65%,70%)]/20 bg-[hsl(320,65%,70%)]/10 text-[hsl(320,100%,90%)] hover:bg-[hsl(320,65%,70%)]/16",
  saffron:
    "border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,90%)] hover:bg-[hsl(25,90%,55%)]/16",
  teal:
    "border-[hsl(170,60%,45%)]/20 bg-[hsl(170,60%,45%)]/10 text-[hsl(171,100%,90%)] hover:bg-[hsl(170,60%,45%)]/16"
}

function getGuideIcon(guide: GuideQuickReadView) {
  if (guide.category === "platform") {
    return <ServiceBrandLogo className="h-3.5 w-3.5" service={guide.service} />
  }

  switch (guide.id) {
    case "mv":
      return <Tv className="h-3.5 w-3.5" />
    case "streaming":
      return <PlayCircle className="h-3.5 w-3.5" />
    case "purchasing":
      return <ShoppingBag className="h-3.5 w-3.5" />
    case "charts":
      return <BarChart3 className="h-3.5 w-3.5" />
  }
}

function GuideNavGrid({ guides }: { guides: GuideQuickReadView[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      {guides.map((guide) => (
        <Link
          key={guide.id}
          className={cn(
            "inline-flex min-h-11 w-full items-center gap-2 rounded-[1rem] border px-3.5 py-2 text-sm font-medium transition-colors duration-300",
            toneClasses[guide.tone]
          )}
          href={guide.href}
        >
          {getGuideIcon(guide)}
          <span className="truncate">{guide.navLabel}</span>
        </Link>
      ))}
    </div>
  )
}

export function QuickReadsPanel({ guides }: { guides: GuideQuickReadView[] }) {
  const sortedGuides = [...guides].sort((left, right) => {
    if (left.category === right.category) {
      return 0
    }

    return left.category === "core" ? -1 : 1
  })

  return (
    <DashboardPanel className="p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <DashboardPill tone="purple">Guides</DashboardPill>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/72 hover:text-white"
          href="/guide"
        >
          All guides <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-3">
        <GuideNavGrid guides={sortedGuides} />
      </div>
    </DashboardPanel>
  )
}
