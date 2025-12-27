import { DecodedJwtPayload, IUserInfo } from '@/types'
import { NextFunction, Request, Response } from 'express'
import jwt, { VerifyCallback } from 'jsonwebtoken'

export const verifyJWT = (req: Request & Partial<IUserInfo>, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string
  if (!authHeader) {
    if (!req.headers.cookie?.includes('jwt')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    return res.status(403).json({ message: 'Forbidden' })
  }
  if (typeof authHeader === 'string' && !authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    ((err, decoded: DecodedJwtPayload) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })
      req.username = decoded?.UserInfo?.username
      req.roles = decoded?.UserInfo?.roles
      next()
    }) as VerifyCallback
  )
}
