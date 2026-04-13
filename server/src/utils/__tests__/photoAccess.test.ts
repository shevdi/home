import { describe, it, expect } from '@jest/globals'
import {
  canViewPhoto,
  photosViewerCacheSegment,
  withPhotoVisibilityFilter,
} from '../photoAccess'
import type { AuthContext } from '@/services/auth'

describe('photoAccess', () => {
  describe('photosViewerCacheSegment', () => {
    it('returns anon without auth', () => {
      expect(photosViewerCacheSegment(undefined)).toBe('anon')
    })
    it('returns admin for admin role', () => {
      expect(photosViewerCacheSegment({ roles: ['admin'], username: 'a' })).toBe('admin')
    })
    it('returns user prefix with userId', () => {
      expect(
        photosViewerCacheSegment({ roles: ['user'], userId: '507f1f77bcf86cd799439011', username: 'u' }),
      ).toBe('user:507f1f77bcf86cd799439011')
    })
  })

  describe('canViewPhoto', () => {
    it('allows public photo for anyone', () => {
      expect(canViewPhoto({ private: false }, undefined)).toBe(true)
    })
    it('denies private without grants for non-admin', () => {
      expect(canViewPhoto({ private: true, accessedBy: [] }, { roles: ['user'], userId: 'x' })).toBe(false)
    })
    it('allows private with grant for matching userId', () => {
      expect(
        canViewPhoto(
          { private: true, accessedBy: [{ userId: '507f1f77bcf86cd799439011' }] },
          { roles: ['user'], userId: '507f1f77bcf86cd799439011' },
        ),
      ).toBe(true)
    })
    it('allows any private for admin', () => {
      expect(canViewPhoto({ private: true }, { roles: ['admin'] })).toBe(true)
    })
  })

  describe('withPhotoVisibilityFilter', () => {
    it('adds $nor for anonymous-style filter', () => {
      const base = { tags: { $all: ['a'] } }
      const out = withPhotoVisibilityFilter(base, undefined)
      expect(out).toMatchObject({
        tags: { $all: ['a'] },
        $nor: expect.arrayContaining([{ private: true }]),
      })
    })

    it('uses different filter keys for admin vs grantee (cache + query contract)', () => {
      const base = {}
      const adminOut = withPhotoVisibilityFilter(base, { roles: ['admin'], username: 'a' } as AuthContext)
      const granteeOut = withPhotoVisibilityFilter(base, {
        roles: ['user'],
        userId: '507f1f77bcf86cd799439011',
        username: 'g',
      } as AuthContext)
      expect(JSON.stringify(adminOut)).not.toBe(JSON.stringify(granteeOut))
      expect(granteeOut).toHaveProperty('$and')
    })
  })
})
