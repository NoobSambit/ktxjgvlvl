import { Schema, model, models } from "mongoose"

const authAccountSchema = new Schema(
  {
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    passwordHash: { type: String },
    emailVerifiedAt: { type: Date }
  },
  { _id: false }
)

const userSchema = new Schema(
  {
    sessionKey: { type: String, sparse: true, unique: true, index: true },
    displayName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, sparse: true, unique: true },
    status: {
      type: String,
      enum: ["active", "restricted", "pending"],
      default: "active"
    },
    roles: {
      type: [String],
      default: ["user"]
    },
    region: {
      country: { type: String, default: "India" },
      stateKey: { type: String, index: true },
      state: { type: String },
      cityKey: { type: String, index: true },
      city: { type: String },
      cityConfirmedAt: { type: Date },
      citySource: {
        type: String,
        enum: ["user_selected", "admin_override"]
      },
      fallbackCityKey: { type: String, index: true },
      fallbackCityLabel: { type: String },
      fallbackStateKey: { type: String, index: true },
      fallbackConfidence: {
        type: String,
        enum: ["low", "medium", "high"]
      },
      fallbackDetectedAt: { type: Date },
      locationNeedsReview: { type: Boolean, default: false },
      confirmedAt: { type: Date },
      source: {
        type: String,
        enum: ["user_confirmed", "ip_suggested", "admin_override"],
        default: "ip_suggested"
      }
    },
    authAccounts: {
      type: [authAccountSchema],
      default: []
    },
    moderationFlags: {
      type: [String],
      default: []
    },
    streamStats: {
      totalVerifiedBtsStreams: { type: Number, default: 0 },
      lastVerifiedStreamAt: { type: Date }
    }
  },
  { timestamps: true }
)

export const UserModel = models.User || model("User", userSchema)
