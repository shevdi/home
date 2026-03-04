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
import { createUrlCache, type UrlSource } from '../services/urlCache.ts';
import { dadataReverseGeocode, nominatimReverseGeocode } from '../services';
import { getLocationValue, normalizeTags, parseBoolean, queryBuilder } from '../utils';
import { logError } from '../db/services/logs';
import { RequestWithAuth } from '@/types';
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

const urlSource: UrlSource = {
  listIds: (page) => drime.getFilesList(page),
  fetchUrlById: (id) => drime.getFiles(`/file-entries/${id}`).then((r) => r.url),
}

const urlCache = createUrlCache()

urlCache.preload(urlSource).catch((err) => {
  logError(err, { source: 'urlCache.preload' })
  console.error('urlCache preload failed:', err)
})
urlCache.startRefresh(urlSource)

router.get(`/`, optionalAuth, cache, async (req: RequestWithAuth, res: Response) => {
  try {
    const pageParam = <string>req.query.page
    const dateFromParam = <string>req.query.dateFrom
    const dateToParam = <string>req.query.dateTo
    const orderParam = <string>req.query.order
    const tagsParam = req.query.tags
    const countryParam = req.query.country
    const cityParam = req.query.city
    const pageSize = req.query.page ? 5 : 100 // Number of photos per page

    const isAdmin = Boolean(req.auth?.roles?.includes('admin'))
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
        const [smSizeUrl, mdSizeUrl, fullSizeUrl] = await Promise.all([
          urlCache.getUrl(urlSource, item.smSizeEntryId),
          urlCache.getUrl(urlSource, item.mdSizeEntryId),
          urlCache.getUrl(urlSource, item.fullSizeEntryId),
        ])
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
    logError(err, { route: 'photos', action: 'get' })
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

router.post(`/upload`, upload.array("files", 50), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const isPrivate = parseBoolean(req.body?.private as string | undefined)
    const tags = normalizeTags(req.body?.tags)
    const userCountry = normalizeTags(req.body?.country) ?? []
    const userCity = normalizeTags(req.body?.city) ?? []
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

        const { country, city } = getLocationValue([nominatim, dadata])

        const locationValue = {
          country: Array.from(new Set([...userCountry, ...country])),
          city: Array.from(new Set([...userCity, ...city])),
        }

        const { url: fullSizeUrl, photoData: fullSizePhoto } = await drime.cropPhotoAndUpload(file)
        const { url: smSizeUrl, photoData: smSizePhoto } = await drime.cropPhotoAndUpload(file, 300)
        const { url: mdSizeUrl, photoData: mdSizePhoto } = await drime.cropPhotoAndUpload(file, 1024)

        urlCache.setUrl(fullSizePhoto.id.toString(), fullSizeUrl)
        urlCache.setUrl(smSizePhoto.id.toString(), smSizeUrl)
        urlCache.setUrl(mdSizePhoto.id.toString(), mdSizeUrl)

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
        logError(err, { route: 'photos', action: 'upload', fileName: file.originalname })
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
    logError(err, { route: 'photos', action: 'upload' })
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ ok: false, error: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' })
  }
})

router.get(`/:id`, optionalAuth, cache, async (req: RequestWithAuth, res: Response) => {
  try {
    const photo = await getPhotoById(req.params.id)

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' })
    }
    if (photo.private && (!req.auth?.roles || !req.auth.roles.includes('admin'))) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    const [mdSizeUrl, fullSizeUrl] = await Promise.all([
      urlCache.getUrl(urlSource, photo.mdSizeEntryId),
      urlCache.getUrl(urlSource, photo.fullSizeEntryId),
    ])
    return res.json({
      ...photo,
      mdSizeUrl,
      fullSizeUrl
    })
  } catch (err) {
    logError(err, { route: 'photos', action: 'getById', id: req.params.id })
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to load photo' })
  }
})

router.put(`/:id`, verifyJWT, async (req: Request, res: Response) => {
  try {
    const normalizedTags = normalizeTags(req.body?.tags)
    const updateData = normalizedTags === undefined ? req.body : { ...req.body, tags: normalizedTags }
    const photo = await updatePhotoById(req.params.id, updateData)
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    const url = await urlCache.getUrl(urlSource, photo.mdSizeEntryId)
    cacheClear('photos')
    res.json({
      ...photo,
      url
    })
  } catch (err) {
    logError(err, { route: 'photos', action: 'put', id: req.params.id })
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to update photo' })
  }
})

router.delete(`/:id`, verifyJWT, async (req: Request, res: Response) => {
  try {
    const photo = await getPhotoById(req.params.id)

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' })
    }

    const entryIds = [photo.smSizeEntryId, photo.mdSizeEntryId, photo.fullSizeEntryId]
      .filter((id): id is string => Boolean(id))

    await drime.deleteFile(entryIds)
    urlCache.remove(entryIds)

    await deletePhotoById(req.params.id)
    cacheClear('photos')

    res.json({
      ok: true
    })
  } catch (err) {
    logError(err, { route: 'photos', action: 'delete', id: req.params.id })
    const status = getErrorStatus(err);
    if (status === 429) {
      return res.status(429).json({ message: 'Too Many Attempts' })
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete photo' })
  }
})


export default router
