import type { Application, Request, Response } from 'express';
import {
  listAllProjects,
} from '../services/projects.ts'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function projectsRoutes(app: Application) {
  // app.get('*', (req, res) => {
  //   console.log(path.resolve(__dirname, 'src', 'public', 'index.html'))
  //   res.sendFile(path.resolve(__dirname, 'src', 'public', 'index.html'));
  // });
  app.get('/api/v1/projects', async (req: Request, res: Response): Promise<any> => {
    console.log(path.resolve(__dirname, 'src', 'public', 'index.html'))
    try {
      const projects = await listAllProjects()
      return res.json(projects)
    } catch (err) {
      console.error('error listing posts', err)
      return res.status(500).end()
    }
  })
}
