export type StreamingSyncSummary = {
  syncedEvents: number
  scoredEvents: number
  provider: string
  checkpoint: string | null
}
