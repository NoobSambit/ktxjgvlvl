import {
  type TrackerConnectionInput,
  type TrackerFetchResult,
  type TrackerProviderAdapter,
  createCanonicalKey
} from "@/platform/integrations/trackers/base"
import { getStatsFmClient } from "@/platform/integrations/trackers/statsfm-client"

const STATSFM_PAGE_LIMIT = 200
const STATSFM_INCREMENTAL_PAGE_LIMIT = 5

export class StatsFmAdapter implements TrackerProviderAdapter {
  provider = "statsfm" as const

  async validateUsername(username: string) {
    try {
      await getStatsFmClient().getUser(username.trim())
      return true
    } catch {
      return false
    }
  }

  async fetchSince(input: TrackerConnectionInput): Promise<TrackerFetchResult> {
    const client = getStatsFmClient()
    const checkpointMs = input.checkpoint ? Number.parseInt(input.checkpoint, 10) : null
    const streams = []
    let before: number | undefined
    let pageCount = 0
    let newestEventMs = checkpointMs ?? null
    let shouldContinue = true

    while (shouldContinue) {
      const response = await client.getStreams(input.username, {
        before,
        limit: STATSFM_PAGE_LIMIT
      })

      const pageItems = response.items ?? []

      if (pageItems.length === 0) {
        break
      }

      if (newestEventMs == null) {
        newestEventMs = new Date(pageItems[0].endTime).getTime()
      } else {
        newestEventMs = Math.max(newestEventMs, new Date(pageItems[0].endTime).getTime())
      }

      for (const item of pageItems) {
        const playedAtMs = new Date(item.endTime).getTime()

        if (checkpointMs != null && playedAtMs <= checkpointMs) {
          shouldContinue = false
          break
        }

        streams.push(item)
      }

      pageCount += 1

      if (
        checkpointMs == null ||
        pageItems.length < STATSFM_PAGE_LIMIT ||
        pageCount >= STATSFM_INCREMENTAL_PAGE_LIMIT
      ) {
        break
      }

      const oldestItem = pageItems[pageItems.length - 1]
      before = new Date(oldestItem.endTime).getTime() - 1
    }

    const uniqueTrackIds = [...new Set(streams.map((item) => item.trackId))]
    const tracks = new Map(
      await Promise.all(
        uniqueTrackIds.map(async (trackId) => [trackId, await client.getTrack(trackId)] as const)
      )
    )

    return {
      nextCheckpoint:
        newestEventMs != null && Number.isFinite(newestEventMs)
          ? String(newestEventMs)
          : input.checkpoint,
      events: streams.map((stream) => {
        const track = tracks.get(stream.trackId)
        const artistNames = track?.artists?.map((artist) => artist.name).filter(Boolean) ?? []
        const artistName = artistNames.length > 0 ? artistNames.join(", ") : "Unknown Artist"
        const albumName = track?.albums?.[0]?.name
        const trackName = track?.name ?? stream.trackName

        return {
          provider: this.provider,
          providerUserKey: stream.userId,
          providerEventKey: stream.id,
          playedAt: stream.endTime,
          trackName,
          artistName,
          albumName,
          artistKey: createCanonicalKey(artistName),
          trackKey: createCanonicalKey(trackName),
          albumKey: albumName ? createCanonicalKey(albumName) : undefined,
          rawRef: `statsfm:track:${stream.trackId}`
        }
      })
    }
  }
}
