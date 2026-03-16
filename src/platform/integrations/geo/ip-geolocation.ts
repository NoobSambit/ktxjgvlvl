import { env } from "@/platform/validation/env"

export type GeoSuggestion = {
  country: string
  state: string
  city: string
  confidence: "low" | "medium" | "high"
  source: "ipapi" | "hosting_header"
}

type IpApiResponse = {
  country_name?: string
  country_code?: string
  region?: string
  city?: string
}

async function fetchIpApiSuggestion(ipAddress?: string): Promise<GeoSuggestion | null> {
  const baseUrl = ipAddress
    ? `https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`
    : "https://ipapi.co/json/"
  const apiKey = env.IP_GEOLOCATION_API_KEY
  const url = apiKey ? `${baseUrl}?key=${encodeURIComponent(apiKey)}` : baseUrl

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "IndiaForBTS/1.0"
    },
    next: { revalidate: 3600 }
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as IpApiResponse

  if (data.country_code?.toUpperCase() !== "IN" || !data.region) {
    return null
  }

  return {
    source: "ipapi",
    country: data.country_name ?? "India",
    state: data.region,
    city: data.city ?? "",
    confidence: data.city ? "medium" : "low"
  }
}

export async function suggestRegionFromIp(ipAddress?: string): Promise<GeoSuggestion | null> {
  if ((env.IP_GEOLOCATION_PROVIDER ?? "ipapi") !== "ipapi") {
    return null
  }

  try {
    return await fetchIpApiSuggestion(ipAddress)
  } catch {
    return null
  }
}
