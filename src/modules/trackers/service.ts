import { getCurrentUserRecord, requireAuthenticatedUserRecord } from "@/platform/auth/current-user"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { connectToDatabase } from "@/platform/db/mongoose"
import { getLastFmClient } from "@/platform/integrations/trackers/lastfm-client"
import type { TrackerProvider } from "@/platform/integrations/trackers/base"
import type { TrackerConnectionView } from "@/modules/trackers/types"

function toTrackerView(connection: {
  provider: TrackerProvider
  username: string
  verificationStatus: "pending" | "verified" | "failed"
  lastSuccessfulSyncAt?: Date
}): TrackerConnectionView {
  return {
    provider: connection.provider,
    username: connection.username,
    verificationStatus: connection.verificationStatus,
    lastSuccessfulSyncAt: connection.lastSuccessfulSyncAt?.toISOString(),
    label: "Last.fm scrobble verification",
    helperText: "This is the only live mission-verification provider in the current build."
  }
}

export async function listTrackerConnections() {
  await connectToDatabase()

  const user = await getCurrentUserRecord()
  const connections = (await TrackerConnectionModel.find({
    userId: user._id
  })
    .sort({ provider: 1 })
    .lean()) as unknown as Array<{
    provider: TrackerProvider
    username: string
    verificationStatus: "pending" | "verified" | "failed"
    lastSuccessfulSyncAt?: Date
  }>

  return connections.map(toTrackerView)
}

export async function connectTracker(provider: TrackerProvider, username: string) {
  await connectToDatabase()

  if (provider !== "lastfm") {
    throw new Error("Only Last.fm mission verification is enabled in this build.")
  }

  const normalizedUsername = username.trim()

  if (!normalizedUsername) {
    throw new Error("Last.fm username is required.")
  }

  await getLastFmClient().getUserInfo(normalizedUsername)

  const user = await requireAuthenticatedUserRecord()
  const connection = await TrackerConnectionModel.findOneAndUpdate(
    {
      userId: user._id,
      provider
    },
    {
      $set: {
        username: normalizedUsername,
        verificationStatus: "verified"
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  return toTrackerView({
    provider,
    username: connection.username,
    verificationStatus: connection.verificationStatus,
    lastSuccessfulSyncAt: connection.lastSuccessfulSyncAt
  })
}
