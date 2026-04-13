import mongoose from 'mongoose'
import type { AuthContext } from '@/services/auth'
import type { MongoFilter } from './queryBuilder.js'

export function photosViewerCacheSegment(auth?: AuthContext | null): string {
  if (!auth) return 'anon'
  if (auth.roles?.includes('admin')) return 'admin'
  if (auth.userId) return `user:${auth.userId}`
  return 'authed'
}

export function canViewPhoto(
  photo: {
    private?: boolean | null
    accessedBy?: { userId?: { toString(): string } }[] | null
  },
  auth?: AuthContext,
): boolean {
  if (!photo.private) return true
  if (auth?.roles?.includes('admin')) return true
  const raw = photo.accessedBy
  const grants = (Array.isArray(raw) ? raw : []).filter((g) => g?.userId != null)
  if (grants.length === 0) return false
  const uid = auth?.userId
  if (!uid) return false
  return grants.some((g) => String(g.userId) === uid)
}

/** Merges base gallery filters with Plan B visibility for non-admins. */
export function withPhotoVisibilityFilter(
  baseFilter: MongoFilter,
  auth?: AuthContext,
): MongoFilter {
  if (auth?.roles?.includes('admin')) {
    return baseFilter
  }

  if (auth?.userId && mongoose.Types.ObjectId.isValid(auth.userId)) {
    const viewerOid = new mongoose.Types.ObjectId(auth.userId)
    const visibility: MongoFilter = {
      $or: [
        { private: { $ne: true } },
        { private: true, accessedBy: { $elemMatch: { userId: viewerOid } } },
      ],
    }
    const parts: MongoFilter[] = []
    if (Object.keys(baseFilter).length > 0) {
      parts.push(baseFilter)
    }
    parts.push(visibility)
    return { $and: parts }
  }

  const nextNor = [...(baseFilter.$nor ?? []), { private: true }]
  return { ...baseFilter, $nor: nextNor }
}
