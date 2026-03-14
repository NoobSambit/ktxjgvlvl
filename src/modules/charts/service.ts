import { fetchKworbSnapshot } from "@/platform/integrations/charts/kworb"
import type { ChartCard } from "@/modules/charts/types"

export async function listChartCards(): Promise<ChartCard[]> {
  const snapshot = await fetchKworbSnapshot()

  return [
    {
      source: "Global Stream Snapshot",
      snapshotDate: snapshot.snapshotDate,
      spotlight: "A quick look at the BTS songs Indian fans are watching closely this cycle.",
      entries: snapshot.entries
    }
  ]
}
