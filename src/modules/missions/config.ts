export const missionCellOrder = [
  "daily_india",
  "daily_individual",
  "daily_state",
  "weekly_india",
  "weekly_individual",
  "weekly_state"
] as const

export type MissionCellKey = (typeof missionCellOrder)[number]
export type MissionCadence = "daily" | "weekly"
export type MissionKind = "india_shared" | "individual_personal" | "state_shared"
export type MissionMechanicType = "track_streams" | "album_completions"
export type MissionTargetKind = "track" | "album"
export type RewardRouting =
  | "individual_and_state"
  | "state_only"
  | "contributor_individual_and_state"
export type MissionMechanicValueMap<T> = Record<MissionMechanicType, T>

export type MissionCellConfig = {
  missionCellKey: MissionCellKey
  cadence: MissionCadence
  missionKind: MissionKind
  label: string
  description: string
  defaultRewardPoints: number
  defaultRewardPointsByMechanic: MissionMechanicValueMap<number>
  defaultMechanicType: MissionMechanicType
  targetSelectionCount: MissionMechanicValueMap<number>
  defaultGoalUnitsByMechanic: MissionMechanicValueMap<number>
  descriptionByMechanic: MissionMechanicValueMap<string>
  perItemTargetCount: number
  rewardRouting: RewardRouting
}

export const missionCellConfig: Record<MissionCellKey, MissionCellConfig> = {
  daily_india: {
    missionCellKey: "daily_india",
    cadence: "daily",
    missionKind: "india_shared",
    label: "India Daily Push",
    description: "All contributors across India work on one shared BTS mission before reset.",
    defaultRewardPoints: 25,
    defaultRewardPointsByMechanic: {
      track_streams: 25,
      album_completions: 40
    },
    defaultMechanicType: "track_streams",
    targetSelectionCount: {
      track_streams: 10,
      album_completions: 1
    },
    defaultGoalUnitsByMechanic: {
      track_streams: 250,
      album_completions: 25
    },
    descriptionByMechanic: {
      track_streams: "All contributors across India work on one shared BTS streaming milestone before reset.",
      album_completions: "All contributors across India work on one shared BTS album completion mission before reset."
    },
    perItemTargetCount: 1,
    rewardRouting: "contributor_individual_and_state"
  },
  daily_individual: {
    missionCellKey: "daily_individual",
    cadence: "daily",
    missionKind: "individual_personal",
    label: "Your Daily Mission",
    description: "Finish today’s personal BTS mission and score for yourself and your state.",
    defaultRewardPoints: 75,
    defaultRewardPointsByMechanic: {
      track_streams: 50,
      album_completions: 75
    },
    defaultMechanicType: "album_completions",
    targetSelectionCount: {
      track_streams: 5,
      album_completions: 1
    },
    defaultGoalUnitsByMechanic: {
      track_streams: 25,
      album_completions: 1
    },
    descriptionByMechanic: {
      track_streams: "Finish today’s personal BTS streaming mission and score for yourself and your state.",
      album_completions: "Complete today’s assigned BTS album once to score for yourself and your state."
    },
    perItemTargetCount: 5,
    rewardRouting: "individual_and_state"
  },
  daily_state: {
    missionCellKey: "daily_state",
    cadence: "daily",
    missionKind: "state_shared",
    label: "Your State Daily Push",
    description: "Your state works on the same BTS mission definition, but progress is tracked state by state.",
    defaultRewardPoints: 100,
    defaultRewardPointsByMechanic: {
      track_streams: 100,
      album_completions: 140
    },
    defaultMechanicType: "track_streams",
    targetSelectionCount: {
      track_streams: 10,
      album_completions: 1
    },
    defaultGoalUnitsByMechanic: {
      track_streams: 50,
      album_completions: 5
    },
    descriptionByMechanic: {
      track_streams: "Your state works on the same BTS streaming mission definition, but progress is tracked state by state.",
      album_completions: "Your state works on the same BTS album completion mission definition, but progress is tracked state by state."
    },
    perItemTargetCount: 1,
    rewardRouting: "state_only"
  },
  weekly_india: {
    missionCellKey: "weekly_india",
    cadence: "weekly",
    missionKind: "india_shared",
    label: "India Weekly Push",
    description: "A larger shared BTS mission for contributors across the full India weekly period.",
    defaultRewardPoints: 200,
    defaultRewardPointsByMechanic: {
      track_streams: 120,
      album_completions: 200
    },
    defaultMechanicType: "album_completions",
    targetSelectionCount: {
      track_streams: 20,
      album_completions: 5
    },
    defaultGoalUnitsByMechanic: {
      track_streams: 2500,
      album_completions: 250
    },
    descriptionByMechanic: {
      track_streams: "A larger shared BTS streaming milestone for contributors across the full India weekly period.",
      album_completions: "A larger shared BTS album completion mission for contributors across the full India weekly period."
    },
    perItemTargetCount: 1,
    rewardRouting: "contributor_individual_and_state"
  },
  weekly_individual: {
    missionCellKey: "weekly_individual",
    cadence: "weekly",
    missionKind: "individual_personal",
    label: "Your Weekly Mission",
    description: "Keep your weekly BTS slate moving and turn completions into leaderboard points.",
    defaultRewardPoints: 300,
    defaultRewardPointsByMechanic: {
      track_streams: 300,
      album_completions: 420
    },
    defaultMechanicType: "track_streams",
    targetSelectionCount: {
      track_streams: 40,
      album_completions: 5
    },
    defaultGoalUnitsByMechanic: {
      track_streams: 200,
      album_completions: 5
    },
    descriptionByMechanic: {
      track_streams: "Keep your weekly BTS streaming slate moving and turn completions into leaderboard points.",
      album_completions: "Complete the assigned BTS albums during the week and turn those finishes into leaderboard points."
    },
    perItemTargetCount: 5,
    rewardRouting: "individual_and_state"
  },
  weekly_state: {
    missionCellKey: "weekly_state",
    cadence: "weekly",
    missionKind: "state_shared",
    label: "Your State Weekly Push",
    description: "Every state races its own weekly BTS milestone using the same live mission definition.",
    defaultRewardPoints: 800,
    defaultRewardPointsByMechanic: {
      track_streams: 600,
      album_completions: 800
    },
    defaultMechanicType: "album_completions",
    targetSelectionCount: {
      track_streams: 20,
      album_completions: 5
    },
    defaultGoalUnitsByMechanic: {
      track_streams: 500,
      album_completions: 50
    },
    descriptionByMechanic: {
      track_streams: "Every state races its own weekly BTS streaming milestone using the same live mission definition.",
      album_completions: "Every state races its own weekly BTS album completion mission using the same live mission definition."
    },
    perItemTargetCount: 1,
    rewardRouting: "state_only"
  }
}

export function getMissionCellConfig(missionCellKey: MissionCellKey) {
  return missionCellConfig[missionCellKey]
}
