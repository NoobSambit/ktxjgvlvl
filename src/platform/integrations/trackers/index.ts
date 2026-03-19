import { LastFmAdapter } from "@/platform/integrations/trackers/lastfm"
import { MusicatAdapter } from "@/platform/integrations/trackers/musicat"
import { StatsFmAdapter } from "@/platform/integrations/trackers/statsfm"
import type { TrackerProvider, TrackerProviderAdapter } from "@/platform/integrations/trackers/base"

const adapters: Record<TrackerProvider, TrackerProviderAdapter | null> = {
  lastfm: new LastFmAdapter(),
  musicat: new MusicatAdapter(),
  statsfm: new StatsFmAdapter()
}

export function getTrackerAdapter(provider: TrackerProvider) {
  return adapters[provider]
}
