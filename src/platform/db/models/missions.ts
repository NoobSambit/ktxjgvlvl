import { Schema, model, models } from "mongoose"

const missionRuleSchema = new Schema(
  {
    type: { type: String, required: true },
    trackKey: { type: String },
    trackTitle: { type: String },
    albumKey: { type: String },
    albumTitle: { type: String },
    artistKey: { type: String },
    artistName: { type: String },
    targetCount: { type: Number },
    requireAlbumCompletion: { type: Boolean, default: false }
  },
  { _id: false }
)

const missionTemplateSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    cadence: { type: String, enum: ["daily", "weekly"], required: true },
    rules: { type: [missionRuleSchema], default: [] },
    rewardPoints: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

const missionInstanceSchema = new Schema(
  {
    templateId: { type: Schema.Types.ObjectId, ref: "MissionTemplate" },
    cadence: { type: String, enum: ["daily", "weekly"], required: true, index: true },
    slotKey: {
      type: String,
      enum: ["daily_songs", "daily_albums", "weekly_songs", "weekly_albums"],
      required: true,
      index: true
    },
    periodKey: { type: String, required: true, index: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    timezone: { type: String, default: "Asia/Kolkata" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalValue: { type: Number, required: true },
    rewardPoints: { type: Number, default: 0 },
    selectionSource: { type: String, enum: ["admin", "random"], required: true },
    isActive: { type: Boolean, default: true },
    rules: { type: [missionRuleSchema], default: [] }
  },
  { timestamps: true }
)

missionInstanceSchema.index({ slotKey: 1, periodKey: 1 }, { unique: true })

const userMissionProgressSchema = new Schema(
  {
    missionInstanceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "MissionInstance",
      index: true
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    progressValue: { type: Number, default: 0 },
    completedAt: { type: Date },
    claimedAt: { type: Date },
    rewardAwardedAt: { type: Date },
    ruleProgress: {
      type: Map,
      of: Number,
      default: () => new Map()
    }
  },
  { timestamps: true }
)

userMissionProgressSchema.index({ missionInstanceId: 1, userId: 1 }, { unique: true })

const missionOverrideSchema = new Schema(
  {
    slotKey: {
      type: String,
      enum: ["daily_songs", "daily_albums", "weekly_songs", "weekly_albums"],
      required: true,
      index: true
    },
    cadence: { type: String, enum: ["daily", "weekly"], required: true },
    periodKey: { type: String, required: true, index: true },
    rewardPoints: { type: Number },
    trackKeys: { type: [String], default: [] },
    albumKeys: { type: [String], default: [] },
    createdById: { type: Schema.Types.ObjectId, ref: "User" },
    updatedById: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
)

missionOverrideSchema.index({ slotKey: 1, periodKey: 1 }, { unique: true })

const rewardLedgerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    sourceType: { type: String, required: true },
    sourceId: { type: String, required: true },
    pointsAwarded: { type: Number, default: 0 },
    dedupeKey: { type: String, required: true, unique: true }
  },
  { timestamps: true }
)

export const MissionTemplateModel =
  models.MissionTemplate || model("MissionTemplate", missionTemplateSchema)
export const MissionInstanceModel =
  models.MissionInstance || model("MissionInstance", missionInstanceSchema)
export const UserMissionProgressModel =
  models.UserMissionProgress || model("UserMissionProgress", userMissionProgressSchema)
export const MissionOverrideModel =
  models.MissionOverride || model("MissionOverride", missionOverrideSchema)
export const RewardLedgerModel = models.RewardLedger || model("RewardLedger", rewardLedgerSchema)
