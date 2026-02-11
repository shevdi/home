import { describe, it, expect, beforeEach, afterEach, jest, beforeAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import { AxiosError } from 'axios'

const mockGetPhotosPaginated = jest.fn<(...args: unknown[]) => Promise<unknown[]>>()
const mockGetPhotosCount = jest.fn<(...args: unknown[]) => Promise<number>>()
const mockGetPhotoById = jest.fn<(...args: unknown[]) => Promise<unknown | null>>()
const mockUpdatePhotoById = jest.fn<(...args: unknown[]) => Promise<unknown | null>>()
const mockDeletePhotoById = jest.fn<(...args: unknown[]) => Promise<unknown>>()
const mockAddNewPhoto = jest.fn<(...args: unknown[]) => Promise<unknown>>()

const mockGetEntries = jest.fn<(...args: unknown[]) => Promise<{ url: string }>>()
const mockCropPhotoAndUpload = jest.fn<(...args: unknown[]) => Promise<{ url: string; photoData: { id: number; name: string } }>>()

jest.unstable_mockModule('../../db/services/photos.js', () => ({
  getPhotosPaginated: (...args: unknown[]) => mockGetPhotosPaginated(...args),
  getPhotosCount: (...args: unknown[]) => mockGetPhotosCount(...args),
  getPhotoById: (...args: unknown[]) => mockGetPhotoById(...args),
  updatePhotoById: (...args: unknown[]) => mockUpdatePhotoById(...args),
  deletePhotoById: (...args: unknown[]) => mockDeletePhotoById(...args),
  addNewPhoto: (...args: unknown[]) => mockAddNewPhoto(...args),
}))

jest.unstable_mockModule('../../services/drime.js', () => ({
  default: {
    getEntries: (...args: unknown[]) => mockGetEntries(...args),
    cropPhotoAndUpload: (...args: unknown[]) => mockCropPhotoAndUpload(...args),
  },
}))

jest.unstable_mockModule('sharp', () => ({
  default: () => ({
    metadata: async () => ({ width: 800, height: 600 }),
  }),
}))

const passThrough = (_req: unknown, _res: unknown, next: () => void) => next()
jest.unstable_mockModule('../../middlewares/optionalAuth.js', () => ({
  optionalAuth: (req: { headers?: { authorization?: string }; roles?: string[] }, _res: unknown, next: () => void) => {
    if (req.headers?.authorization) {
      req.roles = ['admin']
    }
    next()
  },
}))
jest.unstable_mockModule('../../middlewares/verifyJWT.js', () => ({
  verifyJWT: passThrough,
}))

let photosRouter: { default: express.Router }

beforeAll(async () => {
  photosRouter = await import('../photos.js')
})

const mockPhotoUrls = {
  sm: 'https://example.com/sm.jpg',
  md: 'https://example.com/md.jpg',
  full: 'https://example.com/full.jpg',
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'error').mockImplementation(() => { })
  mockGetEntries.mockResolvedValue({ url: 'https://example.com/photo.jpg' })
  mockCropPhotoAndUpload.mockImplementation((...args: unknown[]) => {
    const size = args[1] as number | undefined
    return Promise.resolve({
      url: size === undefined ? mockPhotoUrls.full : size === 300 ? mockPhotoUrls.sm : mockPhotoUrls.md,
      photoData: { id: 1, name: 'photo.jpg' },
    })
  })
  mockAddNewPhoto.mockImplementation((...args: unknown[]) =>
    Promise.resolve({ _id: 'id1', ...(args[0] as Record<string, unknown>) })
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})

const createApp = () => {
  const app = express()
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use('/photos', photosRouter.default)
  return app
}

const createAxiosError = (status?: number) => {
  const error = new AxiosError('request failed')
  if (status) {
    error.response = { status, statusText: 'error', headers: {}, config: {} } as never
  }
  return error
}

