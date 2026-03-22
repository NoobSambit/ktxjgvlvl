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
    normalizedTrackKey: { type: String, index: true },
    normalizedArtistKey: { type: String, index: true },
    catalogTrackId: { type: Schema.Types.ObjectId, ref: "CatalogTrack", index: true },
    catalogAlbumId: { type: Schema.Types.ObjectId, ref: "CatalogAlbum", index: true },
    catalogTrackSpotifyId: { type: String, index: true },
    catalogAlbumSpotifyId: { type: String, index: true },
    isBTSFamily: { type: Boolean, default: false, index: true },
    stateKey: { type: String, index: true },
    stateLabel: { type: String },
    placeKey: { type: String, index: true },
    placeLabel: { type: String },
    rawRef: { type: String }
  },
  { timestamps: true }
)

streamEventSchema.index({ provider: 1, providerUserKey: 1, providerEventKey: 1 }, { unique: true })
streamEventSchema.index({ userId: 1, playedAt: -1 })
streamEventSchema.index({ userId: 1, isBTSFamily: 1, playedAt: 1 })
streamEventSchema.index({ stateKey: 1, isBTSFamily: 1, playedAt: 1 })
streamEventSchema.index({ isBTSFamily: 1, playedAt: -1, stateKey: 1 })
streamEventSchema.index({ isBTSFamily: 1, playedAt: -1, placeKey: 1 })

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
  {
    timestamps: true,
    autoCreate: false,
    autoIndex: false
  }
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
  {
    timestamps: true,
    autoCreate: false,
    autoIndex: false
  }
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
  {
    timestamps: true,
    autoCreate: false,
    autoIndex: false
  }
)

userTrackCounterSchema.index({ userId: 1, dayKey: 1, trackKey: 1 }, { unique: true })

export const StreamEventModel = models.StreamEvent || model("StreamEvent", streamEventSchema)
export const StreamSyncCheckpointModel =
  models.StreamSyncCheckpoint || model("StreamSyncCheckpoint", streamSyncCheckpointSchema)
export const UserStreamDailyStatModel =
  models.UserStreamDailyStat || model("UserStreamDailyStat", userStreamDailyStatSchema)
export const UserTrackCounterModel =
  models.UserTrackCounter || model("UserTrackCounter", userTrackCounterSchema)
