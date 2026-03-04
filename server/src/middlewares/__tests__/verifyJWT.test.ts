import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals'
import type { Request, Response } from 'express'
import type { RequestWithAuth } from '@/types'

type JwtVerifyCallback = (err: Error | null, decoded: { username?: string; UserInfo?: { username?: string; roles?: string[] } } | null) => void

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}))

let verifyJWT: typeof import('../verifyJWT.js').verifyJWT

const jwtMock = (await import('jsonwebtoken')).default as unknown as {
  verify: jest.Mock
}

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
  ; ({ verifyJWT } = await import('../verifyJWT.js'))
})

beforeEach(() => {
  jest.clearAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
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
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as JwtVerifyCallback
      cb(new Error('invalid'), null)
    })
    const req = { headers: { authorization: 'Bearer token' } } as unknown as Request
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(jwtMock.verify).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' })
    expect(next).not.toHaveBeenCalled()
  })

  it('sets user info and calls next when jwt valid', () => {
    jwtMock.verify.mockImplementation((...args) => {
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
