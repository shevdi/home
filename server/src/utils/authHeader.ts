import type { Request } from 'express'

export function getAuthHeader(req: Request): string | undefined {
  const val = req.headers.authorization ?? req.headers.Authorization
  return typeof val === 'string' ? val : undefined
}
