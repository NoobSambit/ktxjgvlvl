const MUSICAT_BASE_URL = "https://api.musicat.fm"
const MUSICAT_PUBLIC_BEARER = "invalid"
const MUSICAT_REQUEST_TIMEOUT_MS = 15_000

type MusicatSearchResult = {
  primaryText: string
  secondaryText: string
  publicId: string
  imageUrl?: string | null
}

type MusicatUserProfile = {
  publicId: string
  profileUrl: string
  name: string
}

export type MusicatListeningHistoryItem = {
  publicId: string
  name: string
  artists: string
  playedAt: string
  source: string
}

type MusicatRange = {
  start: string | null
  end: string | null
  name: "stats.range.allTime"
}

export class MusicatClient {
  private async request<T>(path: string, init: RequestInit = {}) {
    let response: Response

    try {
      response = await fetch(`${MUSICAT_BASE_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${MUSICAT_PUBLIC_BEARER}`,
          ...(init.headers ?? {})
        },
        signal: AbortSignal.timeout(MUSICAT_REQUEST_TIMEOUT_MS)
      })
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError")
      ) {
        throw new Error("Musicat request timed out.")
      }

      throw error
    }

    const contentType = response.headers.get("content-type") ?? ""

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const data = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((item) => item.msg).filter(Boolean).join(" ")
              : null

        throw new Error(detail || `Musicat request failed with status ${response.status}.`)
      }

      const text = await response.text()
      throw new Error(text || `Musicat request failed with status ${response.status}.`)
    }

    if (!contentType.includes("application/json")) {
      throw new Error("Musicat returned an unexpected response format.")
    }

    return (await response.json()) as T
  }

  async searchUsers(query: string) {
    const url = new URL(`${MUSICAT_BASE_URL}/v1/users/search`)
    url.searchParams.set("query", query)

    return this.request<MusicatSearchResult[]>(url.pathname + url.search)
  }

  async getUser(publicUserId: string) {
    const url = new URL(`${MUSICAT_BASE_URL}/v1/users`)
    url.searchParams.set("user", publicUserId)

    return this.request<MusicatUserProfile>(url.pathname + url.search)
  }

  async getListeningHistory(publicUserId: string) {
    return this.request<MusicatListeningHistoryItem[]>("/v1/users/listening-history", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        publicUserId,
        sorting: "DESC",
        range: {
          start: null,
          end: null,
          name: "stats.range.allTime"
        } satisfies MusicatRange
      })
    })
  }

  async resolveUser(username: string) {
    const normalizedUsername = username.trim().replace(/^@/, "")

    if (!normalizedUsername) {
      throw new Error("Musicat username is required.")
    }

    const results = await this.searchUsers(normalizedUsername)
    const loweredUsername = normalizedUsername.toLowerCase()
    const match =
      results.find(
        (result) => result.secondaryText.replace(/^@/, "").trim().toLowerCase() === loweredUsername
      ) ??
      results.find((result) => result.primaryText.trim().toLowerCase() === loweredUsername) ??
      results.find((result) => result.publicId.toLowerCase() === loweredUsername)

    if (!match) {
      throw new Error("Musicat user was not found.")
    }

    const profile = await this.getUser(match.publicId)

    return {
      publicId: profile.publicId,
      profileUrl: profile.profileUrl,
      name: profile.name
    }
  }
}

let musicatClient: MusicatClient | null = null

export function getMusicatClient() {
  if (!musicatClient) {
    musicatClient = new MusicatClient()
  }

  return musicatClient
}
