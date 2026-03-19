import { getCurrentUserRecord, requireAuthenticatedUserRecord } from "@/platform/auth/current-user"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { connectToDatabase } from "@/platform/db/mongoose"
import { getTrackerAdapter } from "@/platform/integrations/trackers"
import type { TrackerProvider } from "@/platform/integrations/trackers/base"
import { getTrackerProviderConfig } from "@/modules/trackers/provider-config"
import type { TrackerConnectionView } from "@/modules/trackers/types"

function toTrackerView(connection: {
  provider: TrackerProvider
  username: string
  verificationStatus: "pending" | "verified" | "failed"
  lastSuccessfulSyncAt?: Date
}): TrackerConnectionView {
  const providerConfig = getTrackerProviderConfig(connection.provider)

  return {
    provider: connection.provider,
    username: connection.username,
    verificationStatus: connection.verificationStatus,
    lastSuccessfulSyncAt: connection.lastSuccessfulSyncAt?.toISOString(),
    label: providerConfig.verificationLabel,
    helperText: providerConfig.helperText
  }
}

function normalizeTrackerUsername(username: string) {
  return username.trim().replace(/^@/, "")
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

  const providerConfig = getTrackerProviderConfig(provider)
  const adapter = getTrackerAdapter(provider)

  if (!adapter) {
    throw new Error(`${providerConfig.displayName} is not available in this build.`)
  }

  const normalizedUsername = normalizeTrackerUsername(username)

  if (!normalizedUsername) {
    throw new Error(`${providerConfig.displayName} username is required.`)
  }

  const user = await requireAuthenticatedUserRecord()
  const existingConnection = await TrackerConnectionModel.findOne({
    userId: user._id
  })

  if (existingConnection && existingConnection.provider !== provider) {
    const existingProviderConfig = getTrackerProviderConfig(existingConnection.provider)

    throw new Error(
      `Disconnect ${existingProviderConfig.displayName} before connecting ${providerConfig.displayName}.`
    )
  }

  const isValid = await adapter.validateUsername(normalizedUsername)

  if (!isValid) {
    throw new Error(`We could not verify that ${normalizedUsername} exists on ${providerConfig.displayName}.`)
  }

  const isUsernameChanged =
    existingConnection?.provider === provider && existingConnection.username !== normalizedUsername
  const connection = await TrackerConnectionModel.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        provider,
        username: normalizedUsername,
        verificationStatus: "verified",
        ...(isUsernameChanged
          ? {
              lastCheckpoint: null,
              lastSyncAt: null,
              lastSuccessfulSyncAt: null
            }
          : {})
      },
      ...(isUsernameChanged ? { $inc: { usernameChangeCount: 1 } } : {})
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

export async function disconnectTracker(provider: TrackerProvider) {
  await connectToDatabase()

  const user = await requireAuthenticatedUserRecord()

  await TrackerConnectionModel.deleteOne({
    userId: user._id,
    provider
  })

  return {
    provider
  }
}
