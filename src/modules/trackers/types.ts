import type { TrackerProvider } from "@/platform/integrations/trackers/base"

export type TrackerConnectionView = {
  provider: TrackerProvider
  username: string
  verificationStatus: "pending" | "verified" | "failed"
  lastSuccessfulSyncAt?: string
  label: string
  helperText: string
}
