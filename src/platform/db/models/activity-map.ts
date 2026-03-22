import { Schema, model, models } from "mongoose"

const locationActivityEventSchema = new Schema(
  {
    period: { type: String, enum: ["daily", "weekly"], required: true, index: true },
    periodKey: { type: String, required: true, index: true },
    scopeType: { type: String, enum: ["state", "place"], required: true, index: true },
    scopeKey: { type: String, required: true, index: true },
    stateKey: { type: String, required: true, index: true },
    placeKey: { type: String, index: true },
    displayLabel: { type: String, required: true },
    points: { type: Number, required: true },
    sourceType: { type: String, enum: ["verified_stream", "mission_completion"], required: true },
    sourceId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    occurredAt: { type: Date, required: true, index: true },
    dedupeKey: { type: String, required: true, unique: true, index: true }
  },
  {
    timestamps: true,
    autoCreate: false,
    autoIndex: false
  }
)

locationActivityEventSchema.index({ periodKey: 1, scopeType: 1, scopeKey: 1, occurredAt: -1 })

const locationActivitySnapshotSchema = new Schema(
  {
    period: { type: String, enum: ["daily", "weekly"], required: true, index: true },
    periodKey: { type: String, required: true, index: true },
    scopeType: { type: String, enum: ["state", "place"], required: true, index: true },
    scopeKey: { type: String, required: true, index: true },
    stateKey: { type: String, required: true, index: true },
    placeKey: { type: String, index: true },
    displayLabel: { type: String, required: true },
    activityScore: { type: Number, default: 0 },
    verifiedStreamCount: { type: Number, default: 0 },
    missionCompletionPoints: { type: Number, default: 0 },
    missionCompletionCount: { type: Number, default: 0 },
    activeUserCount: { type: Number, default: 0 },
    lastOccurredAt: { type: Date },
    isDirty: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
)

locationActivitySnapshotSchema.index(
  { periodKey: 1, scopeType: 1, scopeKey: 1 },
  { unique: true }
)

const locationActivityParticipantSchema = new Schema(
  {
    period: { type: String, enum: ["daily", "weekly"], required: true, index: true },
    periodKey: { type: String, required: true, index: true },
    scopeType: { type: String, enum: ["state", "place"], required: true, index: true },
    scopeKey: { type: String, required: true, index: true },
    stateKey: { type: String, required: true, index: true },
    placeKey: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true }
  },
  { timestamps: true }
)

locationActivityParticipantSchema.index(
  { periodKey: 1, scopeType: 1, scopeKey: 1, userId: 1 },
  { unique: true }
)

export const LocationActivityEventModel =
  models.LocationActivityEvent || model("LocationActivityEvent", locationActivityEventSchema)
export const LocationActivitySnapshotModel =
  models.LocationActivitySnapshot || model("LocationActivitySnapshot", locationActivitySnapshotSchema)
export const LocationActivityParticipantModel =
  models.LocationActivityParticipant ||
  model("LocationActivityParticipant", locationActivityParticipantSchema)
