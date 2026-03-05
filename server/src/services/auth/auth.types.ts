import type { Request } from 'express'
import type { IUserInfo } from '@shevdi-home/shared'

/** Auth context attached to request by verifyJWT / optionalAuth middleware */
export type AuthContext = Partial<IUserInfo>

/** Request with optional auth context */
export type RequestWithAuth = Request & { auth?: AuthContext }
