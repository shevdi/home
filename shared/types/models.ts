import { type JwtPayload } from 'jsonwebtoken'

export type Roles = 'user' | 'admin' | 'guest'
export interface IUserInfo {
  username: string;
  roles: Array<Roles>
}

export interface DecodedJwtPayload extends JwtPayload {
  UserInfo: IUserInfo
}
