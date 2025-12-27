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
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  {
    timestamps: true
  }
)

export const Project = mongoose.model('project', linkSchema)
export const Photo = mongoose.model('photo', linkSchema)
