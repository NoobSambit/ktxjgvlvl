import type { TrackerProvider } from "@/platform/integrations/trackers/base"
import type { CatalogOption } from "@/modules/catalog/service"
import type {
  MissionCadence,
  MissionCellKey,
  MissionKind,
  MissionMechanicValueMap,
  MissionMechanicType,
  MissionTargetKind
} from "@/modules/missions/config"

export type MissionTargetTrackView = {
  key: string
  title: string
  artistName: string
  spotifyUrl?: string
  isCompleted: boolean
}

export type MissionTargetView = {
  key: string
  kind: MissionTargetKind
  title: string
  artistName: string
  imageUrl?: string
  spotifyUrl?: string
  targetCount?: number
  progress?: number
  trackCount?: number
  completedTrackCount?: number
  tracks?: MissionTargetTrackView[]
}

export type MissionCompletionState = "locked" | "in_progress" | "completed"
export type MissionProgressScopeType = "india" | "user" | "state"

export type MissionCard = {
  id: string
  missionCellKey: MissionCellKey
  missionKind: MissionKind
  mechanicType: MissionMechanicType
  cadence: MissionCadence
  title: string
  description: string
  startsAt: string
  endsAt: string
  periodKey: string
  goalUnits: number
  rewardPoints: number
  rewardLabel: string
  selectionMode: "admin" | "random"
  progressScopeType: MissionProgressScopeType
  aggregateProgress: number
  userContribution: number
  contributorCount?: number
  completionState: MissionCompletionState
  focus: string
  scopeLabel: string
  targets: MissionTargetView[]
}

export type MissionPageState = {
  daily: MissionCard[]
  weekly: MissionCard[]
  isAuthenticated: boolean
  trackerConnection: {
    provider: TrackerProvider
    username: string
    verificationStatus: "pending" | "verified" | "failed"
    lastSuccessfulSyncAt?: string
  } | null
  regionConfirmed: boolean
  state?: string
  streamPointValue: number
  verificationStatus: "ready" | "blocked"
  verificationBlockedReason?: string
  resetTimezone: string
}

export type AdminMissionOverrideView = {
  mechanicType: MissionMechanicType
  targetKeys: string[]
  goalUnits: number
  rewardPoints: number
}

export type AdminMissionPlanView = {
  periodKey: string
  selectionMode: "admin" | "random"
  mechanicType: MissionMechanicType
  goalUnits: number
  rewardPoints: number
  rewardLabel: string
  focus: string
  targets: CatalogOption[]
}

export type AdminMissionCellView = {
  missionCellKey: MissionCellKey
  cadence: MissionCadence
  missionKind: MissionKind
  label: string
  description: string
  defaultRewardPoints: number
  defaultRewardPointsByMechanic: MissionMechanicValueMap<number>
  defaultMechanicType: MissionMechanicType
  defaultGoalUnitsByMechanic: MissionMechanicValueMap<number>
  trackOptions: CatalogOption[]
  albumOptions: CatalogOption[]
  liveMissions: MissionMechanicValueMap<MissionCard | null>
  nextPeriodKey: string
  nextMissions: MissionMechanicValueMap<AdminMissionPlanView | null>
  nextOverrides: MissionMechanicValueMap<AdminMissionOverrideView | null>
  liveStateBreakdownByMechanic: MissionMechanicValueMap<Array<{
    stateKey: string
    stateLabel: string
    progressUnits: number
    goalUnits: number
    completedAt?: string
  }>>
}

export type MissionAdminState = {
  cells: AdminMissionCellView[]
  catalogSummary: {
    trackCount: number
    albumCount: number
  }
  currentPeriodKeys: {
    daily: string
    weekly: string
  }
  nextPeriodKeys: {
    daily: string
    weekly: string
  }
  streamPointValue: number
  lastTrackerSyncAt?: string
  lastMissionGenerationAt?: string
  lastLeaderboardMaterializedAt?: string
}
