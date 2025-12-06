import { type JwtPayload } from 'jsonwebtoken'

export type Roles = 'user' | 'admin'
export interface IUserInfo {
  username: string;
  roles: Array<Roles>
}

export interface DecodedJwtPayload extends JwtPayload {
  UserInfo: IUserInfo
}
