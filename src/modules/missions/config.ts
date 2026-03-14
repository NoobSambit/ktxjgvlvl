export const missionSlotOrder = [
  "daily_songs",
  "daily_albums",
  "weekly_songs",
  "weekly_albums"
] as const

export type MissionSlotKey = (typeof missionSlotOrder)[number]

export type MissionTargetKind = "track" | "album"

export type MissionSlotConfig = {
  slotKey: MissionSlotKey
  cadence: "daily" | "weekly"
  targetKind: MissionTargetKind
  label: string
  description: string
  defaultRewardPoints: number
  randomSelectionCount: number
  minSelections: number
  maxSelections: number
  perItemTargetCount: number
}

export const missionSlotConfig: Record<MissionSlotKey, MissionSlotConfig> = {
  daily_songs: {
    slotKey: "daily_songs",
    cadence: "daily",
    targetKind: "track",
    label: "Daily Song Streaming Quest",
    description: "Stream five selected BTS-family songs five times each before the India reset.",
    defaultRewardPoints: 50,
    randomSelectionCount: 5,
    minSelections: 5,
    maxSelections: 5,
    perItemTargetCount: 5
  },
  daily_albums: {
    slotKey: "daily_albums",
    cadence: "daily",
    targetKind: "album",
    label: "Daily Album Streaming Quest",
    description: "Finish two full BTS-family albums inside today’s mission window.",
    defaultRewardPoints: 75,
    randomSelectionCount: 2,
    minSelections: 2,
    maxSelections: 2,
    perItemTargetCount: 1
  },
  weekly_songs: {
    slotKey: "weekly_songs",
    cadence: "weekly",
    targetKind: "track",
    label: "Weekly Song Streaming Quest",
    description: "Keep a full-week push alive with a larger stack of targeted BTS-family songs.",
    defaultRewardPoints: 300,
    randomSelectionCount: 40,
    minSelections: 1,
    maxSelections: 40,
    perItemTargetCount: 5
  },
  weekly_albums: {
    slotKey: "weekly_albums",
    cadence: "weekly",
    targetKind: "album",
    label: "Weekly Album Streaming Quest",
    description: "Work through a full-week album slate and keep every track counted cleanly.",
    defaultRewardPoints: 400,
    randomSelectionCount: 10,
    minSelections: 1,
    maxSelections: 10,
    perItemTargetCount: 1
  }
}

export function getMissionSlotConfig(slotKey: MissionSlotKey) {
  return missionSlotConfig[slotKey]
}
