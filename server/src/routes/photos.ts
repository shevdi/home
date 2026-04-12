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
import drime from '../services/drime'
import { createUrlCache, type UrlSource } from '../services/urlCache.ts';
import { dadataReverseGeocode, nominatimReverseGeocode } from '../services';
import { getLocationValue, hasStatus, normalizeTags, queryBuilder } from '../utils';
import { logError } from '../db/services/logs';
import { photosQuerySchema, uploadBodySchema, uploadMetaSchema } from './photos.schema.js';
import { optionalAuth } from '../middlewares/optionalAuth';
import { verifyJWT } from '../middlewares/verifyJWT';
import { requireAdmin } from '../middlewares/requireAdmin';
import { cacheClear, cacheMiddleware } from '../middlewares/cache';
import type { RequestWithAuth } from '@/services/auth';
import type { ILink, PerFileOptionsItem } from '@shevdi-home/shared';
import { photoUpdateBodySchema } from '@shevdi-home/shared';
import {
  canViewPhoto,
  photosViewerCacheSegment,
  withPhotoVisibilityFilter,
} from '../utils/photoAccess.ts';
import { validatePhotoAccessedBy } from '../utils/validatePhotoAccessedBy.ts';
import type { MongoFilter } from '../utils/queryBuilder.ts';

const router = express.Router()

const getErrorStatus = (err: unknown): number | undefined => {
  if (axios.isAxiosError(err)) {
    return err.response?.status;
  }
  return hasStatus(err) ? err.status : undefined;
}

const sortTypes: Record<string, Record<string, SortOrder>> = {
  orderDownByTakenAt: { 'meta.takenAt': -1, _id: -1 },
  orderUpByTakenAt: { 'meta.takenAt': 1, _id: -1 },
  orderDownByEdited: { updatedAt: -1, _id: -1 }
}

