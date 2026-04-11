import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import { env } from '../../config/env.js'

/** Issues access token JSON body and refresh cookie (same contract as password login). */
export function issueSessionForUser(res: Response, user: { name: string; roles: string[] }) {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: user.name,
        roles: user.roles,
      },
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign({ username: user.name }, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

  res.cookie('jwt', refreshToken, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  res.json({ accessToken })
}
