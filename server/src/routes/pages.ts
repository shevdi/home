import type { Application, Request, Response } from 'express';
import {
  getPage,
} from '../services/page.ts'

export function pagesRoutes(app: Application) {
  app.get('/api/v1/pages/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const page = await getPage(req.params.id)
      return res.json(page)
    } catch (err) {
      console.error('error listing posts', err)
      return res.status(500).end()
    }
  })
}
