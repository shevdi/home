import express, { type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import { Photo } from '../db/models/link'
import { User } from '../db/models/user'
import { cacheClear } from '../middlewares/cache'

const router = express.Router()

router.post('/seed-photos', async (req: Request, res: Response) => {
  try {
    const photos = req.body?.photos
    if (!Array.isArray(photos)) {
      return res.status(400).json({ error: 'photos array required' })
    }
    await Photo.deleteMany({})
    await Photo.insertMany(photos)
    cacheClear('photos')
    return res.json({ ok: true, count: photos.length })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

router.post('/reset-photos', async (_req: Request, res: Response) => {
  try {
    await Photo.deleteMany({})
    cacheClear('photos')
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

router.post('/seed-user', async (req: Request, res: Response) => {
  try {
    const { username, password, roles = ['admin'] } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' })
    }
    const hashed = await bcrypt.hash(password, 10)
    await User.findOneAndUpdate(
      { name: username },
      { name: username, email: `${username}@test.local`, password: hashed, roles, active: true },
      { upsert: true }
    )
    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
})

export default router
