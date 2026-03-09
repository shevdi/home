import { NextFunction, Response } from 'express'
import jwt, { VerifyCallback } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { getAuthHeader } from '../utils/authHeader.js'
import { RequestWithAuth } from '@/services/auth'
import { DecodedJwtPayload } from '@shevdi-home/shared'

/**
 * Optional authentication middleware that extracts user info from JWT if present,
 * but does not block requests if no token is provided or token is invalid.
 * User info is attached to req.auth if authentication succeeds.
 */
export const optionalAuth = (req: RequestWithAuth, res: Response, next: NextFunction) => {
  const authHeader = getAuthHeader(req)

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(
    token,
    env.ACCESS_TOKEN_SECRET,
    ((err, decoded: DecodedJwtPayload) => {
      // If token is invalid, proceed without user info (don't block)
      if (err) {
        return next()
      }

      // If token is valid, attach user info to request
      req.auth = {
        username: decoded?.UserInfo?.username,
        roles: decoded?.UserInfo?.roles,
      }
      next()
    }) as VerifyCallback
  )
}
