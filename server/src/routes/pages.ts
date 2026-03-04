import type { Request, Response } from 'express';
import express from 'express'
import {
  getPage,
  changePage
} from '../db/services/pages.ts'
import { verifyJWT } from '../middlewares/verifyJWT'
import { cacheMiddleware, cacheClear } from '../middlewares/cache'
import { logError } from '../db/services/logs'

const router = express.Router()
const cache = cacheMiddleware('1 day', 'pages')

router.get(`/:id`, cache, async (req: Request, res: Response) => {
  try {
    const page = await getPage(req.params.id)
    return res.json(page)
  } catch (err) {
    logError(err, { route: 'pages', action: 'get', id: req.params.id })
    return res.status(500).end()
  }
})

router.use(verifyJWT)

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedPage = await changePage(req.params.id, req.body)
    cacheClear('pages')
    return res.json(updatedPage)
  } catch (err) {
    logError(err, { route: 'pages', action: 'put', id: req.params.id })
    return res.status(500).end()
  }
})

export default router