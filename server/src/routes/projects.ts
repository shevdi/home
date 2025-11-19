import type { Application, Request, Response } from 'express';
import {
  listAllProjects,
} from '../db/services/projects.ts'

export function projectsRoutes(app: Application, apiVersion: string) {
  app.get(`${apiVersion}/projects`, async (req: Request, res: Response): Promise<any> => {
    try {
      const projects = await listAllProjects()
      return res.json(projects)
    } catch (err) {
      return res.status(500).end()
    }
  })
}
