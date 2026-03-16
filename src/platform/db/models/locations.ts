import { Schema, model, models } from "mongoose"

const locationStateSchema = new Schema(
  {
    stateKey: { type: String, required: true, unique: true, index: true },
    stateLabel: { type: String, required: true },
    normalizedLabel: { type: String, required: true, index: true },
    stateCode: { type: String, required: true, unique: true },
    aliases: { type: [String], default: [] },
    centroidLat: { type: Number },
    centroidLng: { type: Number },
    mapFeatureId: { type: String, index: true }
  },
  { timestamps: true }
)

locationStateSchema.index({ normalizedLabel: 1, stateCode: 1 })

const locationPlaceSchema = new Schema(
  {
    placeKey: { type: String, required: true, unique: true, index: true },
    geonameId: { type: Number, required: true, unique: true, index: true },
    placeLabel: { type: String, required: true },
    normalizedName: { type: String, required: true, index: true },
    aliases: { type: [String], default: [] },
    stateKey: { type: String, required: true, index: true },
    stateLabel: { type: String, required: true },
    districtLabel: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    population: { type: Number },
    featureClass: { type: String, required: true },
    featureCode: { type: String, required: true }
  },
  { timestamps: true }
)

locationPlaceSchema.index({ stateKey: 1, normalizedName: 1 })
locationPlaceSchema.index({ stateKey: 1, population: -1 })

export const LocationStateModel =
  models.LocationState || model("LocationState", locationStateSchema)
export const LocationPlaceModel =
  models.LocationPlace || model("LocationPlace", locationPlaceSchema)
