import mongoose, { Schema } from 'mongoose'

const linkSchema = new Schema(
  {
    title: { type: String },
    name: { type: String },
    fileName: { type: String },
    description: { type: String },
    smSizeUrl: { type: String, required: true },
    mdSizeUrl: { type: String, required: true },
    fullSizeUrl: { type: String, required: true },
    smSizeEntryId: { type: String },
    mdSizeEntryId: { type: String },
    fullSizeEntryId: { type: String },
    priority: { type: Number },
    tags: [{ type: String }],
    createdAt: { type: Date },
    updatedAt: { type: Date },
    private: { type: Boolean },
    meta: {
      mimeType: { type: String },
      size: { type: Number },
      width: { type: Number },
      height: { type: Number },
      gpsLatitude: { type: Number },
      gpsLongitude: { type: Number },
      gpsAltitude: { type: Number },
      make: { type: String },
      model: { type: String },
      takenAt: { type: String },
      takenAtDate: { type: Date },
    }
  },
  {
    timestamps: true,
  }
)

export const Project = mongoose.model('project', linkSchema)
export const Photo = mongoose.model('photo', linkSchema)
