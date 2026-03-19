import { fetchKworbSnapshot } from "@/platform/integrations/charts/kworb"
import { connectToDatabase } from "@/platform/db/mongoose"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { materializeLocationActivity } from "@/modules/activity-map/service"
import { materializeLeaderboards } from "@/modules/leaderboards/service"
import {
  generateDailyMissionInstances,
  generateWeeklyMissionInstances
} from "@/modules/missions/service"
import { syncVerifiedTrackerConnections } from "@/modules/streaming/service"
import { jobKeys, type JobKey } from "@/platform/queues/job-types"

export type JobResult = {
  jobKey: JobKey
  status: "completed"
  summary: string
}

export async function runJob(
  jobKey: JobKey,
  options: {
    force?: boolean
  } = {}
): Promise<JobResult> {
  switch (jobKey) {
    case jobKeys.syncActiveTrackers: {
      await connectToDatabase()
      const verifiedConnections = await TrackerConnectionModel.countDocuments({
        verificationStatus: "verified"
      })
      const summary = await syncVerifiedTrackerConnections()
      return {
        jobKey,
        status: "completed",
        summary: `Synced ${verifiedConnections} verified tracker connection(s); imported ${summary.syncedEvents} events and scored ${summary.scoredEvents} BTS-family streams${summary.failedUsers > 0 ? `; ${summary.failedUsers} connection(s) failed` : ""}`
      }
    }
    case jobKeys.generateDailyMissions: {
      const instances = await generateDailyMissionInstances({ force: options.force })
      return {
        jobKey,
        status: "completed",
        summary: `${options.force ? "Force-regenerated" : "Generated"} ${instances.length} daily mission instances`
      }
    }
    case jobKeys.generateWeeklyMissions: {
      const instances = await generateWeeklyMissionInstances({ force: options.force })
      return {
        jobKey,
        status: "completed",
        summary: `${options.force ? "Force-regenerated" : "Generated"} ${instances.length} weekly mission instances`
      }
    }
    case jobKeys.materializeLeaderboards: {
      const result = await materializeLeaderboards()
      return {
        jobKey,
        status: "completed",
        summary: `Materialized ${result.boardsMaterialized} leaderboard snapshots`
      }
    }
    case jobKeys.materializeLocationActivity: {
      const result = await materializeLocationActivity()
      return {
        jobKey,
        status: "completed",
        summary: `Materialized ${result.snapshotsMaterialized} location activity snapshots`
      }
    }
    case jobKeys.scrapeChartSnapshots: {
      const snapshot = await fetchKworbSnapshot()
      return {
        jobKey,
        status: "completed",
        summary: `Captured ${snapshot.entries.length} chart entries for ${snapshot.sourceKey}`
      }
    }
  }
}
