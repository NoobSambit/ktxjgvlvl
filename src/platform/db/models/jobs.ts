import { Schema, model, models } from "mongoose"

const jobRunSchema = new Schema(
  {
    jobKey: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued"
    },
    cursor: { type: String },
    scheduledFor: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    errorMessage: { type: String }
  },
  { timestamps: true }
)

export const JobRunModel = models.JobRun || model("JobRun", jobRunSchema)
