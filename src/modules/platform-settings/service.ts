import { PlatformSettingsModel } from "@/platform/db/models/platform-settings"
import { connectToDatabase } from "@/platform/db/mongoose"

export async function getPlatformSettings() {
  await connectToDatabase()

  const settings = await PlatformSettingsModel.findOneAndUpdate(
    { key: "default" },
    {
      $setOnInsert: {
        streamPointValue: 1
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).lean() as { streamPointValue?: number } | null

  return settings
}

export async function getStreamPointValue() {
  const settings = await getPlatformSettings()
  return settings?.streamPointValue ?? 1
}
