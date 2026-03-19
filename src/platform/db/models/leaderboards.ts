import { Schema, model, models } from "mongoose"

const leaderboardBoardSchema = new Schema(
  {
    schemaVersion: { type: Number, default: 2, index: true },
    boardType: { type: String, enum: ["individual", "state"], required: true, index: true },
    scopeType: { type: String },
    scopeKey: { type: String },
    scopeLabel: { type: String },
    period: { type: String, enum: ["daily", "weekly"], required: true },
    periodKey: { type: String, required: true, index: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isDirty: { type: Boolean, default: true },
    materializationStartedAt: { type: Date },
    lastMaterializedAt: { type: Date }
  },
  { timestamps: true }
)

leaderboardBoardSchema.index({ schemaVersion: 1, boardType: 1, periodKey: 1 }, { unique: true })

const leaderboardEntrySchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, required: true, ref: "LeaderboardBoard", index: true },
    competitorType: { type: String, enum: ["user", "state"], required: true },
    competitorKey: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    stateKey: { type: String },
    displayName: { type: String, required: true },
    score: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    previousRank: { type: Number },
    lastQualifiedAt: { type: Date }
  },
  { timestamps: true }
)

leaderboardEntrySchema.index({ boardId: 1, competitorKey: 1 }, { unique: true })
leaderboardEntrySchema.index({ boardId: 1, rank: 1 })

const leaderboardPointEventSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, required: true, ref: "LeaderboardBoard", index: true },
    boardType: { type: String, enum: ["individual", "state"], required: true },
    period: { type: String, enum: ["daily", "weekly"], required: true },
    periodKey: { type: String, required: true, index: true },
    competitorType: { type: String, enum: ["user", "state"], required: true },
    competitorKey: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    stateKey: { type: String },
    displayName: { type: String, required: true },
    points: { type: Number, default: 0 },
    occurredAt: { type: Date, required: true, index: true },
    sourceType: {
      type: String,
      enum: ["verified_stream", "mission_completion", "admin_adjustment"],
      required: true
    },
    sourceId: { type: String, required: true },
    dedupeKey: { type: String, required: true, unique: true }
  },
  { timestamps: true }
)

leaderboardPointEventSchema.index({ boardId: 1, competitorKey: 1, createdAt: -1 })

const leaderboardRankSnapshotSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, required: true, ref: "LeaderboardBoard", index: true },
    topEntries: { type: [Schema.Types.Mixed], default: [] },
    generatedAt: { type: Date, required: true },
    totalParticipants: { type: Number, default: 0 }
  },
  { timestamps: true }
)

export const LeaderboardBoardModel =
  models.LeaderboardBoard || model("LeaderboardBoard", leaderboardBoardSchema)
export const LeaderboardEntryModel =
  models.LeaderboardEntry || model("LeaderboardEntry", leaderboardEntrySchema)
export const LeaderboardPointEventModel =
  models.LeaderboardPointEvent || model("LeaderboardPointEvent", leaderboardPointEventSchema)
export const LeaderboardRankSnapshotModel =
  models.LeaderboardRankSnapshot ||
  model("LeaderboardRankSnapshot", leaderboardRankSnapshotSchema)
