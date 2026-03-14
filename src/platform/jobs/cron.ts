import { fetchKworbSnapshot } from "@/platform/integrations/charts/kworb"
import { getTrackerAdapter } from "@/platform/integrations/trackers"
import { connectToDatabase } from "@/platform/db/mongoose"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { materializeLeaderboards } from "@/modules/leaderboards/service"
import {
  generateDailyMissionInstances,
  generateWeeklyMissionInstances
} from "@/modules/missions/service"
import { jobKeys, type JobKey } from "@/platform/queues/job-types"

export type JobResult = {
  jobKey: JobKey
  status: "completed"
  summary: string
}

export async function runJob(jobKey: JobKey): Promise<JobResult> {
  switch (jobKey) {
    case jobKeys.syncActiveTrackers: {
      await connectToDatabase()
      const adapter = getTrackerAdapter("lastfm")
      const verifiedConnections = await TrackerConnectionModel.countDocuments({
        provider: "lastfm",
        verificationStatus: "verified"
      })
      const payload = adapter ? await adapter.fetchSince({ username: "demo-army" }) : { events: [] }
      return {
        jobKey,
        status: "completed",
        summary: `Verified ${verifiedConnections} Last.fm connections; demo sync fetched ${payload.events.length} events`
      }
    }
    case jobKeys.generateDailyMissions: {
      const instances = await generateDailyMissionInstances()
      return {
        jobKey,
        status: "completed",
        summary: `Generated ${instances.length} daily mission instances`
      }
    }
    case jobKeys.generateWeeklyMissions: {
      const instances = await generateWeeklyMissionInstances()
      return {
        jobKey,
        status: "completed",
        summary: `Generated ${instances.length} weekly mission instances`
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
