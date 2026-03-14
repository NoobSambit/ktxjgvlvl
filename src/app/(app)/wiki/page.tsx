import { PageHero } from "@/components/shared/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Disc, Star, FileText } from "lucide-react"
import { listWikiPages } from "@/modules/wiki/service"

const sectionIcons: Record<string, typeof BookOpen> = {
  members: Users,
  discography: Disc,
  eras: Star,
  fandom: FileText,
  default: BookOpen
}

const sectionColors: Record<string, string> = {
  members: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]",
  discography: "from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)]",
  eras: "from-[hsl(320,70%,65%)] to-[hsl(320,70%,55%)]",
  fandom: "from-[hsl(170,60%,40%)] to-[hsl(170,60%,30%)]",
  default: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]"
}

export default async function WikiPage() {
  const pages = await listWikiPages()

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Wiki"
        title="BTS knowledge base"
        description="Quick reference for members, discography, eras, and fandom basics. Perfect for new ARMY or a quick refresher."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {pages.map((page) => {
          const Icon = sectionIcons[page.section] || sectionIcons.default
          const colorClass = sectionColors[page.section] || sectionColors.default
          
          return (
            <Card key={page.slug} className="group hover:border-[hsl(265,60%,55%)]/30 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <Badge className={`w-fit bg-gradient-to-r ${colorClass} text-white border-0 mb-2`}>
                      {page.section}
                    </Badge>
                    <h3 className="font-semibold text-lg">{page.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{page.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  )
}
