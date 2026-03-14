import { cn } from "@/lib/utils"

type ProgressBarProps = {
  value: number
  max: number
  className?: string
}

export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className={cn("h-2.5 w-full rounded-full bg-[hsl(265,25%,20%)]", className)}>
      <div
        className="relative h-full rounded-full bg-gradient-to-r from-[hsl(265,70%,65%)] via-[hsl(320,65%,70%)] to-[hsl(25,90%,55%)]"
        style={{ width: `${width}%` }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg shadow-purple-500/50" />
      </div>
    </div>
  )
}
