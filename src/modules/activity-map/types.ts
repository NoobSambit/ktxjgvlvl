export type ActivityMapStateEntry = {
  stateKey: string
  stateLabel: string
  stateCode: string
  activityScore: number
  verifiedStreamCount: number
  missionCompletionPoints: number
  missionCompletionCount: number
  activeUserCount: number
  centroidLat?: number
  centroidLng?: number
}

export type ActivityMapHotspotEntry = {
  placeKey: string
  placeLabel: string
  stateKey: string
  stateLabel: string
  activityScore: number
  verifiedStreamCount: number
  missionCompletionPoints: number
  missionCompletionCount: number
  activeUserCount: number
  latitude: number
  longitude: number
}

export type ActivityMapView = {
  period: "daily" | "weekly"
  periodKey: string
  states: ActivityMapStateEntry[]
  hotspots: ActivityMapHotspotEntry[]
  topStates: ActivityMapStateEntry[]
  maxStateActivityScore: number
  maxHotspotActivityScore: number
  lastMaterializedAt?: string
}
