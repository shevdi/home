import type { Request, Response } from 'express';
import axios from 'axios';
import express from 'express'
import multer from 'multer';
import sharp from 'sharp';
import {
  addNewPhoto,
  deletePhotoById,
  getPhotosPaginated,
  getPhotosCount,
  getPhotoById,
  updatePhotoById,
} from '../db/services/photos.ts'
import drime from '../services/drime.ts';
import { normalizeTags, parseBoolean } from '../utils';
import { IPhotoSearch, IUserInfo } from '@/types/index.ts';
import { optionalAuth } from '../middlewares/optionalAuth';
import { verifyJWT } from '../middlewares/verifyJWT';
import { FilterQuery, SortOrder } from 'mongoose'

const router = express.Router()

const getErrorStatus = (err: unknown): number | undefined => {
  if (axios.isAxiosError(err)) {
    return err.response?.status;
  }
  return (err as { status?: number })?.status;
}

router.get(`/`, optionalAuth, async (req: Request & Partial<IUserInfo>, res: Response): Promise<any> => {
  try {
    const pageParam = <string>req.query.page
    const privateParam = <string>req.query.private
    const dateFromParam = <string>req.query.dateFrom
    const dateToParam = <string>req.query.dateTo
    const orderParam = <string>req.query.order
    const tagsParam = req.query.tags
    const pageSize = req.query.page ? 5 : 100// Number of photos per page
    const privateFilter = parseBoolean(privateParam)
    const search: FilterQuery<IPhotoSearch> & Record<string, unknown> = {}

    if (!req.roles || !req.roles.includes('admin')) {
      search.$nor = [{ private: true }]
    }

    const dateFrom = dateFromParam?.trim() || undefined
    const dateTo = dateToParam?.trim() || undefined
    if (dateFrom || dateTo) {
      const takenAt: Record<string, string> = {}
      if (dateFrom) {
        takenAt.$gte = dateFrom
      }
      if (dateTo) {
        takenAt.$lte = dateTo
      }
      search['meta.takenAt'] = takenAt
    }

    const tags = normalizeTags(tagsParam)
    if (tags && tags.length > 0) {
      search.tags = { $all: tags }
    }

    const page = pageParam ? parseInt(pageParam) : 1
    const sort: Record<string, SortOrder> =
      orderParam === 'orderDownByTakenAt' || orderParam === 'orderDownBtTakerAt'
        ? { 'meta.takenAt': -1 as SortOrder, _id: -1 as SortOrder }
        : orderParam === 'orderUpByTakenAt'
          ? { 'meta.takenAt': 1 as SortOrder, _id: -1 as SortOrder }
          : orderParam === 'orderDownByEdited'
            ? { updatedAt: -1 as SortOrder, _id: -1 as SortOrder }
            : { createdAt: -1 as SortOrder, _id: -1 as SortOrder }

    const [photos, totalCount] = await Promise.all([
      getPhotosPaginated(page, pageSize, search, sort),
      getPhotosCount(search)
    ])

    const results = await Promise.all(photos
      .map(async (item) => {
        const { url: smSizeUrl } = await drime.getEntries(`/file-entries/${item.smSizeEntryId}`)
        const { url: mdSizeUrl } = await drime.getEntries(`/file-entries/${item.mdSizeEntryId}`)
        const { url: fullSizeUrl } = await drime.getEntries(`/file-entries/${item.fullSizeEntryId}`)
        return {
          _id: item._id,
          name: item.name,
          fileName: item.fileName,
          title: item.title,
          priority: item.priority,
          private: item.private,
          tags: item.tags,
          smSizeUrl,
          mdSizeUrl,
          fullSizeUrl,
          updatedAt: item.updatedAt,
          createdAt: item.createdAt,
          page,
          meta: item.meta
        }
      })
    )
    const filteredResults = results.filter(item => item.fullSizeUrl)
    const totalPages = Math.ceil(totalCount / pageSize)

    return res.json({
      photos: filteredResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize
      }
    })
  } catch (err) {
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to load photos' })
  }

})


const upload = multer({
  storage: multer.memoryStorage()
});

router.post(`/upload`, upload.array("files", 50), async (req: Request, res: Response): Promise<any> => {
  try {
    const files = req.files as Express.Multer.File[];
    const isPrivate = parseBoolean(req.body?.private as string | undefined)
    const tags = normalizeTags(req.body?.tags)
    const meta = req.body?.meta
    const metaRaw = req.body?.meta as string | undefined
    const metaList = metaRaw
      ? (JSON.parse(metaRaw) as Array<{
        gpsLatitude?: number
        gpsLongitude?: number
        gpsAltitude?: number
        make?: string
        model?: string
        takenAt?: string
      }>)
      : []

    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: 'No files provided' })
    }

    // Process files sequentially
    const results = []
    for (const file of files) {
      try {
        const metadata = await sharp(file.buffer).metadata()
        const gpsMeta = metaList[results.length]
        const { url: fullSizeUrl, photoData: fullSizePhoto } = await drime.cropPhotoAndUpload(file)
        const { url: smSizeUrl, photoData: smSizePhoto } = await drime.cropPhotoAndUpload(file, 300)
        const { url: mdSizeUrl, photoData: mdSizePhoto } = await drime.cropPhotoAndUpload(file, 1024)

        await addNewPhoto({
          smSizeUrl,
          mdSizeUrl,
          fullSizeUrl,
          smSizeEntryId: smSizePhoto.id.toString(),
          mdSizeEntryId: mdSizePhoto.id.toString(),
          fullSizeEntryId: fullSizePhoto.id.toString(),
          name: fullSizePhoto.name,
          fileName: file.originalname,
          private: isPrivate,
          tags,
          meta: {
            ...metadata,
            ...gpsMeta
          },
        })
        results.push({ ok: true, fileName: file.originalname })
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}:`, err);
        results.push({ ok: false, fileName: file.originalname, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    const successCount = results.filter(r => r.ok).length
    const errorsCount = results.filter(r => !r.ok).length

    res.json({
      ok: successCount > 0,
      successCount,
      errorsCount,
      totalCount: files.length,
      results
    })
  } catch (err) {
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ ok: false, error: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' })
  }
})

router.get(`/:id`, optionalAuth, async (req: Request & Partial<IUserInfo>, res: Response): Promise<any> => {
  try {
    const photo = await getPhotoById(req.params.id)

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' })
    }
    if (photo.private && (!req.roles || !req.roles.includes('admin'))) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { url: mdSizeUrl } = await drime.getEntries(`/file-entries/${photo.mdSizeEntryId}`)
    const { url: fullSizeUrl } = await drime.getEntries(`/file-entries/${photo.fullSizeEntryId}`)
    return res.json({
      ...photo,
      mdSizeUrl,
      fullSizeUrl
    })
  } catch (err) {
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to load photo' })
  }
})

router.put(`/:id`, verifyJWT, async (req: Request, res: Response): Promise<any> => {
  try {
    const normalizedTags = normalizeTags(req.body?.tags)
    const updateData = normalizedTags === undefined ? req.body : { ...req.body, tags: normalizedTags }
    const photo = await updatePhotoById(req.params.id, updateData)

    if (!photo) {
      return res.status(404)
    }

    const { url } = await drime.getEntries(`/file-entries/${photo.mdSizeEntryId}`)
    res.json({
      ...photo,
      url
    })
  } catch (err) {
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to update photo' })
  }
})

router.delete(`/:id`, verifyJWT, async (req: Request, res: Response): Promise<any> => {
  try {
    await deletePhotoById(req.params.id)

    res.json({
      ok: true
    })
  } catch (err) {
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete photo' })
  }
})


export default router