const cache = cacheMiddleware('10 min', 'photos', (req) =>
  photosViewerCacheSegment((req as RequestWithAuth).auth),
)

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
    const parsed = photosQuerySchema.safeParse(req.query)
    const {
      page: pageParam,
      dateFrom: dateFromParam,
      dateTo: dateToParam,
      order: orderParam,
      tags: tagsParam,
      country: countryParam,
      city: cityParam,
    } = parsed.success ? parsed.data : {
      page: 1,
      dateFrom: undefined,
      dateTo: undefined,
      order: undefined,
      tags: [],
      country: [],
      city: [],
    }

    const pageSize = req.query.page ? 5 : 100 // Number of photos per page

    const builder = queryBuilder()
      .dateRange('meta.takenAt', dateFromParam, dateToParam)
      .allIn('tags', tagsParam, (v) => normalizeTags(v) ?? [])
      .locationMatch(normalizeTags(countryParam) ?? [], normalizeTags(cityParam) ?? [])
    const baseSearch = builder.build() as MongoFilter
    const search = withPhotoVisibilityFilter(baseSearch, req.auth) as MongoFilter

    const page = typeof pageParam === 'number' ? pageParam : 1
    const sort = orderParam ? sortTypes[orderParam] : undefined
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
        const accessedBy =
          Array.isArray(item.accessedBy) && item.accessedBy.length > 0
            ? item.accessedBy.map((g: { userId?: { toString(): string } }) => ({
                userId: String(g.userId),
              }))
            : undefined
        return {
          _id: item._id,
          name: item.name,
          fileName: item.fileName,
          title: item.title,
          priority: item.priority,
          private: item.private,
          accessedBy,
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

router.post(
  `/upload`,
  verifyJWT,
  requireAdmin,
  upload.array('files', 50),
  async (req: Request, res: Response) => {
  try {
    const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : []
    const bodyParsed = uploadBodySchema.safeParse(req.body)
    // #region agent log
    {
      const rawPfo = (req.body as Record<string, unknown>)?.perFileOptions
      fetch('http://127.0.0.1:7915/ingest/9992f24d-00f6-41c9-bc27-a45102f4306c', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd2a394' },
        body: JSON.stringify({
          sessionId: 'd2a394',
          location: 'photos.ts:upload:bodyParsed',
          message: 'upload body parse',
          data: {
            parseOk: bodyParsed.success,
            issues: bodyParsed.success ? undefined : bodyParsed.error.issues.slice(0, 8),
            perFileOptionsType: rawPfo === undefined ? 'undefined' : typeof rawPfo,
            perFileOptionsLen:
              typeof rawPfo === 'string' ? rawPfo.length : Array.isArray(rawPfo) ? rawPfo.length : null,
          },
          timestamp: Date.now(),
          hypothesisId: 'H3-H4',
        }),
      }).catch(() => {})
    }
    // #endregion
    const body = bodyParsed.success ? bodyParsed.data : {
      title: undefined,
      private: undefined,
      tags: [],
      country: [],
      city: [],
      meta: [],
      priority: undefined,
      accessedBy: [] as { userId: string }[],
      perFileOptions: [] as PerFileOptionsItem[],
    }
    const globalIsPrivate = body.private
    const globalTags = normalizeTags(body.tags)
    const globalCountry = normalizeTags(body.country) ?? []
    const globalCity = normalizeTags(body.city) ?? []
    const globalAccessedBy = body.accessedBy ?? []
    const perFileOptions = body.perFileOptions ?? []
    const hasPerFileOptions = perFileOptions.length > 0
    // #region agent log
    fetch('http://127.0.0.1:7915/ingest/9992f24d-00f6-41c9-bc27-a45102f4306c', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'd2a394' },
      body: JSON.stringify({
        sessionId: 'd2a394',
        location: 'photos.ts:upload:afterBody',
        message: 'perFileOptions resolved',
        data: {
          filesCount: files.length,
          perFileOptionsCount: perFileOptions.length,
          hasPerFileOptions,
          firstHasTitle: perFileOptions[0] ? Boolean(perFileOptions[0].title) : false,
        },
        timestamp: Date.now(),
        hypothesisId: 'H5',
      }),
    }).catch(() => {})
    // #endregion
    const metaParsed = uploadMetaSchema.safeParse(body.meta)
    const metaList = metaParsed.success ? metaParsed.data : []

    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: 'No files provided' })
    }

    try {
      await validatePhotoAccessedBy(globalAccessedBy)
      if (hasPerFileOptions) {
        const allPerFileAccessedBy = perFileOptions
          .flatMap((o) => o.accessedBy ?? [])
          .filter((v, i, a) => a.findIndex((x) => x.userId === v.userId) === i)
        if (allPerFileAccessedBy.length > 0) {
          await validatePhotoAccessedBy(allPerFileAccessedBy)
        }
      }
    } catch (ve) {
      const st = getErrorStatus(ve)
      return res.status(st ?? 400).json({
        ok: false,
        error: ve instanceof Error ? ve.message : 'Invalid accessedBy',
      })
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const results: Array<{ ok: boolean; fileName: string; photo?: unknown; error?: string }> = []
    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex]
      try {
        const metadata = await sharp(file.buffer).metadata()
        const gpsMeta = metaList[fileIndex]
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

        const fileOpts = hasPerFileOptions ? perFileOptions[fileIndex] : undefined
        const fileTags = fileOpts ? normalizeTags(fileOpts.tags) : globalTags
        const fileCountry = fileOpts ? (normalizeTags(fileOpts.country) ?? []) : globalCountry
        const fileCity = fileOpts ? (normalizeTags(fileOpts.city) ?? []) : globalCity
        const fileTitle = fileOpts ? fileOpts.title : body.title
        const filePriority = fileOpts ? fileOpts.priority : body.priority
        const fileIsPrivate = fileOpts?.private !== undefined ? fileOpts.private : globalIsPrivate
        const fileAccessedBy = fileOpts ? (fileOpts.accessedBy ?? []) : globalAccessedBy

        const locationValue = {
          country: Array.from(new Set([...fileCountry, ...country])),
          city: Array.from(new Set([...fileCity, ...city])),
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
          private: fileIsPrivate,
          tags: fileTags,
          location: {
            value: locationValue,
            nominatim: nominatim ?? undefined,
            dadata: dadata?.suggestions[0] ? {
              ...dadata.suggestions[0].data,
              value: dadata.suggestions[0].value
            } : undefined
          },
          meta,
          ...(fileTitle ? { title: fileTitle } : {}),
          ...(filePriority !== undefined ? { priority: filePriority } : {}),
          ...(fileAccessedBy.length ? { accessedBy: fileAccessedBy } : {}),
        })
        const result = { ok: true, fileName: file.originalname, photo: addedPhoto }
        results.push(result)
        res.write(`data: ${JSON.stringify({ type: 'progress', fileIndex, result })}\n\n`)
      } catch (err) {
        logError(err, { route: 'photos', action: 'upload', fileName: file.originalname })
        console.error(`Error uploading file ${file.originalname}:`, err)
        const result = {
          ok: false,
          fileName: file.originalname,
          error: err instanceof Error ? err.message : 'Unknown error',
        }
        results.push(result)
        res.write(`data: ${JSON.stringify({ type: 'progress', fileIndex, result })}\n\n`)
      }
    }

    const successCount = results.filter((r) => r.ok).length
    const errorsCount = results.filter((r) => !r.ok).length
    cacheClear('photos')
    res.write(
      `data: ${JSON.stringify({ type: 'complete', successCount, errorsCount, totalCount: files.length })}\n\n`,
    )
    res.end()
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
    if (!canViewPhoto(photo, req.auth)) {
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

router.put(`/:id`, verifyJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = photoUpdateBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request body' })
    }
    const body = parsed.data
    if (body.accessedBy !== undefined) {
      try {
        await validatePhotoAccessedBy(body.accessedBy)
      } catch (ve) {
        const st = getErrorStatus(ve)
        return res.status(st ?? 400).json({
          message: ve instanceof Error ? ve.message : 'Invalid accessedBy',
        })
      }
    }
    const normalizedTags = normalizeTags(body.tags !== undefined ? body.tags : req.body?.tags)
    const updateData: Record<string, unknown> =
      normalizedTags === undefined
        ? { ...body }
        : { ...body, tags: normalizedTags }
    const photo = await updatePhotoById(req.params.id, updateData as unknown as ILink)
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

router.delete(`/:id`, verifyJWT, requireAdmin, async (req: Request, res: Response) => {
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
