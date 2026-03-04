import { DecodedJwtPayload, RequestWithAuth } from '@/types'
import { NextFunction, Response } from 'express'
import jwt, { VerifyCallback } from 'jsonwebtoken'

/**
 * Optional authentication middleware that extracts user info from JWT if present,
 * but does not block requests if no token is provided or token is invalid.
 * User info is attached to req.auth if authentication succeeds.
 */
export const optionalAuth = (req: RequestWithAuth, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string

  // If no authorization header, proceed without user info
  if (!authHeader || (typeof authHeader === 'string' && !authHeader?.startsWith('Bearer '))) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
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
