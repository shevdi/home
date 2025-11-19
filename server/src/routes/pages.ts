import type { Request, Response } from 'express';
import express from 'express'
import {
  getPage,
} from '../db/services/pages.ts'
import { verifyJWT } from '../middlewares/verifyJWT'

const router = express.Router()


router.get(`/:id`, async (req: Request, res: Response): Promise<any> => {
  try {
    const page = await getPage(req.params.id)
    return res.json(page)
  } catch (err) {
    return res.status(500).end()
  }
})

router.use(verifyJWT)

export default router