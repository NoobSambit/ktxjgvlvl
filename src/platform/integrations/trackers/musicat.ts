import {
  type TrackerConnectionInput,
  type TrackerFetchResult,
  type TrackerProviderAdapter,
  createCanonicalKey
} from "@/platform/integrations/trackers/base"
import { getMusicatClient } from "@/platform/integrations/trackers/musicat-client"

export class MusicatAdapter implements TrackerProviderAdapter {
  provider = "musicat" as const

  async validateUsername(username: string) {
    try {
      await getMusicatClient().resolveUser(username.trim())
      return true
    } catch {
      return false
    }
  }

  async fetchSince(input: TrackerConnectionInput): Promise<TrackerFetchResult> {
    const user = await getMusicatClient().resolveUser(input.username)
    const history = await getMusicatClient().getListeningHistory(user.publicId)
    const checkpointMs = input.checkpoint ? Number.parseInt(input.checkpoint, 10) : null
    const events = history.filter((item) => {
      if (checkpointMs == null) {
        return true
      }

      return new Date(item.playedAt).getTime() > checkpointMs
    })
    const newestEventMs =
      history.length > 0 ? new Date(history[0].playedAt).getTime() : checkpointMs ?? null

    return {
      nextCheckpoint:
        newestEventMs != null && Number.isFinite(newestEventMs)
          ? String(newestEventMs)
          : input.checkpoint,
      events: events.map((item) => ({
        provider: this.provider,
        providerUserKey: user.publicId,
        providerEventKey: `${user.publicId}:${item.playedAt}:${item.publicId}`,
        playedAt: item.playedAt,
        trackName: item.name,
        artistName: item.artists,
        artistKey: createCanonicalKey(item.artists),
        trackKey: createCanonicalKey(item.name),
        rawRef: `musicat:track:${item.publicId}`
      }))
    }
  }
}
