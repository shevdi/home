import { useSelector } from 'react-redux'
import { jwtDecode } from 'jwt-decode'
import { selectCurrentToken } from '@/features/Auth'
import { DecodedJwtPayload } from '../types'

export const useAuth = () => {
  const token = useSelector(selectCurrentToken)
  let isUser = false
  let isAdmin = false
  let status = ''

  if (token) {
    const decoded = jwtDecode<DecodedJwtPayload>(token)
    const { username, roles } = decoded.UserInfo

    isUser = roles.includes('user')
    isAdmin = roles.includes('admin')

    if (isUser) status = 'user'
    if (isAdmin) status = 'admin'

    return { username, roles, status, isUser, isAdmin }
  }

  return { username: '', roles: [], isUser, isAdmin, status }
}
