import { Schema, model, models } from "mongoose"

const missionTargetSchema = new Schema(
  {
    kind: { type: String, enum: ["track", "album"], required: true },
    trackKey: { type: String },
    trackTitle: { type: String },
    albumKey: { type: String },
    albumTitle: { type: String },
    artistKey: { type: String },
    artistName: { type: String },
    targetCount: { type: Number },
    trackKeys: { type: [String], default: [] }
  },
  { _id: false }
)

const missionInstanceSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 2, index: true },
    cadence: { type: String, enum: ["daily", "weekly"], required: true, index: true },
    missionCellKey: {
      type: String,
      enum: [
        "daily_india",
        "daily_individual",
        "daily_state",
        "weekly_india",
        "weekly_individual",
        "weekly_state"
      ],
      required: true,
      index: true
    },
    slotKey: { type: String, index: true },
    missionKind: {
      type: String,
      enum: ["india_shared", "individual_personal", "state_shared"],
      required: true
    },
    mechanicType: {
      type: String,
      enum: ["track_streams", "album_completions"],
      required: true
    },
    periodKey: { type: String, required: true, index: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalUnits: { type: Number, required: true },
    rewardRouting: {
      type: String,
      enum: ["individual_and_state", "state_only", "contributor_individual_and_state"],
      required: true
    },
    rewardPoints: { type: Number, default: 0 },
    selectionMode: { type: String, enum: ["admin", "random"], required: true },
    isActive: { type: Boolean, default: true },
    targetConfig: {
      targets: { type: [missionTargetSchema], default: [] }
    }
  },
  { timestamps: true }
)

missionInstanceSchema.index({ schemaVersion: 1, missionCellKey: 1, periodKey: 1 }, { unique: true })

const userMissionProgressSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 2, index: true },
    missionInstanceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "MissionInstance",
      index: true
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    progressValue: { type: Number, default: 0 },
    completedAt: { type: Date },
    rewardAwardedAt: { type: Date },
    targetProgress: {
      type: Map,
      of: Number,
      default: () => new Map()
    }
  },
  { timestamps: true }
)

userMissionProgressSchema.index({ schemaVersion: 1, missionInstanceId: 1, userId: 1 }, { unique: true })

const sharedMissionProgressSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 2, index: true },
    missionInstanceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "MissionInstance",
      index: true
    },
    scopeType: { type: String, enum: ["india", "state"], required: true },
    scopeKey: { type: String, required: true, index: true },
    scopeLabel: { type: String, required: true },
    progressValue: { type: Number, default: 0 },
    goalUnits: { type: Number, required: true },
    contributorCount: { type: Number, default: 0 },
    targetProgress: {
      type: Map,
      of: Number,
      default: () => new Map()
    },
    completedAt: { type: Date },
    rewardAwardedAt: { type: Date }
  },
  { timestamps: true }
)

sharedMissionProgressSchema.index(
  { schemaVersion: 1, missionInstanceId: 1, scopeType: 1, scopeKey: 1 },
  { unique: true }
)

const missionContributionSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 2, index: true },
    missionInstanceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "MissionInstance",
      index: true
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    contributionUnits: { type: Number, default: 0 },
    stateKey: { type: String },
    qualifiedAt: { type: Date },
    rewardAwardedAt: { type: Date }
  },
  { timestamps: true }
)

missionContributionSchema.index(
  { schemaVersion: 1, missionInstanceId: 1, userId: 1 },
  { unique: true }
)

const missionOverrideSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 2, index: true },
    missionCellKey: {
      type: String,
      enum: [
        "daily_india",
        "daily_individual",
        "daily_state",
        "weekly_india",
        "weekly_individual",
        "weekly_state"
      ],
      required: true,
      index: true
    },
    slotKey: { type: String, index: true },
    cadence: { type: String, enum: ["daily", "weekly"], required: true },
    periodKey: { type: String, required: true, index: true },
    mechanicType: { type: String, enum: ["track_streams", "album_completions"], required: true },
    targetKeys: { type: [String], default: [] },
    goalUnits: { type: Number, required: true },
    rewardPoints: { type: Number, required: true },
    createdById: { type: Schema.Types.ObjectId, ref: "User" },
    updatedById: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
)

missionOverrideSchema.index({ schemaVersion: 1, missionCellKey: 1, periodKey: 1 }, { unique: true })

export const MissionInstanceModel =
  models.MissionInstance || model("MissionInstance", missionInstanceSchema)
export const UserMissionProgressModel =
  models.UserMissionProgress || model("UserMissionProgress", userMissionProgressSchema)
export const SharedMissionProgressModel =
  models.SharedMissionProgress || model("SharedMissionProgress", sharedMissionProgressSchema)
export const MissionContributionModel =
  models.MissionContribution || model("MissionContribution", missionContributionSchema)
export const MissionOverrideModel =
  models.MissionOverride || model("MissionOverride", missionOverrideSchema)
