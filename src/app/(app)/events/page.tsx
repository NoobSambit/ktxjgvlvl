import { CalendarDays } from "lucide-react"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"

export default function EventsPage() {
  return (
    <ComingSoonPage
      bullets={[
        "Real watch parties and streaming sessions",
        "Meetups with proper time and location details",
        "Cleaner event discovery and reminders",
        "No fake event cards in the meantime"
      ]}
      description="The events section is being reworked before we publish live community events here."
      eyebrow="Events"
      icon={CalendarDays}
      sectionDescription="This page will come back with real upcoming events, cleaner scheduling, and a better way to see what is happening across the community."
      sectionLabel="Community calendar"
      sectionTitle="Community events coming soon"
      title="A real event calendar is being prepared"
    />
  )
}
