import { env } from "@/platform/validation/env"

const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/"
const LASTFM_REQUEST_TIMEOUT_MS = 15_000

type LastFmApiImage = {
  "#text": string
  size: string
}

type LastFmUserInfoResponse = {
  user: {
    name: string
    playcount: string
    image?: LastFmApiImage[]
  }
}

type LastFmRecentTrack = {
  name: string
  artist: string | { "#text"?: string; name?: string }
  album?: { "#text"?: string }
  date?: { uts: string }
  url?: string
  "@attr"?: { nowplaying?: string }
}

type LastFmRecentTracksResponse = {
  recenttracks: {
    track?: LastFmRecentTrack | LastFmRecentTrack[]
    "@attr"?: {
      total?: string
      totalPages?: string
    }
  }
}

type LastFmErrorResponse = {
  error: number
  message: string
}

export type LastFmRecentTrackView = {
  name: string
  artistName: string
  albumName: string
  timestamp: Date | null
  url?: string
  nowPlaying: boolean
}

type LastFmRecentTrackOptions = {
  from?: number
  to?: number
  page?: number
  limit?: number
}

class RateLimiter {
  private tokens = 5
  private lastRefillAt = Date.now()

  private refill() {
    const now = Date.now()
    const elapsed = now - this.lastRefillAt
    const replenished = (elapsed / 1000) * 5

    this.tokens = Math.min(5, this.tokens + replenished)
    this.lastRefillAt = now
  }

  async acquire() {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }

    const waitMs = ((1 - this.tokens) / 5) * 1000
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens = Math.max(0, this.tokens - 1)
  }
}

export class LastFmClient {
  private readonly apiKey: string
  private readonly rateLimiter = new RateLimiter()

  constructor(apiKey = env.LASTFM_API_KEY ?? "") {
    this.apiKey = apiKey
  }

  private async request<T>(params: Record<string, string | number>) {
    if (!this.apiKey) {
      throw new Error("LASTFM_API_KEY is required for Last.fm verification.")
    }

    await this.rateLimiter.acquire()

    const url = new URL(LASTFM_BASE_URL)
    url.searchParams.set("api_key", this.apiKey)
    url.searchParams.set("format", "json")

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value))
    }

    let response: Response

    try {
      response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(LASTFM_REQUEST_TIMEOUT_MS)
      })
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
      ) {
        throw new Error("Last.fm request timed out.")
      }

      throw error
    }

    if (!response.ok) {
      throw new Error(`Last.fm request failed with status ${response.status}.`)
    }

    const data = (await response.json()) as T | LastFmErrorResponse

    if ("error" in (data as LastFmErrorResponse)) {
      throw new Error((data as LastFmErrorResponse).message)
    }

    return data as T
  }

  async getUserInfo(username: string) {
    const response = await this.request<LastFmUserInfoResponse>({
      method: "user.getinfo",
      user: username
    })

    return response.user
  }

  async getRecentTracks(username: string, options: LastFmRecentTrackOptions = {}) {
    const response = await this.request<LastFmRecentTracksResponse>({
      method: "user.getrecenttracks",
      user: username,
      page: options.page ?? 1,
      limit: options.limit ?? 200,
      extended: 0,
      ...(options.from ? { from: options.from } : {}),
      ...(options.to ? { to: options.to } : {})
    })

    const tracksRaw = response.recenttracks.track
    const tracks = Array.isArray(tracksRaw) ? tracksRaw : tracksRaw ? [tracksRaw] : []
    const totalPages = Number.parseInt(response.recenttracks["@attr"]?.totalPages ?? "1", 10)

    return {
      tracks: tracks.map<LastFmRecentTrackView>((track) => ({
        name: track.name,
        artistName:
          typeof track.artist === "string"
            ? track.artist
            : track.artist?.name ?? track.artist?.["#text"] ?? "Unknown Artist",
        albumName: track.album?.["#text"] ?? "",
        timestamp: track.date?.uts ? new Date(Number.parseInt(track.date.uts, 10) * 1000) : null,
        url: track.url,
        nowPlaying: track["@attr"]?.nowplaying === "true"
      })),
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1
    }
  }
}

let client: LastFmClient | null = null

export function getLastFmClient() {
  if (!client) {
    client = new LastFmClient()
  }

  return client
}
