import { jobKeys } from "@/platform/queues/job-types"

export async function getAdminOverview() {
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
    scheduledJobs: Object.values(jobKeys)
  }
}
