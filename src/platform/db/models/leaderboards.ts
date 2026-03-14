import { Schema, model, models } from "mongoose"

const leaderboardBoardSchema = new Schema(
  {
    scopeType: { type: String, enum: ["national", "state", "city"], required: true },
    scopeKey: { type: String, required: true },
    scopeLabel: { type: String, required: true },
    period: { type: String, enum: ["daily", "weekly"], required: true },
    periodKey: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isDirty: { type: Boolean, default: true }
  },
  { timestamps: true }
)

leaderboardBoardSchema.index({ scopeType: 1, scopeKey: 1, periodKey: 1 }, { unique: true })

const leaderboardScoreSchema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, required: true, ref: "LeaderboardBoard", index: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    score: { type: Number, default: 0 },
    displayName: { type: String, default: "" },
    username: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    streakDays: { type: Number, default: 0 },
    lastQualifiedAt: { type: Date },
    rank: { type: Number },
    previousRank: { type: Number }
  },
  { timestamps: true }
)

leaderboardScoreSchema.index({ boardId: 1, userId: 1 }, { unique: true })
leaderboardScoreSchema.index({ boardId: 1, score: -1, lastQualifiedAt: 1, userId: 1 })

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
export const LeaderboardScoreModel =
  models.LeaderboardScore || model("LeaderboardScore", leaderboardScoreSchema)
export const LeaderboardRankSnapshotModel =
  models.LeaderboardRankSnapshot ||
  model("LeaderboardRankSnapshot", leaderboardRankSnapshotSchema)
