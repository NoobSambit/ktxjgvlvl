const STATSFM_BASE_URL = "https://api.stats.fm/api/v1"
const STATSFM_REQUEST_TIMEOUT_MS = 15_000

type StatsFmTrack = {
  albums?: Array<{
    id: number
    name: string
  }>
  artists?: Array<{
    id: number
    name: string
  }>
  id: number
  name: string
}

type StatsFmUserResponse = {
  item: {
    id: string
    customId?: string | null
    displayName?: string | null
    privacySettings?: {
      streams?: boolean
    }
  }
}

export type StatsFmStreamItem = {
  id: string
  userId: string
  endTime: string
  playedMs: number
  trackId: number
  trackName: string
  albumId?: number
  artistIds?: number[]
}

type StatsFmStreamsResponse = {
  items: StatsFmStreamItem[]
}

type StatsFmTrackResponse = {
  item: StatsFmTrack
}

export class StatsFmClient {
  private readonly trackCache = new Map<number, StatsFmTrack>()

  private async request<T>(path: string) {
    let response: Response

    try {
      response = await fetch(`${STATSFM_BASE_URL}${path}`, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(STATSFM_REQUEST_TIMEOUT_MS)
      })
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
      ) {
        throw new Error("stats.fm request timed out.")
      }

      throw error
    }

    if (!response.ok) {
      throw new Error(`stats.fm request failed with status ${response.status}.`)
    }

    return (await response.json()) as T
  }

  async getUser(username: string) {
    return this.request<StatsFmUserResponse>(`/users/${encodeURIComponent(username)}`)
  }

  async getStreams(username: string, options: { before?: number; limit?: number } = {}) {
    const url = new URL(`${STATSFM_BASE_URL}/users/${encodeURIComponent(username)}/streams`)

    if (options.limit) {
      url.searchParams.set("limit", String(options.limit))
    }

    if (options.before != null) {
      url.searchParams.set("before", String(options.before))
    }

    return this.request<StatsFmStreamsResponse>(url.pathname + url.search)
  }

  async getTrack(trackId: number) {
    const cachedTrack = this.trackCache.get(trackId)

    if (cachedTrack) {
      return cachedTrack
    }

    const response = await this.request<StatsFmTrackResponse>(`/tracks/${trackId}`)
    this.trackCache.set(trackId, response.item)
    return response.item
  }
}

let statsFmClient: StatsFmClient | null = null

export function getStatsFmClient() {
  if (!statsFmClient) {
    statsFmClient = new StatsFmClient()
  }

  return statsFmClient
}
