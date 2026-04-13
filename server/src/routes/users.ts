import type { Request, Response } from 'express'
import express from 'express'
import { User } from '../db/models/user'
import { verifyJWT } from '../middlewares/verifyJWT'
import { requireAdmin } from '../middlewares/requireAdmin'
import { logError } from '../db/services/logs'

const router = express.Router()

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

router.get('/suggestions', verifyJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q ?? '').trim()
    const limitRaw = Number(req.query.limit)
    const limit = Math.min(50, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 20))
    const rx = new RegExp(escapeRegex(q), 'i')
    const users = await User.find({ name: rx }).limit(limit).select('name').lean()
    res.json(users.map((u) => ({ id: u._id.toString(), name: u.name })))
  } catch (err) {
    logError(err, { route: 'users', action: 'suggestions' })
    res.status(500).json({ message: 'Failed to load users' })
  }
})

export default router
