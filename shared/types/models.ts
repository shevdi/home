import { type JwtPayload } from 'jsonwebtoken'

export type Roles = 'user' | 'admin' | 'guest'
export interface IUserInfo {
  username: string;
  roles: Array<Roles>
  /** MongoDB user document `_id` (hex), when issued by the auth server */
  userId?: string
}

export interface DecodedJwtPayload extends JwtPayload {
  UserInfo: IUserInfo
}
