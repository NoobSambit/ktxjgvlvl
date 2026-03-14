import type { CatalogOption } from "@/modules/catalog/service"
import type { MissionSlotKey, MissionTargetKind } from "@/modules/missions/config"

export type MissionCard = {
  id: string
  slotKey: MissionSlotKey
  title: string
  description: string
  cadence: "daily" | "weekly"
  startsAt: string
  endsAt: string
  periodKey: string
  progress: number
  goal: number
  rewardPoints: number
  scope: string
  rewardLabel: string
  focus: string
  selectionSource: "admin" | "random"
  isCompleted: boolean
  rewardAwarded: boolean
  targets: MissionTargetView[]
}

export type MissionTargetView = {
  key: string
  kind: MissionTargetKind
  title: string
  artistName: string
  targetCount: number
  progress: number
  trackCount?: number
}

export type MissionPageState = {
  missions: MissionCard[]
  isAuthenticated: boolean
  lastfmConnection: {
    username: string
    verificationStatus: "pending" | "verified" | "failed"
  } | null
  regionConfirmed: boolean
  city?: string
  state?: string
  verificationBlockedReason?: string
  resetTimezone: string
}

export type AdminMissionSlotView = {
  slotKey: MissionSlotKey
  cadence: "daily" | "weekly"
  label: string
  description: string
  targetKind: MissionTargetKind
  minSelections: number
  maxSelections: number
  defaultRewardPoints: number
  options: CatalogOption[]
  currentMission: MissionCard | null
  currentOverride: {
    itemKeys: string[]
    rewardPoints?: number
  } | null
}

export type MissionAdminState = {
  slots: AdminMissionSlotView[]
  catalogSummary: {
    trackCount: number
    albumCount: number
  }
  currentPeriodKeys: {
    daily: string
    weekly: string
  }
}
