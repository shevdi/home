import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    roles: {
      type: [String],
      default: []
    },
    active: {
      type: Boolean,
      default: true
    }
  }
)

export const User = mongoose.model('user', userSchema)
