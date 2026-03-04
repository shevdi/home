/**
 * Integration tests for photos service — require a running MongoDB.
 * Use DATABASE_URL for connection (default: mongodb://localhost:27017/home_test).
 *
 * Run: npm run test:integration
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals'
import type { ILink } from '@/types'

jest.setTimeout(15_000)
import mongoose from 'mongoose'
import { Photo } from '../../models/link.js'
import * as photosService from '../photos.js'
import mockPhotos from './db-photo-mocks.json'

const TEST_DB_URL = 'mongodb://localhost:27017/home_test'


const sortTypes: Record<string, Record<string, 1 | -1>> = {
  orderDownByTakenAt: { 'meta.takenAt': -1, _id: -1 },
  orderUpByTakenAt: { 'meta.takenAt': 1, _id: -1 },
  orderDownByEdited: { updatedAt: -1, _id: -1 }
}

describe('photos service (integration)', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URL)
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  beforeEach(async () => {
    await Photo.deleteMany({})
    await Photo.insertMany(mockPhotos as Record<string, unknown>[])
  })

  describe('addNewPhoto', () => {
    it('creates a photo and returns it with _id', async () => {
      const initialCount = await Photo.countDocuments({})

      const created = await photosService.addNewPhoto({
        title: 'Test Photo',
        smSizeUrl: 'https://example.com/sm.jpg',
        mdSizeUrl: 'https://example.com/md.jpg',
        fullSizeUrl: 'https://example.com/full.jpg'
      } as ILink)

      const finalCount = await Photo.countDocuments({})

      expect(created).toBeDefined()
      expect(created._id).toBeDefined()
      expect(finalCount).toBe(initialCount + 1)
    })
  })

  describe('getPhotoById', () => {
    it('returns photo when found, null when not', async () => {
      const existing = await Photo.findOne({}).lean()
      expect(existing).toBeTruthy()
      const id = String(existing!._id)

      const found = await photosService.getPhotoById(id)
      expect(found).not.toBeNull()
      expect(found?.name ?? found?.title).toBe(
        (existing as { name?: string; title?: string }).name ?? (existing as { name?: string; title?: string }).title
      )

      const missing = await photosService.getPhotoById(
        new mongoose.Types.ObjectId().toString()
      )
      expect(missing).toBeNull()
    })
  })

  describe('getAllPhotos', () => {
    it('returns all photos matching filters', async () => {
      const all = await photosService.getAllPhotos({})
      const allDirect = await Photo.find({}).lean()
      expect(all).toHaveLength(allDirect.length)

      const publicOnly = await photosService.getAllPhotos({ private: false })
      const publicDirect = await Photo.find({ private: false }).lean()
      expect(publicOnly).toHaveLength(publicDirect.length)
    })
  })

  describe('filterByDate', () => {
    it('filters by dateFrom (meta.takenAt >= dateFrom)', async () => {
      const expectedOrder: Array<string | undefined> = [
        '2023-01-17T07:57:59.000Z',
        '2023-01-01T13:54:44.000Z',
        '2023-01-17T07:26:41.000Z',
      ]
      const dateFrom = '2020-01-01'
      const filters = { 'meta.takenAt': { $gte: dateFrom } }
      const photos = await photosService.getPhotosPaginated(1, 100, filters)
      const count = await photosService.getPhotosCount(filters)

      const takenAts = photos.map(p => p.meta?.takenAt).filter(Boolean)
      expect(takenAts).toHaveLength(3)
      expect(expectedOrder).toEqual(takenAts)
      expect(count).toBe(3)
    })

    it('filters by dateTo (meta.takenAt <= dateTo)', async () => {
      const expectedOrder: Array<string | undefined> = [
        '2019-05-02T13:45:43.000Z',
        '2019-04-17T10:32:32.000Z',
      ]
      const dateTo = '2020-01-01T00:00:00.000Z'
      const filters = { 'meta.takenAt': { $lte: dateTo } }
      const photos = await photosService.getPhotosPaginated(1, 100, filters)
      const count = await photosService.getPhotosCount(filters)

      const takenAts = photos.map(p => p.meta?.takenAt).filter(Boolean)
      expect(takenAts).toHaveLength(2)
      expect(expectedOrder).toEqual(takenAts)
      expect(count).toBe(2)
    })

    it('filters by dateFrom and dateTo (meta.takenAt in range)', async () => {
      const expectedOrder: Array<string> = [
        '2019-05-02T13:45:43.000Z',
        '2023-01-01T13:54:44.000Z',
      ]
      const dateFrom = '2019-04-22T00:00:00.000Z'
      const dateTo = '2023-01-03T00:00:00.000Z'
      const filters = { 'meta.takenAt': { $gte: dateFrom, $lte: dateTo } }
      const photos = await photosService.getPhotosPaginated(1, 100, filters)
      const count = await photosService.getPhotosCount(filters)

      expect(photos).toHaveLength(2)
      expect(count).toBe(2)
      const takenAts = photos.map(p => p.meta?.takenAt)
      expect(expectedOrder).toEqual(takenAts)
    })

    it('filters by dateTo and excludes private (meta.takenAt <= dateTo, $nor private)', async () => {
      const expectedOrder: Array<string> = [
        '2019-04-17T10:32:32.000Z',
        '2023-01-17T07:57:59.000Z',
        '2023-01-17T07:26:41.000Z',
      ]
      const filters = {
        'meta.takenAt': { $lte: '2026-02-11' },
        $nor: [{ private: true }],
      }
      const photos = await photosService.getPhotosPaginated(1, 100, filters)
      const count = await photosService.getPhotosCount(filters)

      expect(photos).toHaveLength(3)
      expect(count).toBe(3)
      const takenAts = photos.map(p => p.meta?.takenAt)
      expect(expectedOrder).toEqual(takenAts)
    })
  })

  describe('getPhotosPaginated', () => {
    it('returns correct page and applies sort, skip, limit', async () => {
      const total = await Photo.countDocuments({})
      const limit = 2

      const page1 = await photosService.getPhotosPaginated(1, limit, {}, { createdAt: -1 })
      const page2 = await photosService.getPhotosPaginated(2, limit, {}, { createdAt: -1 })

      expect(page1.length).toBeLessThanOrEqual(limit)
      expect(page2.length).toBeLessThanOrEqual(limit)
      expect(page1.length + page2.length).toBeLessThanOrEqual(total)
    })

    it('orderDownByTakenAt returns newest taken first', async () => {
      const expectedOrder: Array<string | undefined> = [
        '2023-01-17T07:57:59.000Z',
        '2023-01-17T07:26:41.000Z',
        '2023-01-01T13:54:44.000Z',
        '2019-05-02T13:45:43.000Z',
        '2019-04-17T10:32:32.000Z',
        undefined,
        undefined,
      ]
      const sort = sortTypes.orderDownByTakenAt
      const photos = await photosService.getPhotosPaginated(1, 100, {}, sort)
      expect(photos.map(item => item.meta?.takenAt)).toEqual(expectedOrder)
    })

    it('orderUpByTakenAt returns oldest taken first', async () => {
      const expectedOrder: Array<string | undefined> = [
        undefined,
        undefined,
        '2019-04-17T10:32:32.000Z',
        '2019-05-02T13:45:43.000Z',
        '2023-01-01T13:54:44.000Z',
        '2023-01-17T07:26:41.000Z',
        '2023-01-17T07:57:59.000Z'
      ]
      const sort = sortTypes.orderUpByTakenAt
      const photos = await photosService.getPhotosPaginated(1, 100, {}, sort)
      expect(photos.map(item => item.meta?.takenAt)).toEqual(expectedOrder)
    })

    it('orderDownByEdited applies updatedAt desc sort', async () => {
      const expectedOrder: Array<Date | undefined> = [
        new Date('2026-02-09T09:15:34.534Z'),
        new Date('2026-02-03T18:11:14.534Z'),
        new Date('2026-02-01T20:06:34.534Z'),
        new Date('2026-02-01T13:15:34.534Z'),
        new Date('2026-01-30T18:14:54.534Z'),
        new Date('2026-01-28T14:57:34.534Z'),
        new Date('2026-01-01T18:43:34.534Z'),
      ]
      const sort = sortTypes.orderDownByEdited
      const fromDb = await Photo.find({}).sort(sort).limit(100).lean()
      expect(fromDb.map(item => item.updatedAt)).toEqual(expectedOrder)
    })
  })

  describe('getPhotosCount', () => {
    it('returns total count for query', async () => {
      const totalDirect = await Photo.countDocuments({})
      const publicDirect = await Photo.countDocuments({ private: false })
      const privateDirect = await Photo.countDocuments({ private: true })

      expect(await photosService.getPhotosCount({})).toBe(totalDirect)
      expect(await photosService.getPhotosCount({ private: false })).toBe(publicDirect)
      expect(await photosService.getPhotosCount({ private: true })).toBe(privateDirect)
    })
  })

  describe('updatePhotoById', () => {
    it('updates and returns the photo', async () => {
      const existing = await Photo.findOne({}).lean()
      expect(existing).toBeTruthy()
      const id = String(existing!._id)

      const updated = await photosService.updatePhotoById(id, {
        title: 'Updated title',
        description: 'New description'
      } as Partial<ILink>)

      expect(updated?.title).toBe('Updated title')
      expect(updated?.description).toBe('New description')

      const found = await photosService.getPhotoById(id)
      expect(found?.title).toBe('Updated title')
    })
  })

  describe('deletePhotoById', () => {
    it('deletes the photo and returns it', async () => {
      const existing = await Photo.findOne({}).lean()
      expect(existing).toBeTruthy()
      const id = String(existing!._id)

      const deleted = await photosService.deletePhotoById(id)
      expect(deleted).not.toBeNull()
      expect(String(deleted?._id)).toBe(id)

      const found = await photosService.getPhotoById(id)
      expect(found).toBeNull()
    })
  })
})
