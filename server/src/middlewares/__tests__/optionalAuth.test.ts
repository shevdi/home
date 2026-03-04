import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals'
import type { Response } from 'express'
import type { RequestWithAuth } from '@/types'

type JwtVerifyCallback = (err: Error | null, decoded: { username?: string; UserInfo?: { username?: string; roles?: string[] } } | null) => void

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}))

let optionalAuth: typeof import('../optionalAuth.js').optionalAuth

const jwtMock = (await import('jsonwebtoken')).default as unknown as {
  verify: jest.Mock
}

beforeAll(async () => {
  ;({ optionalAuth } = await import('../optionalAuth.js'))
})

beforeEach(() => {
  jest.clearAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
})

describe('optionalAuth middleware', () => {
  it('calls next when authorization header missing', () => {
    const req = { headers: {} } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(jwtMock.verify).not.toHaveBeenCalled()
  })

  it('calls next when authorization header is not Bearer', () => {
    const req = { headers: { authorization: 'Token abc' } } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(jwtMock.verify).not.toHaveBeenCalled()
  })

  it('calls next when jwt verification fails', () => {
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as JwtVerifyCallback
      cb(new Error('invalid'), null)
    })
    const req = { headers: { authorization: 'Bearer token' } } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(jwtMock.verify).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(req.auth).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('sets user info and calls next when jwt valid', () => {
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as JwtVerifyCallback
      cb(null, { UserInfo: { username: 'user', roles: ['admin'] } })
    })
    const req = { headers: { Authorization: 'Bearer token' } } as unknown as RequestWithAuth
    const res = {} as unknown as Response
    const next = jest.fn()

    optionalAuth(req, res, next)

    expect(jwtMock.verify).toHaveBeenCalledWith(
      'token',
      'access-secret',
      expect.any(Function)
    )
    expect(req.auth?.username).toBe('user')
    expect(req.auth?.roles).toEqual(['admin'])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
