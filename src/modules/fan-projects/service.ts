export type FanProjectView = {
  slug: string
  title: string
  organizer: string
  state: string
  city: string
  category: string
  summary: string
}

const seededProjects: FanProjectView[] = [
  {
    slug: "mumbai-cupsleeve-day",
    title: "Mumbai Cup Sleeve Day",
    organizer: "Mumbai ARMY Events",
    state: "Maharashtra",
    city: "Mumbai",
    category: "Meet-up",
    summary: "A fan-led cafe event with freebies, playlists, and space for local ARMY to connect."
  },
  {
    slug: "delhi-charity-drive",
    title: "Delhi ARMY Charity Drive",
    organizer: "Delhi ARMY Union",
    state: "Delhi",
    city: "Delhi",
    category: "Charity",
    summary: "Donation campaign inspired by BTS birthday and anniversary celebration culture."
  },
  {
    slug: "kolkata-purple-banner",
    title: "Kolkata Purple Banner Project",
    organizer: "Kolkata Purple Crew",
    state: "West Bengal",
    city: "Kolkata",
    category: "Fan Support",
    summary: "A citywide project to coordinate signage, streaming circles, and event-day volunteers."
  }
]

export async function listFanProjects() {
  return seededProjects
}
