export type TrackerProvider = "lastfm" | "musicat" | "statsfm"

export type NormalizedStreamEvent = {
  provider: TrackerProvider
  providerUserKey: string
  providerEventKey: string
  playedAt: string
  artistKey: string
  trackKey: string
  albumKey?: string
  rawRef?: string
}

export type TrackerFetchResult = {
  events: NormalizedStreamEvent[]
  nextCheckpoint?: string
}

export type TrackerConnectionInput = {
  username: string
  checkpoint?: string
}

export interface TrackerProviderAdapter {
  provider: TrackerProvider
  validateUsername(username: string): Promise<boolean>
  fetchSince(input: TrackerConnectionInput): Promise<TrackerFetchResult>
}

export function createCanonicalKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
}
