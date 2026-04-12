import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { getUserByName } from '../../db/services/users.js'
import { issueSessionForUser } from './issueSession.js'

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' })
  }

  const foundUser = await getUserByName(username)

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'Неверный логин или пароль' })
  }

  if (!foundUser.password) {
    return res.status(401).json({ message: 'Неверный логин или пароль' })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) return res.status(401).json({ message: 'Неверный логин или пароль' })

  issueSessionForUser(res, {
    name: foundUser.name,
    roles: foundUser.roles,
    userId: foundUser._id?.toString(),
  })
}

export const refresh = (req: Request, res: Response) => {
  const cookies = req.cookies

  if (!cookies?.jwt) return res.status(401).json({ message: 'Токен не найден' })

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    env.REFRESH_TOKEN_SECRET,
    async (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
      if (err) {
        return res.status(403).json({ message: 'Токен недействителен' })
      }

      const foundUser = await getUserByName(
        typeof decoded === 'string' ? undefined : decoded?.username
      )

      if (!foundUser) return res.status(401).json({ message: 'Пользователь не найден' })

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.name,
            roles: foundUser.roles,
            ...(foundUser._id ? { userId: foundUser._id.toString() } : {}),
          },
        },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' },
      )

      res.json({ accessToken })
    }
  )
}

export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204)
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
  return res.json({ message: 'Куки очищены' })
}
