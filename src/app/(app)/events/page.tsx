import { PageHero } from "@/components/shared/page-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin, Users, Tv, Music4, Heart } from "lucide-react"
import { listEvents } from "@/modules/events/service"
import { formatDateLabel } from "@/lib/utils"

const eventTypeIcons: Record<string, typeof Users> = {
  watch_party: Tv,
  streaming_session: Music4,
  meetup: Users,
  campaign: Heart,
  default: CalendarDays
}

const eventTypeColors: Record<string, string> = {
  watch_party: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]",
  streaming_session: "from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)]",
  meetup: "from-[hsl(170,60%,40%)] to-[hsl(170,60%,30%)]",
  campaign: "from-[hsl(320,70%,65%)] to-[hsl(320,70%,55%)]",
  default: "from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]"
}

export default async function EventsPage() {
  const events = await listEvents()

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Events"
        title="Never miss a moment"
        description="Track watch parties, streaming sessions, meetups, and campaigns. Stay in sync with Indian ARMY."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {events.map((event) => {
          const Icon = eventTypeIcons[event.eventType] || eventTypeIcons.default
          const colorClass = eventTypeColors[event.eventType] || eventTypeColors.default
          
          return (
            <Card key={event.slug} className="hover:border-[hsl(265,60%,55%)]/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-[hsl(265,60%,55%)]">
                        {event.eventType.replaceAll("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{event.note}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        {formatDateLabel(event.startsAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    </div>
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
