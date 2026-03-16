import {
  type TrackerConnectionInput,
  type TrackerFetchResult,
  type TrackerProviderAdapter,
  createCanonicalKey
} from "@/platform/integrations/trackers/base"
import { getLastFmClient } from "@/platform/integrations/trackers/lastfm-client"

export class LastFmAdapter implements TrackerProviderAdapter {
  provider = "lastfm" as const

  async validateUsername(username: string) {
    try {
      await getLastFmClient().getUserInfo(username.trim())
      return true
    } catch {
      return false
    }
  }

  async fetchSince(input: TrackerConnectionInput): Promise<TrackerFetchResult> {
    const since = input.checkpoint ? Number.parseInt(input.checkpoint, 10) : undefined
    const response = await getLastFmClient().getRecentTracks(input.username, {
      limit: 200,
      from: Number.isFinite(since) ? since : undefined
    })
    const filteredTracks = response.tracks.filter((track) => !track.nowPlaying && track.timestamp)

    return {
      nextCheckpoint:
        filteredTracks[0]?.timestamp != null
          ? String(Math.floor(filteredTracks[0].timestamp.getTime() / 1000))
          : input.checkpoint,
      events: filteredTracks.map((track) => ({
        provider: this.provider,
        providerUserKey: input.username,
        providerEventKey: `${input.username}:${track.timestamp?.toISOString()}:${track.name}:${track.artistName}`,
        playedAt: track.timestamp?.toISOString() ?? new Date().toISOString(),
        trackName: track.name,
        artistName: track.artistName,
        albumName: track.albumName,
        artistKey: createCanonicalKey(track.artistName),
        trackKey: createCanonicalKey(track.name),
        albumKey: track.albumName ? createCanonicalKey(track.albumName) : undefined,
        rawRef: track.url
      }))
    }
  }
}
