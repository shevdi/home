import mongoose from 'mongoose'
import { User } from '../db/models/user'

export type HydratedAccessGrant = { userId: string; userName?: string }

/**
 * Adds optional `userName` from `User.name` for API responses. DB documents stay `{ userId }` only.
 */
export async function hydrateAccessedByGrants(
  grants: { userId?: { toString(): string } | string }[] | null | undefined,
): Promise<HydratedAccessGrant[] | undefined> {
  if (!Array.isArray(grants) || grants.length === 0) return undefined

  const ids = [...new Set(grants.map((g) => String(g.userId)))].filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  )
  if (ids.length === 0) {
    return grants.map((g) => ({ userId: String(g.userId) }))
  }

  const oids = ids.map((id) => new mongoose.Types.ObjectId(id))
  const users = await User.find({ _id: { $in: oids } })
    .select({ name: 1 })
    .lean<Array<{ _id: mongoose.Types.ObjectId; name: string }>>()

  const nameById = new Map(users.map((u) => [String(u._id), u.name]))

  return grants.map((g) => {
    const userId = String(g.userId)
    const userName = nameById.get(userId)
    return userName !== undefined ? { userId, userName } : { userId }
  })
}

/** One `User.find` for all grants on a page of photos. */
export async function userNamesForAccessGrants(
  photos: readonly { accessedBy?: unknown }[],
): Promise<Map<string, string>> {
  const set = new Set<string>()
  for (const p of photos) {
    const raw = p?.accessedBy
    if (!Array.isArray(raw)) continue
    for (const g of raw) {
      if (!g || typeof g !== 'object' || !('userId' in g)) continue
      const id = String((g as { userId: { toString(): string } | string }).userId)
      if (mongoose.Types.ObjectId.isValid(id)) set.add(id)
    }
  }
  if (set.size === 0) return new Map()

  const oids = [...set].map((id) => new mongoose.Types.ObjectId(id))
  const users = await User.find({ _id: { $in: oids } })
    .select({ name: 1 })
    .lean<Array<{ _id: mongoose.Types.ObjectId; name: string }>>()

  return new Map(users.map((u) => [String(u._id), u.name]))
}
