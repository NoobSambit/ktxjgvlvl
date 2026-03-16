import {
  type TrackerConnectionInput,
  type TrackerFetchResult,
  type TrackerProviderAdapter,
  createCanonicalKey
} from "@/platform/integrations/trackers/base"

export class MusicatAdapter implements TrackerProviderAdapter {
  provider = "musicat" as const

  async validateUsername(username: string) {
    return username.trim().length >= 2
  }

  async fetchSince(input: TrackerConnectionInput): Promise<TrackerFetchResult> {
    const checkpointSuffix = input.checkpoint ? "-sync" : "-seed"

    return {
      nextCheckpoint: `${input.username}${checkpointSuffix}`,
      events: [
        {
          provider: this.provider,
          providerUserKey: input.username,
          providerEventKey: `${input.username}-musicat-1`,
          playedAt: new Date().toISOString(),
          trackName: "Standing Next to You",
          artistName: "Jungkook",
          albumName: "Golden",
          artistKey: createCanonicalKey("Jungkook"),
          trackKey: createCanonicalKey("Standing Next to You"),
          albumKey: createCanonicalKey("Golden"),
          rawRef: "demo:musicat:event:1"
        }
      ]
    }
  }
}
