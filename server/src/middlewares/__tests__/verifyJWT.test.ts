import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals'
import type { RequestWithAuth } from '@/services/auth';
import type { Request, Response } from 'express'

type JwtVerifyCallback = (err: Error | null, decoded: { username?: string; UserInfo?: { username?: string; roles?: string[] } } | null) => void

let verifyJWT: typeof import('../verifyJWT.js').verifyJWT
let jwtModule: Awaited<typeof import('jsonwebtoken')>

const createRes = (): Response => {
  const res = {
    status: jest.fn(),
    json: jest.fn()
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res as unknown as Response
}

beforeAll(async () => {
  const mod = await import('jsonwebtoken')
  jwtModule = mod
    ; ({ verifyJWT } = await import('../verifyJWT.js'))
})

const getJwt = () => (jwtModule as { default?: typeof jwtModule }).default ?? jwtModule

beforeEach(() => {
  jest.restoreAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('verifyJWT middleware', () => {
  it('returns 401 when authorization header missing and no jwt cookie', () => {
    const req = { headers: {} } as unknown as Request
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when authorization header missing but jwt cookie exists', () => {
    const req = { headers: { cookie: 'jwt=token' } } as unknown as Request
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when authorization header is not Bearer', () => {
    const req = { headers: { authorization: 'Token abc' } } as unknown as Request
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when jwt verification fails', () => {
    const verifySpy = jest.spyOn(getJwt(), 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(new Error('invalid'), null)
    })
    const req = { headers: { authorization: 'Bearer token' } } as unknown as Request
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(verifySpy).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' })
    expect(next).not.toHaveBeenCalled()
  })

  it('sets user info and calls next when jwt valid', () => {
    jest.spyOn(getJwt(), 'verify').mockImplementation((...args: unknown[]) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { UserInfo: { username: 'user', roles: ['admin'] } })
    })
    const req = { headers: { authorization: 'Bearer token' } } as unknown as RequestWithAuth
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(req.auth?.username).toBe('user')
    expect(req.auth?.roles).toEqual(['admin'])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
