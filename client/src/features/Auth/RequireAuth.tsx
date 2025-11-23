import { useAuth } from '@/hooks/useAuth'
import { useLocation, Navigate, Outlet } from 'react-router'

const RequireAuth = ({ allowedRoles }: { allowedRoles: Array<string> }) => {
  const location = useLocation()
  const { roles } = useAuth()

  const content = roles.some((role) => allowedRoles.includes(role)) ? (
    <Outlet />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  )

  return content
}
export default RequireAuth
