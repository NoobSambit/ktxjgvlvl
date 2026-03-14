export type VotingGuideView = {
  slug: string
  title: string
  awardName: string
  summary: string
  platform: string
  updatedLabel: string
}

const seededGuides: VotingGuideView[] = [
  {
    slug: "mama-voting-guide",
    title: "MAMA Voting Guide",
    awardName: "MAMA",
    summary: "Simple step-by-step instructions for app setup, ballot flow, and daily reminders.",
    platform: "Mnet Plus",
    updatedLabel: "Updated for this season"
  },
  {
    slug: "bbmas-voting-guide",
    title: "BBMAs Voting Guide",
    awardName: "BBMAs",
    summary: "A calmer, beginner-friendly breakdown for fans voting for the first time.",
    platform: "Web + app voting",
    updatedLabel: "Refreshed this week"
  },
  {
    slug: "stationhead-support-guide",
    title: "Stationhead Support Guide",
    awardName: "Streaming support",
    summary: "Practical reminders on joining listening rooms and supporting group pushes responsibly.",
    platform: "Stationhead",
    updatedLabel: "Ready for the next stream party"
  }
]

export async function listVotingGuides() {
  return seededGuides
}
