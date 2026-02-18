import mongoose, { Schema } from 'mongoose'

const logSchema = new Schema(
  {
    level: { type: String, required: true, enum: ['error', 'warn', 'info'] },
    message: { type: String, required: true },
    error: { type: String },
    stack: { type: String },
    context: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
)

export const Log = mongoose.model('log', logSchema)
