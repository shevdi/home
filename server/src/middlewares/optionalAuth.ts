import { DecodedJwtPayload, IUserInfo } from '@/types'
import { NextFunction, Request, Response } from 'express'
import jwt, { VerifyCallback } from 'jsonwebtoken'

/**
 * Optional authentication middleware that extracts user info from JWT if present,
 * but does not block requests if no token is provided or token is invalid.
 * User info (username, roles) is attached to the request object if authentication succeeds.
 */
export const optionalAuth = (req: Request & Partial<IUserInfo>, res: Response, next: NextFunction) => {
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
      req.username = decoded?.UserInfo?.username
      req.roles = decoded?.UserInfo?.roles
      next()
    }) as VerifyCallback
  )
}
