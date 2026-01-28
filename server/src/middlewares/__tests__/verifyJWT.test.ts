import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals'

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn()
  }
}))

let verifyJWT: typeof import('../verifyJWT.js').verifyJWT

const jwtMock = (await import('jsonwebtoken')).default as unknown as {
  verify: jest.Mock
}

const createRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn()
  } as any
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

beforeAll(async () => {
  ;({ verifyJWT } = await import('../verifyJWT.js'))
})

beforeEach(() => {
  jest.clearAllMocks()
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
})

describe('verifyJWT middleware', () => {
  it('returns 401 when authorization header missing and no jwt cookie', () => {
    const req = { headers: {} } as any
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when authorization header missing but jwt cookie exists', () => {
    const req = { headers: { cookie: 'jwt=token' } } as any
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when authorization header is not Bearer', () => {
    const req = { headers: { authorization: 'Token abc' } } as any
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 when jwt verification fails', () => {
    jwtMock.verify.mockImplementation((...args) => {
      const cb = args[2] as (err: Error | null, decoded: any) => void
      cb(new Error('invalid'), null)
    })
    const req = { headers: { authorization: 'Bearer token' } } as any
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
      const cb = args[2] as (err: Error | null, decoded: any) => void
      cb(null, { UserInfo: { username: 'user', roles: ['admin'] } })
    })
    const req = { headers: { authorization: 'Bearer token' } } as any
    const res = createRes()
    const next = jest.fn()

    verifyJWT(req, res, next)

    expect(req.username).toBe('user')
    expect(req.roles).toEqual(['admin'])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
