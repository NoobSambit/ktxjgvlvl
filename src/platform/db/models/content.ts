import { Schema, model, models } from "mongoose"

const publishingFields = {
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft"
  },
  summary: { type: String },
  publishedAt: { type: Date }
}

const artistSchema = new Schema(
  {
    ...publishingFields,
    memberKey: { type: String, required: true, unique: true },
    body: { type: String }
  },
  { timestamps: true }
)

const releaseSchema = new Schema(
  {
    ...publishingFields,
    releaseKey: { type: String, required: true, unique: true },
    artistKey: { type: String, required: true },
    trackCount: { type: Number, default: 0 },
    releaseDate: { type: Date }
  },
  { timestamps: true }
)

const trackSchema = new Schema(
  {
    trackKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    artistKey: { type: String, required: true },
    releaseKey: { type: String, required: true }
  },
  { timestamps: true }
)

const wikiPageSchema = new Schema(
  {
    ...publishingFields,
    section: { type: String, required: true },
    body: { type: String }
  },
  { timestamps: true }
)

const eventSchema = new Schema(
  {
    ...publishingFields,
    eventType: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    location: { type: String }
  },
  { timestamps: true }
)

const votingGuideSchema = new Schema(
  {
    ...publishingFields,
    awardName: { type: String, required: true },
    body: { type: String }
  },
  { timestamps: true }
)

const fanProjectSchema = new Schema(
  {
    ...publishingFields,
    organizer: { type: String, required: true },
    state: { type: String },
    city: { type: String },
    body: { type: String }
  },
  { timestamps: true }
)

const chartSourceSchema = new Schema(
  {
    sourceKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    sourceType: { type: String, enum: ["scraper", "manual"], required: true },
    region: { type: String, default: "global" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

const chartSnapshotSchema = new Schema(
  {
    chartSourceId: { type: Schema.Types.ObjectId, required: true, ref: "ChartSource" },
    snapshotDate: { type: String, required: true, index: true },
    capturedAt: { type: Date, required: true }
  },
  { timestamps: true }
)

chartSnapshotSchema.index({ chartSourceId: 1, snapshotDate: 1 }, { unique: true })

const chartEntrySchema = new Schema(
  {
    chartSnapshotId: { type: Schema.Types.ObjectId, required: true, ref: "ChartSnapshot", index: true },
    artistKey: { type: String, required: true },
    trackKey: { type: String },
    releaseKey: { type: String },
    rank: { type: Number, required: true },
    metricValue: { type: Number }
  },
  { timestamps: true }
)

const contentRevisionSchema = new Schema(
  {
    contentType: { type: String, required: true },
    contentId: { type: String, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
)

const adminAuditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
)

export const ArtistModel = models.Artist || model("Artist", artistSchema)
export const ReleaseModel = models.Release || model("Release", releaseSchema)
export const TrackModel = models.Track || model("Track", trackSchema)
export const WikiPageModel = models.WikiPage || model("WikiPage", wikiPageSchema)
export const EventModel = models.Event || model("Event", eventSchema)
export const VotingGuideModel =
  models.VotingGuide || model("VotingGuide", votingGuideSchema)
export const FanProjectModel = models.FanProject || model("FanProject", fanProjectSchema)
export const ChartSourceModel =
  models.ChartSource || model("ChartSource", chartSourceSchema)
export const ChartSnapshotModel =
  models.ChartSnapshot || model("ChartSnapshot", chartSnapshotSchema)
export const ChartEntryModel = models.ChartEntry || model("ChartEntry", chartEntrySchema)
export const ContentRevisionModel =
  models.ContentRevision || model("ContentRevision", contentRevisionSchema)
export const AdminAuditLogModel =
  models.AdminAuditLog || model("AdminAuditLog", adminAuditLogSchema)
