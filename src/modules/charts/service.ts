import { cacheTags, sharedCacheRevalidateSeconds, unstable_cache } from "@/platform/cache/shared"
import { fetchKworbSnapshot } from "@/platform/integrations/charts/kworb"
import type { ChartCard } from "@/modules/charts/types"

const listChartCardsCached = unstable_cache(async (): Promise<ChartCard[]> => {
  const snapshot = await fetchKworbSnapshot()

  return [
    {
      source: "Global Stream Snapshot",
      snapshotDate: snapshot.snapshotDate,
      spotlight: "A quick look at the BTS songs Indian fans are watching closely this cycle.",
      entries: snapshot.entries
    }
  ]
}, ["charts:cards:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.charts]
})

export async function listChartCards(): Promise<ChartCard[]> {
  return listChartCardsCached()
}
