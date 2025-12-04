import { Login } from '@/features/Auth'
import { useTitle } from '@/shared/hooks'

export function LoginPage() {
  useTitle('Логин')
  return <Login />
}
