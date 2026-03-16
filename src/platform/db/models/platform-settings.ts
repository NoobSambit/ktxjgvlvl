import { Schema, model, models } from "mongoose"

const platformSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    streamPointValue: { type: Number, default: 1 },
    featureFlags: {
      type: Map,
      of: Boolean,
      default: () => new Map()
    },
    updatedById: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
)

export const PlatformSettingsModel =
  models.PlatformSettings || model("PlatformSettings", platformSettingsSchema)
