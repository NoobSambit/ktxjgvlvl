import { cacheTags, sharedCacheRevalidateSeconds, unstable_cache } from "@/platform/cache/shared"

export type EventView = {
  slug: string
  title: string
  eventType: string
  startsAt: string
  location: string
  note: string
}

const seededEvents: EventView[] = [
  {
    slug: "weekly-streaming-party",
    title: "Weekend Streaming Party",
    eventType: "community_stream",
    startsAt: new Date().toISOString(),
    location: "Online",
    note: "A shared listening window for fans who want to boost their daily mission totals together."
  },
  {
    slug: "release-watch-room",
    title: "Release Watch Room",
    eventType: "release_watch",
    startsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Online",
    note: "Countdown page reserved for comeback drops, teasers, and fan-organized listening plans."
  },
  {
    slug: "city-cafe-meetup",
    title: "City Cafe Meetup",
    eventType: "fan_event",
    startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Mumbai",
    note: "In-person ARMY gathering with playlists, projects, and mission check-ins."
  }
]

const listEventsCached = unstable_cache(async () => seededEvents, ["events:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.events]
})

export async function listEvents() {
  return listEventsCached()
}
