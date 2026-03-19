import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

type PageHeroProps = {
  eyebrow: string
  title: string
  description: string
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative">
      <div className="absolute -top-4 left-0 w-16 h-16 bg-gradient-to-br from-[hsl(265,70%,65%)]/30 to-[hsl(25,90%,55%)]/15 rounded-full blur-2xl" />
      
      <div className="relative space-y-4 sm:space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[hsl(265,70%,65%)]/15 to-[hsl(25,90%,55%)]/10 rounded-full border border-[hsl(265,70%,65%)]/20">
            <Sparkles className="w-3 h-3 text-[hsl(265,70%,65%)]" />
            <Badge className="bg-transparent text-[hsl(265,70%,65%)] hover:bg-transparent text-xs font-medium">
              {eyebrow}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <h1 className="max-w-4xl font-heading text-[2rem] font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
            <span className="bg-gradient-to-r from-[hsl(265,70%,65%)] via-[hsl(320,65%,70%)] to-[hsl(25,90%,55%)] bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[hsl(265,15%,65%)] md:text-lg md:leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