describe('photos routes', () => {
  describe('GET /', () => {
    it('returns photos with pagination for non-admin', async () => {
      const photos = [
        {
          _id: 'id1',
          smSizeEntryId: 'e1',
          mdSizeEntryId: 'e2',
          fullSizeEntryId: 'e3',
          name: 'photo1',
          fileName: 'p1.jpg',
          title: '',
          priority: 0,
          private: false,
          tags: [],
          updatedAt: new Date(),
          createdAt: new Date(),
          meta: {},
        },
      ]
      mockGetPhotosPaginated.mockResolvedValue(photos)
      mockGetPhotosCount.mockResolvedValue(1)

      const res = await request(createApp())
        .get('/photos')
        .expect(200)

      expect(res.body).toMatchObject({
        photos: expect.any(Array),
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
          pageSize: 100,
        },
      })
      expect(mockGetPhotosPaginated).toHaveBeenCalledWith(
        1,
        100,
        expect.objectContaining({ $nor: [{ private: true }] }),
        undefined
      )
    })

    it('excludes private photos for non-admin', async () => {
      mockGetPhotosPaginated.mockResolvedValue([])
      mockGetPhotosCount.mockResolvedValue(0)

      await request(createApp()).get('/photos').expect(200)

      const searchArg = mockGetPhotosPaginated.mock.calls[0][2] as Record<string, unknown>
      expect(searchArg.$nor).toContainEqual({ private: true })
    })

    it('includes private photos for admin', async () => {
      mockGetPhotosPaginated.mockResolvedValue([])
      mockGetPhotosCount.mockResolvedValue(0)

      await request(createApp())
        .get('/photos')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)

      const searchArg = mockGetPhotosPaginated.mock.calls[0][2] as Record<string, unknown>
      expect(searchArg.$nor).toBeUndefined()
    })

    it('applies date range filter when dateFrom and dateTo provided', async () => {
      mockGetPhotosPaginated.mockResolvedValue([])
      mockGetPhotosCount.mockResolvedValue(0)

      await request(createApp())
        .get('/photos')
        .query({ dateFrom: '2024-01-01', dateTo: '2024-12-31' })
        .expect(200)

      const searchArg = mockGetPhotosPaginated.mock.calls[0][2] as Record<string, unknown>
      expect(searchArg['meta.takenAt']).toEqual({
        $gte: '2024-01-01',
        $lte: '2024-12-31',
      })
    })

    it('applies sort when order param provided', async () => {
      mockGetPhotosPaginated.mockResolvedValue([])
      mockGetPhotosCount.mockResolvedValue(0)

      await request(createApp())
        .get('/photos')
        .query({ order: 'orderDownByTakenAt' })
        .expect(200)

      expect(mockGetPhotosPaginated).toHaveBeenCalledWith(
        1,
        100,
        expect.anything(),
        { 'meta.takenAt': -1, _id: -1 }
      )
    })

    it('filters out photos without fullSizeUrl', async () => {
      mockGetEntries
        .mockResolvedValueOnce({ url: 'https://sm.jpg' })
        .mockResolvedValueOnce({ url: 'https://md.jpg' })
        .mockResolvedValueOnce({ url: '' })

      const photos = [
        {
          _id: 'id1',
          smSizeEntryId: 'e1',
          mdSizeEntryId: 'e2',
          fullSizeEntryId: 'e3',
          name: 'photo1',
          fileName: 'p1.jpg',
          title: '',
          priority: 0,
          private: false,
          tags: [],
          updatedAt: new Date(),
          createdAt: new Date(),
          meta: {},
        },
      ]
      mockGetPhotosPaginated.mockResolvedValue(photos)
      mockGetPhotosCount.mockResolvedValue(1)

      const res = await request(createApp()).get('/photos').expect(200)

      expect(res.body.photos).toHaveLength(0)
    })

    it('returns 429 when drime returns rate limit', async () => {
      const photos = [
        {
          _id: 'id1',
          smSizeEntryId: 'e1',
          mdSizeEntryId: 'e2',
          fullSizeEntryId: 'e3',
          name: 'photo1',
          fileName: 'p1.jpg',
          title: '',
          priority: 0,
          private: false,
          tags: [],
          updatedAt: new Date(),
          createdAt: new Date(),
          meta: {},
        },
      ]
      mockGetPhotosPaginated.mockResolvedValue(photos)
      mockGetPhotosCount.mockResolvedValue(1)
      mockGetEntries.mockRejectedValue(createAxiosError(429))

      const res = await request(createApp()).get('/photos').expect(429)

      expect(res.body).toEqual({ message: 'Too Many Attempts' })
    })

    it('returns 500 on generic error', async () => {
      mockGetPhotosPaginated.mockRejectedValue(new Error('DB error'))

      const res = await request(createApp()).get('/photos').expect(500)

      expect(res.body).toEqual({ message: 'Failed to load photos' })
    })
  })

  describe('POST /upload', () => {
    it('returns 400 when no files provided', async () => {
      const res = await request(createApp())
        .post('/photos/upload')
        .expect(400)

      expect(res.body).toEqual({ ok: false, error: 'No files provided' })
    })

    it('uploads one file and returns success with photo containing urls, fileName, private', async () => {
      const buffer = Buffer.from('fake-image-data')

      const res = await request(createApp())
        .post('/photos/upload')
        .field('private', 'false')
        .attach('files', buffer, 'photo.jpg')
        .expect(200)

      expect(res.body).toMatchObject({
        ok: true,
        successCount: 1,
        errorsCount: 0,
        totalCount: 1,
      })
      expect(res.body.results).toHaveLength(1)
      expect(res.body.results[0]).toMatchObject({
        ok: true,
        photo: {
          smSizeUrl: mockPhotoUrls.sm,
          mdSizeUrl: mockPhotoUrls.md,
          fullSizeUrl: mockPhotoUrls.full,
          fileName: 'photo.jpg',
          private: false,
        },
      })
      expect(mockCropPhotoAndUpload).toHaveBeenCalledTimes(3)
      expect(mockAddNewPhoto).toHaveBeenCalledTimes(1)
    })

    it('uploads one file with private true and returns photo with private flag', async () => {
      const buffer = Buffer.from('fake-image-data')

      const res = await request(createApp())
        .post('/photos/upload')
        .field('private', 'true')
        .attach('files', buffer, 'secret.jpg')
        .expect(200)

      expect(res.body.results[0].photo).toMatchObject({
        smSizeUrl: mockPhotoUrls.sm,
        mdSizeUrl: mockPhotoUrls.md,
        fullSizeUrl: mockPhotoUrls.full,
        fileName: 'secret.jpg',
        private: true,
      })
    })

    it('uploads multiple files and returns success with photos containing urls, fileName, private', async () => {
      const buffer = Buffer.from('fake-image-data')

      const res = await request(createApp())
        .post('/photos/upload')
        .field('private', 'false')
        .attach('files', buffer, 'photo1.jpg')
        .attach('files', buffer, 'photo2.jpg')
        .expect(200)

      expect(res.body).toMatchObject({
        ok: true,
        successCount: 2,
        errorsCount: 0,
        totalCount: 2,
      })
      expect(res.body.results[0]).toMatchObject({
        ok: true,
        photo: {
          smSizeUrl: mockPhotoUrls.sm,
          mdSizeUrl: mockPhotoUrls.md,
          fullSizeUrl: mockPhotoUrls.full,
          fileName: 'photo1.jpg',
          private: false,
        },
      })
      expect(res.body.results[1]).toMatchObject({
        ok: true,
        photo: {
          smSizeUrl: mockPhotoUrls.sm,
          mdSizeUrl: mockPhotoUrls.md,
          fullSizeUrl: mockPhotoUrls.full,
          fileName: 'photo2.jpg',
          private: false,
        },
      })
      expect(mockCropPhotoAndUpload).toHaveBeenCalledTimes(6)
      expect(mockAddNewPhoto).toHaveBeenCalledTimes(2)
    })

    it('returns 429 when drime returns rate limit on upload', async () => {
      mockCropPhotoAndUpload.mockRejectedValue(createAxiosError(429))

      const res = await request(createApp())
        .post('/photos/upload')
        .attach('files', Buffer.from('x'), 'photo.jpg')
        .expect(200)

      expect(res.body).toMatchObject({
        ok: false,
        successCount: 0,
        errorsCount: 1,
        totalCount: 1,
      })
      expect(res.body.results[0].error).toBeDefined()
    })
  })

  describe('GET /:id', () => {
    it('returns 404 when photo not found', async () => {
      mockGetPhotoById.mockResolvedValue(null)

      const res = await request(createApp())
        .get('/photos/nonexistent-id')
        .expect(404)

      expect(res.body).toEqual({ message: 'Photo not found' })
    })

    it('returns 403 when photo is private and user is not admin', async () => {
      mockGetPhotoById.mockResolvedValue({
        _id: 'id1',
        private: true,
        mdSizeEntryId: 'e1',
        fullSizeEntryId: 'e2',
      })

      const res = await request(createApp())
        .get('/photos/private-photo-id')
        .expect(403)

      expect(res.body).toEqual({ message: 'Forbidden' })
    })

    it('returns photo when found and public', async () => {
      const photo = {
        _id: 'id1',
        private: false,
        mdSizeEntryId: 'e1',
        fullSizeEntryId: 'e2',
        name: 'photo',
      }
      mockGetPhotoById.mockResolvedValue(photo)

      const res = await request(createApp())
        .get('/photos/id1')
        .expect(200)

      expect(res.body).toMatchObject({
        _id: 'id1',
        name: 'photo',
        mdSizeUrl: 'https://example.com/photo.jpg',
        fullSizeUrl: 'https://example.com/photo.jpg',
      })
    })

    it('returns private photo when user is admin', async () => {
      const photo = {
        _id: 'id1',
        private: true,
        mdSizeEntryId: 'e1',
        fullSizeEntryId: 'e2',
      }
      mockGetPhotoById.mockResolvedValue(photo)

      const res = await request(createApp())
        .get('/photos/id1')
        .set('Authorization', 'Bearer admin-token')
        .expect(200)

      expect(res.body).toMatchObject({ _id: 'id1' })
    })
  })

  describe('PUT /:id', () => {
    it('returns 404 when photo not found', async () => {
      mockUpdatePhotoById.mockResolvedValue(null)

      const res = await request(createApp())
        .put('/photos/nonexistent-id')
        .send({ title: 'New title' })
        .expect(404)

      expect(res.body).toEqual({ message: 'Photo not found' })
    })

    it('updates photo and returns result', async () => {
      const updated = {
        _id: 'id1',
        title: 'Updated',
        mdSizeEntryId: 'e1',
      }
      mockUpdatePhotoById.mockResolvedValue(updated)

      const res = await request(createApp())
        .put('/photos/id1')
        .send({ title: 'Updated' })
        .expect(200)

      expect(res.body).toMatchObject({
        _id: 'id1',
        title: 'Updated',
        url: 'https://example.com/photo.jpg',
      })
    })

    it('normalizes tags in update body', async () => {
      mockUpdatePhotoById.mockResolvedValue({
        _id: 'id1',
        tags: ['a', 'b'],
        mdSizeEntryId: 'e1',
      })

      await request(createApp())
        .put('/photos/id1')
        .send({ tags: 'a, b' })
        .expect(200)

      expect(mockUpdatePhotoById).toHaveBeenCalledWith(
        'id1',
        expect.objectContaining({ tags: expect.any(Array) })
      )
    })
  })

  describe('DELETE /:id', () => {
    it('deletes photo and returns ok', async () => {
      mockDeletePhotoById.mockResolvedValue({})

      const res = await request(createApp())
        .delete('/photos/id1')
        .expect(200)

      expect(res.body).toEqual({ ok: true })
      expect(mockDeletePhotoById).toHaveBeenCalledWith('id1')
    })

    it('returns 429 when drime returns rate limit', async () => {
      mockDeletePhotoById.mockRejectedValue(createAxiosError(429))

      const res = await request(createApp())
        .delete('/photos/id1')
        .expect(429)

      expect(res.body).toEqual({ message: 'Too Many Attempts' })
    })

    it('returns 500 on generic error', async () => {
      mockDeletePhotoById.mockRejectedValue(new Error('DB error'))

      const res = await request(createApp())
        .delete('/photos/id1')
        .expect(500)

      expect(res.body).toEqual({ message: 'Failed to delete photo' })
    })
  })
})
