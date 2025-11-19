import { Login } from '@/features/Auth/Login'
import { useTitle } from '@/hooks'

export function LoginPage() {
  useTitle('Логин')
  return <Login />
}
