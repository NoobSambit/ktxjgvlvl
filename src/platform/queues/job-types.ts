export const jobKeys = {
  syncActiveTrackers: "sync-active-trackers",
  generateDailyMissions: "generate-daily-missions",
  generateWeeklyMissions: "generate-weekly-missions",
  materializeLeaderboards: "materialize-leaderboards",
  scrapeChartSnapshots: "scrape-chart-snapshots"
} as const

export type JobKey = (typeof jobKeys)[keyof typeof jobKeys]
