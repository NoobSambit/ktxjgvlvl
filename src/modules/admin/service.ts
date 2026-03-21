import { cacheTags, sharedCacheRevalidateSeconds, unstable_cache } from "@/platform/cache/shared"
import { jobKeys } from "@/platform/queues/job-types"
import { getActivityMapAdminSummary } from "@/modules/activity-map/service"
import { getLocationRegistrySummary } from "@/modules/locations/service"

const getAdminOverviewCached = unstable_cache(async () => {
  const [locationRegistry, locationActivity] = await Promise.all([
    getLocationRegistrySummary(),
    getActivityMapAdminSummary()
  ])

  return {
    roles: ["super_admin", "content_admin", "mission_admin", "moderator"],
    panels: [
      "Mission templates",
      "Tracker health",
      "Charts and snapshots",
      "Wiki and guides",
      "Events",
      "Fan projects",
      "Region disputes",
      "Audit logs"
    ],
    scheduledJobs: Object.values(jobKeys),
    locationRegistry,
    locationActivity
  }
}, ["admin:overview:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.adminOverview, cacheTags.locationsRegistry, cacheTags.activityMapAdmin]
})

export async function getAdminOverview() {
  return getAdminOverviewCached()
}
