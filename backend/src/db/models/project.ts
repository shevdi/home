import mongoose, { Schema } from 'mongoose'

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    url: { type: String },
  }
)

export const Project = mongoose.model('project', projectSchema)
