import type { Application, Request, Response } from 'express';
import {
  listAllProjects,
} from '../services/projects.ts'

export function projectsRoutes(app: Application) {
  app.get('/api/v1/projects', async (req: Request, res: Response): Promise<any> => {
    try {
      const projects = await listAllProjects()
      return res.json(projects)
    } catch (err) {
      console.error('error listing posts', err)
      return res.status(500).end()
    }
  })
}
