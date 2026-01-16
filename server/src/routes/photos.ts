import type { Request, Response } from 'express';
import express from 'express'
import multer from 'multer';
import {
  addNewPhoto,
  deletePhotoById,
  getAllPhotos,
  getPhotosPaginated,
  getPhotosCount,
  getPhotoById,
  updatePhotoById,
} from '../db/services/photos.ts'
import { cropPhotoAndUpload, getEntries, getToken } from '../services/drime.ts';
import { parseBoolean } from '../utils';
import { IPhotoFilters, IUserInfo } from '@/types/index.ts';
import { optionalAuth } from '../middlewares/optionalAuth';
import { FilterQuery } from 'mongoose'

const router = express.Router()

router.get(`/`, optionalAuth, async (req: Request & Partial<IUserInfo>, res: Response): Promise<any> => {
  try {
    const pageParam = req.query.page as string | undefined
    const privateParam = req.query.private as string | undefined
    const pageSize = pageParam ? 5 : 100// Number of photos per page
    const privateFilter = parseBoolean(privateParam)
    const filters: FilterQuery<IPhotoFilters> = {}

    if (privateFilter && req.roles && req.roles.includes('admin')) {
      filters.private = privateFilter
    } else {
      filters.$nor = [{ private: true }]
    }

    const page = pageParam ? parseInt(pageParam) : 1
    const [photos, totalCount] = await Promise.all([
      getPhotosPaginated(page, pageSize, filters),
      getPhotosCount(filters)
    ])

    const authResult = await getToken();
    const results = await Promise.all(photos
      .map(async (item) => {
        const { url: smSizeUrl } = await getEntries(`/file-entries/${item.smSizeEntryId}`, authResult?.user?.access_token)
        const { url: mdSizeUrl } = await getEntries(`/file-entries/${item.mdSizeEntryId}`, authResult?.user?.access_token)
        const { url: fullSizeUrl } = await getEntries(`/file-entries/${item.fullSizeEntryId}`, authResult?.user?.access_token)
        return {
          _id: item._id,
          name: item.name,
          title: item.title,
          priority: item.priority,
          smSizeUrl,
          mdSizeUrl,
          fullSizeUrl
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
    console.error(err);
    throw err
  }

})


const upload = multer({
  storage: multer.memoryStorage()
});

router.post(`/upload`, upload.array("files", 50), async (req: Request, res: Response): Promise<any> => {
  try {
    const authResult = await getToken() || '';
    const token = authResult?.user?.access_token
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, error: 'No files provided' })
    }

    // Process files sequentially
    const results = []
    for (const file of files) {
      try {
        const { url: fullSizeUrl, photoData: fullSizePhoto } = await cropPhotoAndUpload(file, token)
        const { url: smSizeUrl, photoData: smSizePhoto } = await cropPhotoAndUpload(file, token, 300)
        const { url: mdSizeUrl, photoData: mdSizePhoto } = await cropPhotoAndUpload(file, token, 1024)

        await addNewPhoto({
          smSizeUrl,
          mdSizeUrl,
          fullSizeUrl,
          smSizeEntryId: smSizePhoto.id.toString(),
          mdSizeEntryId: mdSizePhoto.id.toString(),
          fullSizeEntryId: fullSizePhoto.id.toString(),
          name: fullSizePhoto.name
        })
        results.push({ ok: true, fileName: file.originalname })
      } catch (err) {
        console.error(`Error uploading file ${file.originalname}:`, err);
        results.push({ ok: false, fileName: file.originalname, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    const successCount = results.filter(r => r.ok).length
    const fileCount = results.filter(r => !r.ok).length

    res.json({
      ok: successCount > 0,
      successCount,
      fileCount,
      totalCount: files.length,
      results
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' })
  }
})

router.get(`/:id`, optionalAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const authResult = await getToken() || '';
    const token = authResult?.user?.access_token
    const photo = await getPhotoById(req.params.id)

    if (!photo) {
      return res.status(404)
    }

    const { url } = await getEntries(`/file-entries/${photo.mdSizeEntryId}`, token)
    res.json({
      ...photo,
      url
    })
  } catch (err) {
    console.error(err);
  }
})

router.put(`/:id`, async (req: Request, res: Response): Promise<any> => {
  try {
    const authResult = await getToken() || '';
    const token = authResult?.user?.access_token
    const photo = await updatePhotoById(req.params.id, req.body)

    if (!photo) {
      return res.status(404)
    }

    const { url } = await getEntries(`/file-entries/${photo.mdSizeEntryId}`, token)
    res.json({
      ...photo,
      url
    })
  } catch (err) {
    console.error(err);
  }
})

router.delete(`/:id`, async (req: Request, res: Response): Promise<any> => {
  try {
    const photo = await deletePhotoById(req.params.id)

    res.json({
      ok: true
    })
  } catch (err) {
    console.error(err);
  }
})


export default router
