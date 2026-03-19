export const TRACKER_PROVIDERS = ["lastfm", "musicat", "statsfm"] as const

export type TrackerProvider = (typeof TRACKER_PROVIDERS)[number]

export type NormalizedStreamEvent = {
  provider: TrackerProvider
  providerUserKey: string
  providerEventKey: string
  playedAt: string
  trackName: string
  artistName: string
  albumName?: string
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
