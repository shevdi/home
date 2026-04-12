import mongoose from 'mongoose'
import { User } from '../db/models/user'

export async function validatePhotoAccessedBy(entries: { userId: string }[]): Promise<void> {
  if (!entries.length) return
  for (const e of entries) {
    if (!mongoose.Types.ObjectId.isValid(e.userId)) {
      throw Object.assign(new Error('Invalid userId in accessedBy'), { status: 400 })
    }
  }
  const ids = entries.map((e) => new mongoose.Types.ObjectId(e.userId))
  const count = await User.countDocuments({ _id: { $in: ids } })
  if (count !== entries.length) {
    throw Object.assign(new Error('Unknown user in accessedBy'), { status: 400 })
  }
}
