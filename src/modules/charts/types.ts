export type ChartCard = {
  source: string
  snapshotDate: string
  spotlight: string
  entries: Array<{
    artist: string
    title: string
    rank: number
    metricValue: number
  }>
}
