import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import {
  getUserByName
} from '../db/services/users.ts'

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body
  // const hashedPwd = await bcrypt.hash(password, 10)

  if (!username || !password) {
    return res.status(400).json({ message: 'Все поля обязательны' })
  }

  const foundUser = await getUserByName(username)

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'Неверный логин или пароль' })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) return res.status(401).json({ message: 'Неверный логин или пароль' })

  const accessToken = jwt.sign(
    {
      "UserInfo": {
        "username": foundUser.name,
        "roles": foundUser.roles
      }
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { "username": foundUser.name },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: '7d' }
  )

  res.cookie('jwt', refreshToken, {
    httpOnly: false, //accessible only by web server 
    secure: true, //https
    sameSite: 'none', //cross-site cookie,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ accessToken })
}

export const refresh = (req: Request, res: Response) => {
  const cookies = req.cookies

  if (!cookies?.jwt) return res.status(401).json({ message: 'Токен не найден' })

  const refreshToken = cookies.jwt

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Токен недействителен' })
      }

      const foundUser = await getUserByName(decoded?.username)

      if (!foundUser) return res.status(401).json({ message: 'Пользователь не найден' })

      const accessToken = jwt.sign(
        {
          "UserInfo": {
            "username": foundUser.name,
            "roles": foundUser.roles
          }
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '15m' }
      )

      res.json({ accessToken })
    }
  )
}

export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies
  if (!cookies?.jwt) return res.sendStatus(204) //No content
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true })
  return res.json({ message: 'Куки очищены' })
}
