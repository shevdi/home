import type { Request, Response } from 'express';
import axios from 'axios';
import express from 'express'
import multer from 'multer';
import sharp from 'sharp';
import { SortOrder } from 'mongoose'
import {
  addNewPhoto,
  deletePhotoById,
  getPhotosPaginated,
  getPhotosCount,
  getPhotoById,
  updatePhotoById,
} from '../db/services/photos.ts'
import drime from '../services/drime.ts';
import { dadataReverseGeocode, nominatimReverseGeocode } from '../services';
import { getLocationValue, normalizeTags, parseBoolean, queryBuilder } from '../utils';
import { IUserInfo } from '@/types';
import { optionalAuth } from '../middlewares/optionalAuth';
import { verifyJWT } from '../middlewares/verifyJWT';
import { cacheClear, cacheMiddleware } from '../middlewares/cache';

const router = express.Router()

const getErrorStatus = (err: unknown): number | undefined => {
  if (axios.isAxiosError(err)) {
    return err.response?.status;
  }
  return (err as { status?: number })?.status;
}

const sortTypes: Record<string, Record<string, SortOrder>> = {
  orderDownByTakenAt: { 'meta.takenAt': -1, _id: -1 },
  orderUpByTakenAt: { 'meta.takenAt': 1, _id: -1 },
  orderDownByEdited: { updatedAt: -1, _id: -1 }
}

const cache = cacheMiddleware('10 min', 'photos')

router.get(`/`, optionalAuth, cache, async (req: Request & Partial<IUserInfo>, res: Response): Promise<any> => {
  try {
    const pageParam = <string>req.query.page
    const dateFromParam = <string>req.query.dateFrom
    const dateToParam = <string>req.query.dateTo
    const orderParam = <string>req.query.order
    const tagsParam = req.query.tags
    const countryParam = req.query.country
    const cityParam = req.query.city
    const pageSize = req.query.page ? 5 : 100 // Number of photos per page

    const isAdmin = Boolean(req.roles?.includes('admin'))
    const builder = queryBuilder()
      .dateRange('meta.takenAt', dateFromParam, dateToParam)
      .allIn('tags', tagsParam, (v) => normalizeTags(v) ?? [])
      .locationMatch(normalizeTags(countryParam) ?? [], normalizeTags(cityParam) ?? [])
    const search = (isAdmin ? builder : builder.excludeWhere('private', true)).build()

    const page = pageParam ? parseInt(pageParam) : 1
    const sort = sortTypes[orderParam]

    const [photos, totalCount] = await Promise.all([
      getPhotosPaginated(page, pageSize, search, sort),
      getPhotosCount(search)
    ])

    const results = await Promise.all(photos
      .map(async (item) => {
        const { url: smSizeUrl } = await drime.getFiles(`/file-entries/${item.smSizeEntryId}`)
        const { url: mdSizeUrl } = await drime.getFiles(`/file-entries/${item.mdSizeEntryId}`)
        const { url: fullSizeUrl } = await drime.getFiles(`/file-entries/${item.fullSizeEntryId}`)
        return {
          _id: item._id,
          name: item.name,
          fileName: item.fileName,
          title: item.title,
          priority: item.priority,
          private: item.private,
          tags: item.tags,
          location: item.location,
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
        const meta = {
          ...metadata,
          ...gpsMeta,
          takenAtDate: gpsMeta?.takenAt ? new Date(gpsMeta?.takenAt) : undefined
        }
        const lat = meta.gpsLatitude
        const lon = meta.gpsLongitude
        const [nominatim, dadata] = lat != null && lon != null ? await Promise.all([
          nominatimReverseGeocode(lat, lon),
          dadataReverseGeocode(lat, lon),
        ]) : [null, null]

        const locationValue = getLocationValue([nominatim, dadata])

        const { url: fullSizeUrl, photoData: fullSizePhoto } = await drime.cropPhotoAndUpload(file)
        const { url: smSizeUrl, photoData: smSizePhoto } = await drime.cropPhotoAndUpload(file, 300)
        const { url: mdSizeUrl, photoData: mdSizePhoto } = await drime.cropPhotoAndUpload(file, 1024)

        const addedPhoto = await addNewPhoto({
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
          location: {
            value: locationValue,
            nominatim: nominatim ?? undefined,
            dadata: dadata?.suggestions[0] ? {
              ...dadata.suggestions[0].data,
              value: dadata.suggestions[0].value
            } : undefined
          },
          meta,
        })
        results.push({ ok: true, photo: addedPhoto })
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}:`, err);
        results.push({ ok: false, fileName: file.originalname, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    const successCount = results.filter(r => r.ok).length
    const errorsCount = results.filter(r => !r.ok).length
    cacheClear('photos')
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

router.get(`/:id`, optionalAuth, cache, async (req: Request & Partial<IUserInfo>, res: Response): Promise<any> => {
  try {
    const photo = await getPhotoById(req.params.id)

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' })
    }
    if (photo.private && (!req.roles || !req.roles.includes('admin'))) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const { url: mdSizeUrl } = await drime.getFiles(`/file-entries/${photo.mdSizeEntryId}`)
    const { url: fullSizeUrl } = await drime.getFiles(`/file-entries/${photo.fullSizeEntryId}`)
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
      return res.status(404).json({ message: 'Photo not found' })
    }

    const { url } = await drime.getFiles(`/file-entries/${photo.mdSizeEntryId}`)
    cacheClear('photos')
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
    const photo = await getPhotoById(req.params.id)

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    const entryIds = [photo.smSizeEntryId, photo.mdSizeEntryId, photo.fullSizeEntryId]
      .filter((id): id is string => Boolean(id))

    await drime.deleteFile(entryIds)

    await deletePhotoById(req.params.id)
    cacheClear('photos')

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
