import { DecodedJwtPayload, RequestWithAuth } from '@/types'
import { NextFunction, Response } from 'express'
import jwt, { VerifyCallback } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { getAuthHeader } from '../utils/authHeader.js'

export const verifyJWT = (req: RequestWithAuth, res: Response, next: NextFunction) => {
  const authHeader = getAuthHeader(req)
  if (!authHeader) {
    if (!req.headers.cookie?.includes('jwt')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    return res.status(403).json({ message: 'Forbidden' })
  }
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(
    token,
    env.ACCESS_TOKEN_SECRET,
    ((err, decoded: DecodedJwtPayload) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })
      req.auth = {
        username: decoded?.UserInfo?.username,
        roles: decoded?.UserInfo?.roles,
        userId: decoded?.UserInfo?.userId,
      }
      next()
    }) as VerifyCallback
  )
}
