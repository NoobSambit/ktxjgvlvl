import { Schema, model, models } from "mongoose"

const streamEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    provider: { type: String, required: true, index: true },
    providerUserKey: { type: String, required: true },
    providerEventKey: { type: String, required: true },
    playedAt: { type: Date, required: true, index: true },
    artistKey: { type: String, required: true },
    trackKey: { type: String, required: true },
    albumKey: { type: String },
    rawRef: { type: String }
  },
  { timestamps: true }
)

streamEventSchema.index({ provider: 1, providerUserKey: 1, providerEventKey: 1 }, { unique: true })
streamEventSchema.index({ userId: 1, playedAt: -1 })

const streamSyncCheckpointSchema = new Schema(
  {
    trackerConnectionId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "TrackerConnection"
    },
    provider: { type: String, required: true },
    cursor: { type: String },
    lastPlayedAt: { type: Date }
  },
  { timestamps: true }
)

const userStreamDailyStatSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    provider: { type: String, required: true },
    dayKey: { type: String, required: true, index: true },
    totalStreams: { type: Number, default: 0 },
    uniqueTracks: { type: Number, default: 0 },
    topTrackKey: { type: String },
    topArtistKey: { type: String }
  },
  { timestamps: true }
)

userStreamDailyStatSchema.index({ userId: 1, dayKey: -1 }, { unique: true })

const userTrackCounterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    dayKey: { type: String, required: true, index: true },
    trackKey: { type: String, required: true },
    artistKey: { type: String, required: true },
    albumKey: { type: String },
    streamCount: { type: Number, default: 0 }
  },
  { timestamps: true }
)

userTrackCounterSchema.index({ userId: 1, dayKey: 1, trackKey: 1 }, { unique: true })

export const StreamEventModel = models.StreamEvent || model("StreamEvent", streamEventSchema)
export const StreamSyncCheckpointModel =
  models.StreamSyncCheckpoint || model("StreamSyncCheckpoint", streamSyncCheckpointSchema)
export const UserStreamDailyStatModel =
  models.UserStreamDailyStat || model("UserStreamDailyStat", userStreamDailyStatSchema)
export const UserTrackCounterModel =
  models.UserTrackCounter || model("UserTrackCounter", userTrackCounterSchema)
