import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser'

import authRouter from './routes/auth.ts'
import pagesRouter from './routes/pages.ts'
import photosRouter from './routes/photos.ts'
import testRouter from './routes/test.ts'
import { whitelist } from './config';

const apiVersion = '/api/v1'

const app: Application = express();

app.use(helmet());
app.use(cors({
  origin: whitelist,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "If-None-Match", "ETag", "X-Served-At"],
  exposedHeaders: ["ETag", "X-Served-At"],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(`${apiVersion}/pages`, pagesRouter)
app.use(`${apiVersion}/auth`, authRouter)
app.use(`${apiVersion}/photos`, photosRouter)

if (process.env.E2E_LOGIN) {
  app.use(`${apiVersion}/__test`, testRouter)
}

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

app.all('*', (req: Request, res: Response) => {
  res.status(404)
    .json({ title: '404' })
})

// Error handling middleware
// app.use((err: Error, req: Request, res: Response) => {
//   console.error(err.stack);
//   res.status(500).json({
//     error: 'Something went wrong!',
//     message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

export { app };
