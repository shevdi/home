import type { Response, NextFunction } from 'express'
import type { RequestWithAuth } from '@/services/auth'

export function requireAdmin(req: RequestWithAuth, res: Response, next: NextFunction) {
  if (!req.auth?.roles?.includes('admin')) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  next()
}
