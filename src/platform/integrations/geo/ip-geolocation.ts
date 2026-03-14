export type GeoSuggestion = {
  country: string
  state: string
  city: string
  confidence: "low" | "medium" | "high"
}

export async function suggestRegionFromIp(_ipAddress?: string): Promise<GeoSuggestion> {
  return {
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    confidence: "medium"
  }
}
