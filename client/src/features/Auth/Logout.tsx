import { useSendLogoutMutation } from './store/authApiSlice'
import { Button } from '@/components'

export function Logout() {
  const [sendLogout] = useSendLogoutMutation()

  return (
    <Button margin='1rem 0 0 0' onClick={sendLogout}>
      Выйти
    </Button>
  )
}
