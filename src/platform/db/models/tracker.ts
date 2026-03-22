import { Schema, model, models } from "mongoose"

const trackerConnectionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    provider: { type: String, required: true, index: true },
    username: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending"
    },
    usernameChangeCount: { type: Number, default: 0 },
    nextUsernameChangeAllowedAt: { type: Date },
    lastSyncAt: { type: Date },
    lastSuccessfulSyncAt: { type: Date },
    lastCheckpoint: { type: String }
  },
  { timestamps: true }
)

trackerConnectionSchema.index({ provider: 1, username: 1 })
trackerConnectionSchema.index({ userId: 1 }, { unique: true })
trackerConnectionSchema.index({ userId: 1, provider: 1 }, { unique: true })
trackerConnectionSchema.index({ verificationStatus: 1, updatedAt: -1 })

const regionConfirmationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    ipAddressHash: { type: String },
    suggestedState: { type: String },
    suggestedCity: { type: String },
    confirmedState: { type: String },
    confirmedCity: { type: String },
    confirmationMethod: {
      type: String,
      enum: ["user_confirmation", "admin_override"],
      default: "user_confirmation"
    }
  },
  { timestamps: true }
)

export const TrackerConnectionModel =
  models.TrackerConnection || model("TrackerConnection", trackerConnectionSchema)
export const RegionConfirmationModel =
  models.RegionConfirmation || model("RegionConfirmation", regionConfirmationSchema)
