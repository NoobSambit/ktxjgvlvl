import { PageHero } from "@/components/shared/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Vote, Trophy, Calendar, ArrowRight } from "lucide-react"
import { listVotingGuides } from "@/modules/voting-guides/service"

const platformColors: Record<string, string> = {
  twitter: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]",
  melo: "from-[hsl(170,60%,40%)] to-[hsl(170,60%,30%)]",
  default: "from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)]"
}

export default async function VotingGuidesPage() {
  const guides = await listVotingGuides()

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Voting Guides"
        title="Vote for BTS with confidence"
        description="Step-by-step guides for every award show. Easy to follow, share with new ARMY, and complete voting campaigns."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((guide) => {
          const colorClass = platformColors[guide.platform] || platformColors.default
          
          return (
            <Card key={guide.slug} className="group hover:border-[hsl(265,60%,55%)]/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={`w-fit bg-gradient-to-r ${colorClass} text-white border-0`}>
                    <Vote className="w-3 h-3 mr-1" />
                    {guide.platform}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{guide.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{guide.summary}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Trophy className="w-4 h-4 text-[hsl(30,100%,50%)]" />
                  <span className="font-medium text-foreground">{guide.awardName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{guide.updatedLabel}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
