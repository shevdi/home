import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { projectsRoutes } from './routes/projects.ts'

const apiVersion = '/api/v1'

const app: Application = express();

var whitelist = [
  'https://shevdi.ru',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:5173',
  'https://localhost:3000',
  'https://localhost:3001'
]

app.use(helmet());
app.use(cors())
// app.use(cors({
//   origin: function (origin = '', callback) {
//     console.log(origin)
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: false
// }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

projectsRoutes(app)

app.get(`${apiVersion}/health`, (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get(`${apiVersion}/`, (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Shevdi Home API!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.get(`${apiVersion}/title`, (req: Request, res: Response) => {
  res.json({
    title: "Home page",
  });
});

// Error handling middleware
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({
//     error: 'Something went wrong!',
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

export { app };
