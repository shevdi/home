import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface AuthRequest extends Request {
  user?: string;
  roles?: Array<'admin' | 'user'>;
}

export const verifyJWT = (req: any, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || req.headers.Authorization) as string
  console.log('req.headers', req.headers)
  console.log('authHeader', authHeader)
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
    (err, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Forbidden' })
      console.log('decoded', decoded)
      req.user = decoded.UserInfo?.username
      req.roles = decoded.UserInfo.roles
      next()
    }
  )
}
