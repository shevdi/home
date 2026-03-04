import type { Application, Request, Response } from 'express';
import {
  listAllProjects,
} from '../db/services/projects.ts'
import { logError } from '../db/services/logs'

export function projectsRoutes(app: Application, apiVersion: string) {
  app.get(`${apiVersion}/projects`, async (req: Request, res: Response): Promise<void> => {
    try {
      const projects = await listAllProjects()
      return res.json(projects)
    } catch (err) {
      logError(err, { route: 'projects', action: 'get' })
      return res.status(500).end()
    }
  })
}
