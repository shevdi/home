import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals'
import type { Request, Response } from 'express'

type JwtVerifyCallback = (err: Error | null, decoded: { username?: string; UserInfo?: { username?: string; roles?: string[] } } | null) => void

let login: typeof import('../auth.js').login
let refresh: typeof import('../auth.js').refresh
let logout: typeof import('../auth.js').logout
let bcryptModule: typeof import('bcrypt')
let jwtModule: typeof import('jsonwebtoken')
let usersModule: typeof import('../../db/services/users.js')

const createRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    sendStatus: jest.fn()
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  res.cookie.mockReturnValue(res)
  res.clearCookie.mockReturnValue(res)
  res.sendStatus.mockReturnValue(res)
  return res as unknown as Response
}

beforeAll(async () => {
  bcryptModule = await import('bcrypt')
  jwtModule = await import('jsonwebtoken')
  usersModule = await import('../../db/services/users.js')
  ; ({ login, refresh, logout } = await import('../auth.js'))
})

beforeEach(() => {
  jest.restoreAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
  process.env.REFRESH_TOKEN_SECRET = 'refresh-secret'
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('auth service', () => {
  it('returns 400 when username or password missing', async () => {
    const req = { body: {} } as unknown as Request
    const res = createRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ message: 'Все поля обязательны' })
  })

  it('returns 401 when user not found or inactive', async () => {
    jest.spyOn(usersModule, 'getUserByName').mockResolvedValue({
      active: false
    } as never)
    const req = { body: { username: 'user', password: 'pass' } } as unknown as Request
    const res = createRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Неверный логин или пароль' })
  })

  it('returns 401 when password does not match', async () => {
    jest.spyOn(usersModule, 'getUserByName').mockResolvedValue({
      name: 'user',
      roles: ['user'],
      password: 'hash',
      active: true
    } as never)
    jest.spyOn((bcryptModule as unknown as { default: { compare: (...args: unknown[]) => Promise<boolean> } }).default, 'compare').mockResolvedValue(false as never)
    const req = { body: { username: 'user', password: 'pass' } } as unknown as Request
    const res = createRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Неверный логин или пароль' })
  })

  it('sets refresh cookie and returns access token on login', async () => {
    jest.spyOn(usersModule, 'getUserByName').mockResolvedValue({
      name: 'user',
      roles: ['admin'],
      password: 'hash',
      active: true
    } as never)
    jest.spyOn((bcryptModule as unknown as { default: { compare: (...args: unknown[]) => Promise<boolean> } }).default, 'compare').mockResolvedValue(true as never)
    jest.spyOn((jwtModule as unknown as { default: { sign: (...args: unknown[]) => string; verify: (...args: unknown[]) => void } }).default, 'sign')
      .mockReturnValueOnce('access-token' as never)
      .mockReturnValueOnce('refresh-token' as never)
    const req = { body: { username: 'user', password: 'pass' } } as unknown as Request
    const res = createRes()

    await login(req, res)

    expect(res.cookie).toHaveBeenCalledWith('jwt', 'refresh-token', {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    expect(res.json).toHaveBeenCalledWith({ accessToken: 'access-token' })
  })

  it('returns 401 when refresh cookie missing', () => {
    const req = { cookies: {} } as unknown as Request
    const res = createRes()

    refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Токен не найден' })
  })

  it('returns 403 when refresh token is invalid', async () => {
    jest.spyOn((jwtModule as unknown as { default: { sign: (...args: unknown[]) => string; verify: (...args: unknown[]) => void } }).default, 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(new Error('invalid'), null)
    })
    const req = { cookies: { jwt: 'token' } } as unknown as Request
    const res = createRes()

    await refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Токен недействителен' })
  })

  it('returns 401 when refresh token user missing', async () => {
    jest.spyOn((jwtModule as unknown as { default: { sign: (...args: unknown[]) => string; verify: (...args: unknown[]) => void } }).default, 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { username: 'user' })
    })
    jest.spyOn(usersModule, 'getUserByName').mockResolvedValue(null as never)
    const req = { cookies: { jwt: 'token' } } as unknown as Request
    const res = createRes()

    await refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' })
  })

  it('returns access token when refresh token valid', async () => {
    jest.spyOn((jwtModule as unknown as { default: { sign: (...args: unknown[]) => string; verify: (...args: unknown[]) => void } }).default, 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { username: 'user' })
    })
    jest.spyOn(usersModule, 'getUserByName').mockResolvedValue({
      name: 'user',
      roles: ['user']
    } as never)
    jest.spyOn((jwtModule as unknown as { default: { sign: (...args: unknown[]) => string; verify: (...args: unknown[]) => void } }).default, 'sign').mockReturnValueOnce('new-access-token' as never)
    const req = { cookies: { jwt: 'token' } } as unknown as Request
    const res = createRes()

    await refresh(req, res)

    expect(res.json).toHaveBeenCalledWith({ accessToken: 'new-access-token' })
  })

  it('returns 204 when logout without cookie', () => {
    const req = { cookies: {} } as unknown as Request
    const res = createRes()

    logout(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(204)
  })

  it('clears cookie and returns message on logout', () => {
    const req = { cookies: { jwt: 'token' } } as unknown as Request
    const res = createRes()

    logout(req, res)

    expect(res.clearCookie).toHaveBeenCalledWith('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    })
    expect(res.json).toHaveBeenCalledWith({ message: 'Куки очищены' })
  })
})
