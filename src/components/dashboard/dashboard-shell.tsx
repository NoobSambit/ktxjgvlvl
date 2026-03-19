import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const toneClasses = {
  neutral: "border-white/10 bg-white/5 text-white/70",
  purple: "border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 text-[hsl(277,100%,88%)]",
  rose: "border-[hsl(320,65%,70%)]/20 bg-[hsl(320,65%,70%)]/10 text-[hsl(320,100%,90%)]",
  saffron: "border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,88%)]",
  teal: "border-[hsl(170,60%,45%)]/20 bg-[hsl(170,60%,45%)]/10 text-[hsl(171,100%,88%)]"
} as const

const metricToneClasses = {
  purple: {
    orb: "bg-[hsl(265,70%,65%)]/15",
    icon: "border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 text-[hsl(277,100%,90%)]"
  },
  rose: {
    orb: "bg-[hsl(320,65%,70%)]/15",
    icon: "border-[hsl(320,65%,70%)]/20 bg-[hsl(320,65%,70%)]/10 text-[hsl(320,100%,90%)]"
  },
  saffron: {
    orb: "bg-[hsl(25,90%,55%)]/15",
    icon: "border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,90%)]"
  },
  teal: {
    orb: "bg-[hsl(170,60%,45%)]/15",
    icon: "border-[hsl(170,60%,45%)]/20 bg-[hsl(170,60%,45%)]/10 text-[hsl(171,100%,90%)]"
  }
} as const

type DashboardTone = keyof typeof toneClasses

type DashboardPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  insetClassName?: string
}

export function DashboardPanel({ className, children, insetClassName, ...props }: DashboardPanelProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[1.15rem] border border-white/10 bg-[linear-gradient(180deg,rgba(26,18,46,0.15),rgba(13,10,26,0.25))] shadow-[0_24px_60px_-36px_rgba(3,2,10,0.78)] backdrop-blur-sm sm:rounded-[1.6rem]",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_30%)]" />
      <div
        className={cn(
          "pointer-events-none absolute inset-[1px] rounded-[1.07rem] bg-[radial-gradient(circle_at_top_right,rgba(154,102,255,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,158,84,0.06),transparent_22%)] sm:rounded-[1.52rem]",
          insetClassName
        )}
      />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

type DashboardPillProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: LucideIcon
  tone?: DashboardTone
}

export function DashboardPill({
  className,
  icon: Icon,
  tone = "neutral",
  children,
  ...props
}: DashboardPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      <span>{children}</span>
    </div>
  )
}

type DashboardPanelHeaderProps = {
  badge?: string
  badgeIcon?: LucideIcon
  badgeTone?: DashboardTone
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function DashboardPanelHeader({
  action,
  badge,
  badgeIcon,
  badgeTone = "purple",
  className,
  description,
  descriptionClassName,
  title,
  titleClassName
}: DashboardPanelHeaderProps) {
  const BadgeIcon = badgeIcon

  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 sm:gap-4", className)}>
      <div className="space-y-2 sm:space-y-3">
        {badge ? (
          <Badge
            className={cn(
              "w-fit border px-2.5 py-1 text-xs font-medium",
              toneClasses[badgeTone]
            )}
          >
            {BadgeIcon ? <BadgeIcon className="mr-1.5 h-3.5 w-3.5" /> : null}
            {badge}
          </Badge>
        ) : null}
        <div className="space-y-2">
          <h2 className={cn("font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl", titleClassName)}>
            {title}
          </h2>
          {description ? (
            <p className={cn("max-w-2xl text-sm leading-relaxed text-white/68", descriptionClassName)}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  )
}

type DashboardMetricCardProps = {
  icon: LucideIcon
  label: string
  value: string
  context: string
  footnote: string
  tone?: Exclude<DashboardTone, "neutral">
  className?: string
}

export function DashboardMetricCard({
  className,
  context,
  footnote,
  icon: Icon,
  label,
  tone = "purple",
  value
}: DashboardMetricCardProps) {
  return (
    <DashboardPanel className={cn("group h-full p-3.5 sm:p-5 lg:p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl", className)}>
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-[40px] opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          metricToneClasses[tone].orb
        )}
      />
      <div className="flex h-full flex-col relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-[1rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
              metricToneClasses[tone].icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <DashboardPill tone={tone}>{context}</DashboardPill>
        </div>

        <div className="mt-4 space-y-1.5 sm:mt-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/50">{label}</p>
          <p className="font-heading text-[1.75rem] font-semibold tracking-tight text-white/95">{value}</p>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-white/50">{footnote}</p>
      </div>
    </DashboardPanel>
  )
}
