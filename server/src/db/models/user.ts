import mongoose, { Schema } from 'mongoose'

/**
 * Telegram-only users omit `email` and `password`.
 * Email is optional so federated users are not forced into a synthetic mailbox.
 */
const userSchema = new Schema(
  {
    email: { type: String, required: false },
    name: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: false },
    telegram: {
      type: new Schema(
        {
          userId: { type: Number, required: true },
          username: { type: String, required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    roles: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: false }
)

userSchema.index({ 'telegram.userId': 1 }, { unique: true, sparse: true })

export const User = mongoose.model('user', userSchema)
