import { revalidateTag } from "next/cache"

export const sharedCacheRevalidateSeconds = 60 * 15

export const cacheTags = {
  activityMap: "activity-map",
  activityMapAdmin: "activity-map:admin",
  activityMapDaily: "activity-map:daily",
  activityMapWeekly: "activity-map:weekly",
  adminOverview: "admin-overview",
  catalog: "catalog",
  catalogAlbums: "catalog:albums",
  catalogSummary: "catalog:summary",
  catalogTracks: "catalog:tracks",
  charts: "charts",
  events: "events",
  fanProjects: "fan-projects",
  guides: "guides",
  leaderboards: "leaderboards",
  leaderboardsStatus: "leaderboards:status",
  locationsRegistry: "locations:registry",
  missionAdmin: "missions:admin",
  missionAssets: "missions:assets",
  missionInstances: "missions:instances",
  missionSharedProgress: "missions:shared-progress",
  missions: "missions",
  platformSettings: "platform-settings",
  votingGuides: "voting-guides",
  wiki: "wiki"
} as const

export function revalidateCacheTags(...tags: Array<string | undefined | null>) {
  const uniqueTags = new Set(tags.filter((tag): tag is string => Boolean(tag)))

  for (const tag of uniqueTags) {
    revalidateTag(tag)
  }
}
