import { useSelector } from 'react-redux'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { selectCurrentToken } from '@/features/Auth'

type Roles = 'user' | 'admin'

interface Decoded extends JwtPayload {
  UserInfo: {
    username: string;
    roles: Array<Roles>
  }
}


export const useAuth = () => {
  const token = useSelector(selectCurrentToken)
  let isUser = false
  let isAdmin = false
  let status = ''

  if (token) {
    const decoded: Decoded = jwtDecode(token)
    const { username, roles } = decoded.UserInfo

    isUser = roles.includes('user')
    isAdmin = roles.includes('admin')

    if (isUser) status = 'user'
    if (isAdmin) status = 'admin'
    console.log({ username, roles, status, isUser, isAdmin })

    return { username, roles, status, isUser, isAdmin }
  }

  return { username: '', roles: [], isUser, isAdmin, status }
}
