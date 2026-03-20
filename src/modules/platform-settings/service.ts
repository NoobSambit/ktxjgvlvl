import { unstable_cache } from "next/cache"
import { cacheTags, sharedCacheRevalidateSeconds } from "@/platform/cache/shared"
import { PlatformSettingsModel } from "@/platform/db/models/platform-settings"
import { connectToDatabase } from "@/platform/db/mongoose"

const getPlatformSettingsCached = unstable_cache(async () => {
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

  return settings ?? { streamPointValue: 1 }
}, ["platform-settings:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.platformSettings]
})

export async function getPlatformSettings() {
  return getPlatformSettingsCached()
}

export async function getStreamPointValue() {
  const settings = await getPlatformSettings()
  return settings?.streamPointValue ?? 1
}
