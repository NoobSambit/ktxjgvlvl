export type ChartSnapshotSeed = {
  sourceKey: string
  snapshotDate: string
  entries: Array<{
    artist: string
    title: string
    rank: number
    metricValue: number
  }>
}

export async function fetchKworbSnapshot(): Promise<ChartSnapshotSeed> {
  return {
    sourceKey: "kworb-global-demo",
    snapshotDate: new Date().toISOString().slice(0, 10),
    entries: [
      {
        artist: "Jungkook",
        title: "Standing Next to You",
        rank: 12,
        metricValue: 1543200
      },
      {
        artist: "Jimin",
        title: "Like Crazy",
        rank: 18,
        metricValue: 1218400
      },
      {
        artist: "BTS",
        title: "Dynamite",
        rank: 27,
        metricValue: 982340
      },
      {
        artist: "V",
        title: "Slow Dancing",
        rank: 33,
        metricValue: 841200
      }
    ]
  }
}
