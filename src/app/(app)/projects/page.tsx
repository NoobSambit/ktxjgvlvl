import { PageHero } from "@/components/shared/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, User, Heart, Users, Gift, Sparkles } from "lucide-react"
import { listFanProjects } from "@/modules/fan-projects/service"

const categoryIcons: Record<string, typeof Heart> = {
  charity: Heart,
  meetup: Users,
  campaign: Sparkles,
  fundraiser: Gift,
  default: Heart
}

const categoryColors: Record<string, string> = {
  charity: "from-[hsl(320,70%,65%)] to-[hsl(320,70%,55%)]",
  meetup: "from-[hsl(170,60%,40%)] to-[hsl(170,60%,30%)]",
  campaign: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]",
  fundraiser: "from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)]",
  default: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]"
}

export default async function ProjectsPage() {
  const projects = await listFanProjects()

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Fan Projects"
        title="Initiatives by Indian ARMY"
        description="Discover charity drives, meetups, support campaigns, and creative projects happening across the country."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const Icon = categoryIcons[project.category] || categoryIcons.default
          const colorClass = categoryColors[project.category] || categoryColors.default
          
          return (
            <Card key={project.slug} className="group hover:border-[hsl(265,60%,55%)]/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={`w-fit bg-gradient-to-r ${colorClass} text-white border-0`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {project.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{project.summary}</p>
                <div className="flex items-center gap-2 pt-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-foreground">{project.organizer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{project.city}, {project.state}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
