import { getTrackerAdapter } from "@/platform/integrations/trackers"
import type { TrackerProvider } from "@/platform/integrations/trackers/base"
import type { StreamingSyncSummary } from "@/modules/streaming/types"

export async function syncStreamingActivity(provider: TrackerProvider, username: string) {
  const adapter = getTrackerAdapter(provider)

  if (!adapter) {
    throw new Error(`${provider} syncing is not available yet.`)
  }

  const result = await adapter.fetchSince({ username })

  return {
    syncedEvents: result.events.length,
    provider,
    checkpoint: result.nextCheckpoint ?? null
  } satisfies StreamingSyncSummary
}
