import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals'
import type { Request, Response } from 'express'

type JwtVerifyCallback = (err: Error | null, decoded: { username?: string; UserInfo?: { username?: string; roles?: string[] } } | null) => void
/** Mock for async functions; use Promise<T> so mockResolvedValue(value) accepts T */
type JestMockFn<T = unknown> = jest.MockedFunction<(...args: unknown[]) => Promise<T>>
/** Mock for callback-style functions (e.g. jwt.verify) */
type JestMockFnCallback = jest.MockedFunction<(...args: unknown[]) => void>

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: jest.fn()
  }
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn()
  }
}))

jest.unstable_mockModule('../../db/services/users.js', () => ({
  getUserByName: jest.fn()
}))

let login: typeof import('../auth.js').login
let refresh: typeof import('../auth.js').refresh
let logout: typeof import('../auth.js').logout

const bcryptMock = (await import('bcrypt')).default as unknown as {
  compare: jest.Mock
}
const jwtMock = (await import('jsonwebtoken')).default as unknown as {
  sign: jest.Mock
  verify: jest.Mock
}
const usersService = await import('../../db/services/users.js')

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
  ; ({ login, refresh, logout } = await import('../auth.js'))
})

beforeEach(() => {
  jest.clearAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
  process.env.REFRESH_TOKEN_SECRET = 'refresh-secret'
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
    ; (usersService.getUserByName as JestMockFn).mockResolvedValue({
      active: false
    })
    const req = { body: { username: 'user', password: 'pass' } } as unknown as Request
    const res = createRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Неверный логин или пароль' })
  })

  it('returns 401 when password does not match', async () => {
    ; (usersService.getUserByName as JestMockFn).mockResolvedValue({
      name: 'user',
      roles: ['user'],
      password: 'hash',
      active: true
    })
      ; (bcryptMock.compare as JestMockFn).mockResolvedValue(false)
    const req = { body: { username: 'user', password: 'pass' } } as unknown as Request
    const res = createRes()

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Неверный логин или пароль' })
  })

  it('sets refresh cookie and returns access token on login', async () => {
    ; (usersService.getUserByName as JestMockFn).mockResolvedValue({
      name: 'user',
      roles: ['admin'],
      password: 'hash',
      active: true
    })
      ; (bcryptMock.compare as JestMockFn).mockResolvedValue(true)
    jwtMock.sign
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token')
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
    ; (jwtMock.verify as JestMockFnCallback).mockImplementation((...args) => {
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
    ; (jwtMock.verify as JestMockFnCallback).mockImplementation((...args) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { username: 'user' })
    })
      ; (usersService.getUserByName as JestMockFn).mockResolvedValue(null)
    const req = { cookies: { jwt: 'token' } } as unknown as Request
    const res = createRes()

    await refresh(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Пользователь не найден' })
  })

  it('returns access token when refresh token valid', async () => {
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { username: 'user' })
    });
    (usersService.getUserByName as JestMockFn).mockResolvedValue({
      name: 'user',
      roles: ['user']
    })
    jwtMock.sign.mockReturnValueOnce('new-access-token')
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
