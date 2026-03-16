export type LocationStateView = {
  stateKey: string
  stateLabel: string
  stateCode: string
}

export type LocationPlaceView = {
  placeKey: string
  placeLabel: string
  stateKey: string
  stateLabel: string
  districtLabel?: string
  latitude: number
  longitude: number
  secondaryLabel?: string
}

export type LocationSuggestionView = {
  source: "hosting_header" | "ipapi"
  confidence: "low" | "medium" | "high"
  state?: LocationStateView
  place?: LocationPlaceView
}

export type UserLocationSummaryView = {
  stateKey?: string
  stateLabel?: string
  cityKey?: string
  cityLabel?: string
  cityMode: "confirmed" | "ip_fallback" | "missing"
  locationNeedsReview: boolean
  suggestedCityKey?: string
  suggestedCityLabel?: string
}
