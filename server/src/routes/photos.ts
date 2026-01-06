import type { Request, Response } from 'express';
import express from 'express'
import multer from 'multer';
import {
  addNewPhoto,
  deletePhotoById,
  getAllPhotos,
  getPhotoById,
  updatePhotoById,
} from '../db/services/photos.ts'
import { cropPhotoAndUpload, getEntries, getToken, updateEntry, uploadPhotos } from '../services/drime.ts';

const router = express.Router()

router.get(`/`, async (req: Request, res: Response): Promise<any> => {
  try {
    const photos = await getAllPhotos()
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
    return res.json(results.filter(item => item.fullSizeUrl))
  } catch (err) {
    console.error(err);
    throw err
  }

})


const upload = multer({
  storage: multer.memoryStorage()
});

router.post(`/upload`, upload.single("file"), async (req: Request, res: Response): Promise<any> => {
  try {
    const authResult = await getToken() || '';
    const token = authResult?.user?.access_token
    const file = req.file!;

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
    res.json({ ok: true })
  } catch (err) {
    console.error(err);
  }
})

router.get(`/:id`, async (req: Request, res: Response): Promise<any> => {
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
