import {
  revalidateTag as nextRevalidateTag,
  unstable_cache as nextUnstableCache
} from "next/cache"

const nextCacheRuntimeErrorMarkers = [
  "incrementalCache missing in unstable_cache",
  "static generation store missing in revalidateTag"
]

function isMissingNextCacheRuntime(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return nextCacheRuntimeErrorMarkers.some((marker) => message.includes(marker))
}

// Standalone scripts import the same services as Next routes, but they do not
// boot the incremental cache runtime that backs next/cache.
export function unstable_cache<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  keyParts?: Parameters<typeof nextUnstableCache>[1],
  options?: Parameters<typeof nextUnstableCache>[2]
): T {
  const cachedCallback = nextUnstableCache(callback, keyParts, options) as T

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await cachedCallback(...args)
    } catch (error) {
      if (!isMissingNextCacheRuntime(error)) {
        throw error
      }

      return callback(...args)
    }
  }) as T
}

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
    try {
      nextRevalidateTag(tag)
    } catch (error) {
      if (!isMissingNextCacheRuntime(error)) {
        throw error
      }
    }
  }
}
